/**
 * ==============================================================================
 * 📚 LIBRAIRIE & PAPETERIE SCOLAIRE - GESTIONNAIRE DE DONNÉES & CLIENT SUPABASE
 * ==============================================================================
 * Connecte l'application à Supabase si configuré, ou bascule automatiquement
 * sur un stockage local réactif (LocalStorage) avec persistance totale.
 */

class DataManager {
  constructor() {
    this.supabase = null;
    this.isSupabaseConnected = false;
    this.init();
  }

  init() {
    const url = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_URL);
    const key = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_KEY);

    if (url && key && window.supabase) {
      try {
        this.supabase = window.supabase.createClient(url, key);
        this.isSupabaseConnected = true;
        console.log("⚡ Supabase connecté avec succès !");
      } catch (e) {
        console.warn("⚠️ Impossible d'initialiser Supabase. Mode LocalStorage actif :", e);
        this.isSupabaseConnected = false;
      }
    }

    // Initialisation du stockage local de secours
    this._ensureLocalStorageSeed();
  }

  _ensureLocalStorageSeed() {
    if (!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(APP_CONFIG.INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(APP_CONFIG.INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(APP_CONFIG.INITIAL_ORDERS));
    }
    if (!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SALES)) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SALES, JSON.stringify(APP_CONFIG.INITIAL_SALES));
    }
    if (!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.STORE_SETTINGS)) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.STORE_SETTINGS, JSON.stringify({
        store_name: "Lumina Librairie & Papeterie Scolaire",
        admin_password: APP_CONFIG.defaultAdminPassword,
        currency: APP_CONFIG.defaultCurrency
      }));
    }
  }

  // ==========================================
  // CONFIGURATION SUPABASE
  // ==========================================
  async configureSupabase(url, key) {
    if (!url || !key) {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_URL);
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_KEY);
      this.supabase = null;
      this.isSupabaseConnected = false;
      return { success: true, message: "Configuration Supabase réinitialisée en mode local." };
    }

    try {
      if (!window.supabase) {
        throw new Error("La bibliothèque Supabase JS n'est pas chargée.");
      }
      const client = window.supabase.createClient(url, key);
      // Test de requête simple
      const { data, error } = await client.from("categories").select("count", { count: "exact" }).limit(1);
      
      if (error && error.code !== "PGRST116") {
        throw new Error(error.message || "Erreur de connexion à Supabase.");
      }

      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_URL, url);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_KEY, key);
      this.supabase = client;
      this.isSupabaseConnected = true;

      return { success: true, message: "Connexion réussie à Supabase !" };
    } catch (err) {
      console.error("Erreur de validation Supabase :", err);
      return { success: false, message: err.message || "Erreur de connexion. Vérifiez vos clés et tables." };
    }
  }

  // ==========================================
  // CATÉGORIES
  // ==========================================
  async getCategories() {
    if (this.isSupabaseConnected) {
      try {
        const { data, error } = await this.supabase
          .from("categories")
          .select("*")
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn("Repli sur LocalStorage pour les catégories :", e);
      }
    }
    const local = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES);
    return local ? JSON.parse(local) : APP_CONFIG.INITIAL_CATEGORIES;
  }

  async saveCategory(category) {
    const categories = await this.getCategories();
    let updated;
    const isNew = !category.id || !categories.some(c => c.id === category.id);
    
    if (isNew) {
      category.id = category.id || "cat-" + Date.now();
      category.slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      category.display_order = categories.length + 1;
      updated = [...categories, category];
    } else {
      updated = categories.map(c => c.id === category.id ? { ...c, ...category } : c);
    }

    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));

    if (this.isSupabaseConnected) {
      try {
        await this.supabase.from("categories").upsert([category]);
      } catch (e) {
        console.error("Erreur d'enregistrement Supabase :", e);
      }
    }
    return category;
  }

  async deleteCategory(categoryId) {
    let categories = await this.getCategories();
    categories = categories.filter(c => c.id !== categoryId);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

    if (this.isSupabaseConnected) {
      try {
        await this.supabase.from("categories").delete().eq("id", categoryId);
      } catch (e) {
        console.error("Erreur de suppression Supabase :", e);
      }
    }
    return true;
  }

  // ==========================================
  // PRODUITS (LIVRES & FOURNITURES)
  // ==========================================
  async getProducts(onlyActive = false) {
    let list = [];
    if (this.isSupabaseConnected) {
      try {
        let query = this.supabase.from("products").select("*").order("created_at", { ascending: false });
        if (onlyActive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) list = data;
      } catch (e) {
        console.warn("Repli sur LocalStorage pour les produits :", e);
      }
    }

    if (list.length === 0) {
      const local = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
      list = local ? JSON.parse(local) : APP_CONFIG.INITIAL_PRODUCTS;
    }

    if (onlyActive) {
      return list.filter(p => p.is_active === true);
    }
    return list;
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async saveProduct(product) {
    const products = await this.getProducts();
    const isNew = !product.id || !products.some(p => p.id === product.id);

    // Castings nécessaires
    product.price = parseFloat(product.price) || 0;
    product.promo_price = product.promo_price ? parseFloat(product.promo_price) : null;
    product.pages_count = parseInt(product.pages_count, 10) || 0;
    product.stock_quantity = parseInt(product.stock_quantity, 10) || 0;
    product.sales_count = parseInt(product.sales_count, 10) || 0;
    product.is_active = product.is_active === true || product.is_active === "true";

    let updated;
    if (isNew) {
      product.id = product.id || "prod-" + Date.now();
      product.created_at = new Date().toISOString();
      updated = [product, ...products];
    } else {
      product.updated_at = new Date().toISOString();
      updated = products.map(p => p.id === product.id ? { ...p, ...product } : p);
    }

    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));

    if (this.isSupabaseConnected) {
      try {
        await this.supabase.from("products").upsert([product]);
      } catch (e) {
        console.error("Erreur de synchronisation Supabase produit :", e);
      }
    }
    return product;
  }

  async deleteProduct(productId) {
    let products = await this.getProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (this.isSupabaseConnected) {
      try {
        await this.supabase.from("products").delete().eq("id", productId);
      } catch (e) {
        console.error("Erreur suppression produit Supabase :", e);
      }
    }
    return true;
  }

  async toggleProductStatus(productId) {
    const product = await this.getProductById(productId);
    if (!product) return null;
    product.is_active = !product.is_active;
    return await this.saveProduct(product);
  }

  // ==========================================
  // VENTE DIRECTE EN MAGASIN / CAISSE
  // ==========================================
  async recordDirectSale(productId, quantity, customPrice = null) {
    const product = await this.getProductById(productId);
    if (!product) throw new Error("Produit introuvable.");

    quantity = parseInt(quantity, 10) || 1;
    if (product.stock_quantity < quantity) {
      throw new Error(`Stock insuffisant ! Il ne reste que ${product.stock_quantity} unité(s) en stock.`);
    }

    const unitPrice = customPrice !== null ? parseFloat(customPrice) : (product.promo_price || product.price);
    const totalAmount = unitPrice * quantity;

    // 1. Décrémenter le stock et incrémenter le nombre de ventes du produit
    product.stock_quantity -= quantity;
    product.sales_count = (product.sales_count || 0) + quantity;
    await this.saveProduct(product);

    // 2. Enregistrer la vente dans la table des ventes
    const saleEntry = {
      id: "sale-" + Date.now(),
      product_id: product.id,
      product_title: product.title,
      quantity: quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      sale_type: "magasin_direct",
      payment_method: "Espèces",
      created_at: new Date().toISOString()
    };

    const sales = await this.getSales();
    sales.unshift(saleEntry);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SALES, JSON.stringify(sales));

    if (this.isSupabaseConnected) {
      try {
        await this.supabase.from("sales").insert([saleEntry]);
      } catch (e) {
        console.error("Erreur ajout vente Supabase :", e);
      }
    }

    return saleEntry;
  }

  // ==========================================
  // COMMANDES (BOUTIQUE & ADMIN)
  // ==========================================
  async getOrders() {
    let list = [];
    if (this.isSupabaseConnected) {
      try {
        const { data, error } = await this.supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          list = data.map(o => ({
            ...o,
            items: o.order_items || []
          }));
        }
      } catch (e) {
        console.warn("Repli sur LocalStorage pour les commandes :", e);
      }
    }

    if (list.length === 0) {
      const local = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ORDERS);
      list = local ? JSON.parse(local) : APP_CONFIG.INITIAL_ORDERS;
    }
    return list;
  }

  async createOrder(orderData) {
    const count = (await this.getOrders()).length + 1;
    const orderNumber = `CMD-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;

    const newOrder = {
      id: "ord-" + Date.now(),
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_city: orderData.customer_city,
      customer_address: orderData.customer_address,
      notes: orderData.notes || "",
      total_amount: parseFloat(orderData.total_amount) || 0,
      payment_method: "Paiement à la livraison",
      status: "en_attente",
      created_at: new Date().toISOString(),
      items: orderData.items || []
    };

    const orders = await this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (this.isSupabaseConnected) {
      try {
        const { data: dbOrder, error: ordErr } = await this.supabase
          .from("orders")
          .insert([{
            order_number: newOrder.order_number,
            customer_name: newOrder.customer_name,
            customer_phone: newOrder.customer_phone,
            customer_city: newOrder.customer_city,
            customer_address: newOrder.customer_address,
            notes: newOrder.notes,
            total_amount: newOrder.total_amount,
            payment_method: newOrder.payment_method,
            status: newOrder.status
          }])
          .select()
          .single();

        if (!ordErr && dbOrder && newOrder.items.length > 0) {
          const itemsPayload = newOrder.items.map(it => ({
            order_id: dbOrder.id,
            product_id: it.product_id,
            product_title: it.product_title,
            quantity: it.quantity,
            unit_price: it.unit_price,
            subtotal: it.subtotal
          }));
          await this.supabase.from("order_items").insert(itemsPayload);
        }
      } catch (e) {
        console.error("Erreur enregistrement commande Supabase :", e);
      }
    }

    return newOrder;
  }

  async updateOrderStatus(orderId, newStatus) {
    const orders = await this.getOrders();
    const order = orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    // Si la commande passe à "livrée" et ne l'était pas avant, enregistrer la vente et décrémenter le stock
    if (newStatus === "livree" && previousStatus !== "livree") {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          try {
            const prod = await this.getProductById(item.product_id);
            if (prod) {
              prod.stock_quantity = Math.max(0, (prod.stock_quantity || 0) - item.quantity);
              prod.sales_count = (prod.sales_count || 0) + item.quantity;
              await this.saveProduct(prod);
            }
            // Enregistrement vente
            const saleEntry = {
              id: "sale-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
              product_id: item.product_id,
              product_title: item.product_title,
              order_id: order.id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_amount: item.subtotal,
              sale_type: "commande_en_ligne",
              payment_method: "Paiement à la livraison",
              created_at: new Date().toISOString()
            };
            const sales = await this.getSales();
            sales.unshift(saleEntry);
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SALES, JSON.stringify(sales));
          } catch (e) {
            console.error("Erreur mise à jour vente depuis commande :", e);
          }
        }
      }
    }

    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (this.isSupabaseConnected) {
      try {
        await this.supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      } catch (e) {
        console.error("Erreur mise à jour commande Supabase :", e);
      }
    }
    return order;
  }

  // ==========================================
  // VENTES & STATISTIQUES (FILTRES TEMPORELS)
  // ==========================================
  async getSales(period = "all") {
    let sales = [];
    if (this.isSupabaseConnected) {
      try {
        const { data, error } = await this.supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) sales = data;
      } catch (e) {
        console.warn("Repli sur LocalStorage pour les ventes :", e);
      }
    }

    if (sales.length === 0) {
      const local = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SALES);
      sales = local ? JSON.parse(local) : APP_CONFIG.INITIAL_SALES;
    }

    if (period === "all") return sales;

    const now = new Date();
    return sales.filter(s => {
      const saleDate = new Date(s.created_at);
      if (period === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return saleDate >= sevenDaysAgo;
      } else if (period === "month") {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      } else if (period === "year") {
        return saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  // Paramètres & Authentification
  getSettings() {
    const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.STORE_SETTINGS);
    return raw ? JSON.parse(raw) : {
      store_name: APP_CONFIG.appName,
      admin_password: APP_CONFIG.defaultAdminPassword,
      currency: APP_CONFIG.defaultCurrency
    };
  }

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(updated));
    if (newSettings.currency) {
      localStorage.setItem("lumina_currency", newSettings.currency);
    }
    return updated;
  }
}

// Instance globale singleton
window.dataManager = new DataManager();
