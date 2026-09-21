/**
 * ==============================================================================
 * 📚 LIBRAIRIE & PAPETERIE SCOLAIRE - CLIENT DIRECT SUPABASE
 * ==============================================================================
 * 100% SUPABASE RÉEL : Pas de simulation locale. Tout est lu et écrit en base de données.
 */

class DataManager {
  constructor() {
    this.supabase = null;
    this.isSupabaseConnected = false;
    this.init();
  }

  init() {
    // 1. Priorité à la configuration dans js/config.js, sinon localStorage
    const url = (APP_CONFIG.SUPABASE_URL && APP_CONFIG.SUPABASE_URL.trim() !== "") 
      ? APP_CONFIG.SUPABASE_URL.trim() 
      : (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_URL) || "").trim();

    const key = (APP_CONFIG.SUPABASE_ANON_KEY && APP_CONFIG.SUPABASE_ANON_KEY.trim() !== "") 
      ? APP_CONFIG.SUPABASE_ANON_KEY.trim() 
      : (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_KEY) || "").trim();

    if (url && key && window.supabase) {
      try {
        this.supabase = window.supabase.createClient(url, key);
        this.isSupabaseConnected = true;
        console.log("⚡ Supabase connecté avec succès !");
      } catch (e) {
        console.error("❌ Erreur d'initialisation du client Supabase :", e);
        this.isSupabaseConnected = false;
      }
    } else {
      this.isSupabaseConnected = false;
    }
  }

  _checkConnection() {
    if (!this.isSupabaseConnected || !this.supabase) {
      throw new Error("Base de données Supabase non connectée. Veuillez renseigner l'URL et la Clé Anon dans l'onglet 'Supabase & Réglages' ou dans js/config.js.");
    }
  }

  // ==========================================
  // CONFIGURATION SUPABASE
  // ==========================================
  async configureSupabase(url, key) {
    url = (url || "").trim();
    key = (key || "").trim();

    if (!url || !key) {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_URL);
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_KEY);
      this.supabase = null;
      this.isSupabaseConnected = false;
      return { success: false, message: "URL ou Clé Anon manquante." };
    }

    try {
      if (!window.supabase) {
        throw new Error("La bibliothèque Supabase JS n'est pas chargée.");
      }
      const client = window.supabase.createClient(url, key);
      
      // Test de requête réel sur la table categories
      const { data, error } = await client.from("categories").select("id").limit(1);
      
      if (error) {
        throw new Error(`Erreur Supabase (${error.code || ''}): ${error.message}. Vérifiez que vous avez bien exécuté le script SQL 'sql/supabase_schema.sql' dans l'éditeur SQL de Supabase.`);
      }

      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_URL, url);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_KEY, key);
      this.supabase = client;
      this.isSupabaseConnected = true;

      return { success: true, message: "✅ Connexion réussie à Supabase ! Vos données sont en ligne." };
    } catch (err) {
      console.error("Erreur de validation Supabase :", err);
      return { success: false, message: err.message || "Erreur de connexion à Supabase." };
    }
  }

  // ==========================================
  // MOT DE PASSE ADMIN CENTRALISÉ DANS SUPABASE
  // ==========================================
  async getAdminPassword() {
    if (!this.isSupabaseConnected) {
      return localStorage.getItem("lumina_admin_password") || "admin123";
    }

    try {
      const { data, error } = await this.supabase
        .from("settings")
        .select("value")
        .eq("key", "admin_password")
        .maybeSingle();

      if (!error && data && data.value) {
        localStorage.setItem("lumina_admin_password", data.value);
        return data.value;
      }
    } catch (e) {
      console.warn("Lecture mot de passe Supabase :", e);
    }

    return localStorage.getItem("lumina_admin_password") || "admin123";
  }

  async setAdminPassword(newPassword) {
    newPassword = (newPassword || "").trim();
    if (!newPassword) throw new Error("Le mot de passe ne peut pas être vide.");

    this._checkConnection();

    const { error } = await this.supabase
      .from("settings")
      .upsert({
        key: "admin_password",
        value: newPassword,
        description: "Mot de passe administrateur",
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });

    if (error) {
      throw new Error(`Erreur Supabase lors du changement de mot de passe: ${error.message}`);
    }

    localStorage.setItem("lumina_admin_password", newPassword);
    return true;
  }

  // ==========================================
  // CATÉGORIES (CRUD SUPABASE RÉEL)
  // ==========================================
  async getCategories() {
    this._checkConnection();

    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Impossible de charger les catégories : ${error.message}`);
    }

    return data || [];
  }

  async saveCategory(category) {
    this._checkConnection();

    const name = (category.name || "").trim();
    if (!name) throw new Error("Le nom de la catégorie est obligatoire.");

    // Génération automatique du slug propre
    const slug = (category.slug || name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const payload = {
      name: name,
      slug: slug,
      description: category.description ? category.description.trim() : null,
      color: category.color || "#4F46E5",
      icon: category.icon || "book-open"
    };

    if (category.id && category.id.trim() !== "") {
      // Modification
      const { data, error } = await this.supabase
        .from("categories")
        .update(payload)
        .eq("id", category.id)
        .select();

      if (error) {
        throw new Error(`Erreur modification catégorie (${error.code}) : ${error.message}`);
      }
      return data[0];
    } else {
      // Nouvelle catégorie
      const { data, error } = await this.supabase
        .from("categories")
        .insert([payload])
        .select();

      if (error) {
        throw new Error(`Erreur création catégorie (${error.code}) : ${error.message}`);
      }
      return data[0];
    }
  }

  async deleteCategory(categoryId) {
    this._checkConnection();

    const { error } = await this.supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      throw new Error(`Erreur suppression catégorie : ${error.message}`);
    }
    return true;
  }

  // ==========================================
  // PRODUITS / LIVRES (CRUD SUPABASE RÉEL)
  // ==========================================
  async getProducts(onlyActive = false) {
    this._checkConnection();

    let query = this.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Impossible de charger les produits : ${error.message}`);
    }

    return data || [];
  }

  async getProductById(id) {
    this._checkConnection();

    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(`Article introuvable : ${error.message}`);
    return data;
  }

  async saveProduct(product) {
    this._checkConnection();

    const title = (product.title || "").trim();
    if (!title) throw new Error("Le titre du livre ou de l'article est requis.");

    const payload = {
      title: title,
      category_id: (product.category_id && product.category_id !== "all") ? product.category_id : null,
      type: product.type || "livre",
      author: product.author ? product.author.trim() : null,
      pages_count: parseInt(product.pages_count, 10) || 0,
      description: product.description ? product.description.trim() : "",
      price: parseFloat(product.price) || 0,
      promo_price: product.promo_price ? parseFloat(product.promo_price) : null,
      image_url: product.image_url ? product.image_url.trim() : null,
      stock_quantity: parseInt(product.stock_quantity, 10) || 0,
      is_active: product.is_active === true || product.is_active === "true",
      updated_at: new Date().toISOString()
    };

    if (product.id && product.id.trim() !== "") {
      // Modification
      const { data, error } = await this.supabase
        .from("products")
        .update(payload)
        .eq("id", product.id)
        .select();

      if (error) {
        throw new Error(`Erreur lors de la modification du produit : ${error.message}`);
      }
      return data[0];
    } else {
      // Création
      payload.sales_count = 0;
      const { data, error } = await this.supabase
        .from("products")
        .insert([payload])
        .select();

      if (error) {
        throw new Error(`Erreur lors de la création du produit : ${error.message}`);
      }
      return data[0];
    }
  }

  async deleteProduct(productId) {
    this._checkConnection();

    const { error } = await this.supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      throw new Error(`Erreur suppression produit : ${error.message}`);
    }
    return true;
  }

  async toggleProductStatus(productId, currentStatus) {
    this._checkConnection();

    const { data, error } = await this.supabase
      .from("products")
      .update({ is_active: !currentStatus })
      .eq("id", productId)
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  }

  // ==========================================
  // VENTE DIRECTE MAGASIN / CAISSE
  // ==========================================
  async recordDirectSale(productId, quantity, customPrice = null, paymentMethod = "Espèces") {
    this._checkConnection();

    const product = await this.getProductById(productId);
    if (!product) throw new Error("Produit introuvable.");

    quantity = parseInt(quantity, 10) || 1;
    if (product.stock_quantity < quantity) {
      throw new Error(`Stock insuffisant ! Il ne reste que ${product.stock_quantity} unité(s).`);
    }

    const unitPrice = customPrice !== null ? parseFloat(customPrice) : (product.promo_price || product.price);
    const totalAmount = unitPrice * quantity;

    // 1. Décrémenter stock et incrémenter ventes dans la table products de Supabase
    const newStock = Math.max(0, product.stock_quantity - quantity);
    const newSalesCount = (product.sales_count || 0) + quantity;

    const { error: prodErr } = await this.supabase
      .from("products")
      .update({
        stock_quantity: newStock,
        sales_count: newSalesCount,
        updated_at: new Date().toISOString()
      })
      .eq("id", product.id);

    if (prodErr) throw new Error(`Erreur mise à jour stock produit : ${prodErr.message}`);

    // 2. Insérer la vente dans la table sales de Supabase
    const { data: saleData, error: saleErr } = await this.supabase
      .from("sales")
      .insert([{
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        sale_type: "magasin_direct",
        payment_method: paymentMethod || "Espèces"
      }])
      .select();

    if (saleErr) throw new Error(`Erreur enregistrement de la vente : ${saleErr.message}`);

    return saleData[0];
  }

  // ==========================================
  // COMMANDES (BOUTIQUE & ADMIN)
  // ==========================================
  async getOrders() {
    this._checkConnection();

    const { data, error } = await this.supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Impossible de récupérer les commandes : ${error.message}`);

    return (data || []).map(o => ({
      ...o,
      items: o.order_items || []
    }));
  }

  async createOrder(orderData) {
    this._checkConnection();

    const orderNumber = `CMD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const { data: dbOrder, error: ordErr } = await this.supabase
      .from("orders")
      .insert([{
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_city: orderData.customer_city,
        customer_address: orderData.customer_address,
        notes: orderData.notes || "",
        total_amount: parseFloat(orderData.total_amount) || 0,
        payment_method: "Paiement à la livraison",
        status: "en_attente"
      }])
      .select()
      .single();

    if (ordErr) throw new Error(`Erreur création de la commande : ${ordErr.message}`);

    if (orderData.items && orderData.items.length > 0) {
      const itemsPayload = orderData.items.map(it => ({
        order_id: dbOrder.id,
        product_id: it.product_id || null,
        product_title: it.product_title,
        quantity: it.quantity,
        unit_price: it.unit_price,
        subtotal: it.subtotal
      }));

      const { error: itemsErr } = await this.supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsErr) console.error("Erreur insertion articles de commande :", itemsErr);
    }

    return dbOrder;
  }

  async updateOrderStatus(orderId, newStatus) {
    this._checkConnection();

    const { data: order, error } = await this.supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .select("*, order_items(*)")
      .single();

    if (error) throw new Error(`Erreur mise à jour commande : ${error.message}`);

    // Si la commande passe à "livrée", décrémenter le stock et insérer dans les ventes
    if (newStatus === "livree" && order && order.order_items) {
      for (const item of order.order_items) {
        if (item.product_id) {
          try {
            const prod = await this.getProductById(item.product_id);
            if (prod) {
              const newStock = Math.max(0, prod.stock_quantity - item.quantity);
              const newSales = (prod.sales_count || 0) + item.quantity;
              await this.supabase.from("products").update({
                stock_quantity: newStock,
                sales_count: newSales
              }).eq("id", prod.id);
            }

            await this.supabase.from("sales").insert([{
              product_id: item.product_id,
              order_id: order.id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_amount: item.subtotal,
              sale_type: "commande_en_ligne",
              payment_method: "Paiement à la livraison"
            }]);
          } catch (e) {
            console.error("Erreur enregistrement vente depuis commande livrée :", e);
          }
        }
      }
    }

    return order;
  }

  // ==========================================
  // VENTES & STATISTIQUES & HISTORIQUE COMPLET
  // ==========================================
  async getSales(period = "all", type = null) {
    this._checkConnection();

    let query = this.supabase
      .from("sales")
      .select("*, products(title, author, image_url, type, price)")
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("sale_type", type);
    }

    const { data, error } = await query;
    let sales = [];

    if (error) {
      // Fallback si la jointure products n'est pas reconnue
      const { data: rawData, error: rawErr } = await this.supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });

      if (rawErr) throw new Error(`Erreur chargement des ventes : ${rawErr.message}`);
      sales = rawData || [];
    } else {
      sales = (data || []).map(s => ({
        ...s,
        product_title: s.products ? s.products.title : "Article direct",
        product_image: s.products ? s.products.image_url : null,
        product_type: s.products ? s.products.type : "livre"
      }));
    }

    if (type) {
      sales = sales.filter(s => s.sale_type === type);
    }

    return this._filterSalesByPeriod(sales, period);
  }

  _filterSalesByPeriod(sales, period) {
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

  async deleteSale(saleId) {
    this._checkConnection();

    // 1. Récupérer la vente pour recréditer le stock
    const { data: sale, error: getErr } = await this.supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (getErr || !sale) throw new Error("Vente introuvable.");

    // 2. Si un article y est lié, réintégrer le stock
    if (sale.product_id) {
      try {
        const prod = await this.getProductById(sale.product_id);
        if (prod) {
          const restoredStock = (prod.stock_quantity || 0) + (sale.quantity || 1);
          const restoredSales = Math.max(0, (prod.sales_count || 0) - (sale.quantity || 1));
          await this.supabase
            .from("products")
            .update({ stock_quantity: restoredStock, sales_count: restoredSales })
            .eq("id", prod.id);
        }
      } catch (e) {
        console.warn("Erreur réintégration stock :", e);
      }
    }

    // 3. Supprimer de Supabase
    const { error: delErr } = await this.supabase
      .from("sales")
      .delete()
      .eq("id", saleId);

    if (delErr) throw new Error(`Erreur suppression vente : ${delErr.message}`);
    return true;
  }
}

// Instance globale unique
window.dataManager = new DataManager();
