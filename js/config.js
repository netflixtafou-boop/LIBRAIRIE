/**
 * ==============================================================================
 * 📚 LIBRAIRIE & PAPETERIE SCOLAIRE - CONFIGURATION GLOBALE
 * ==============================================================================
 */

const APP_CONFIG = {
  appName: "Lumina Librairie & Papeterie Scolaire",
  defaultCurrency: "FCFA",
  defaultAdminPassword: "admin123",
  
  // Clés LocalStorage pour persistance
  STORAGE_KEYS: {
    SUPABASE_URL: "lumina_supabase_url",
    SUPABASE_KEY: "lumina_supabase_anon_key",
    CATEGORIES: "lumina_categories_data",
    PRODUCTS: "lumina_products_data",
    ORDERS: "lumina_orders_data",
    SALES: "lumina_sales_data",
    ADMIN_SESSION: "lumina_admin_authenticated",
    STORE_SETTINGS: "lumina_store_settings"
  },

  // Données initiales par défaut (si Supabase n'est pas encore connecté)
  INITIAL_CATEGORIES: [
    {
      id: "cat-1",
      name: "Livres & Romans",
      slug: "livres-romans",
      description: "Littérature africaine, classiques mondiaux et romans contemporains",
      icon: "book-open",
      color: "#4F46E5",
      display_order: 1
    },
    {
      id: "cat-2",
      name: "Fournitures Scolaires",
      slug: "fournitures-scolaires",
      description: "Cahiers, trousses, stylos, règles et ensembles scolaires",
      icon: "pen-tool",
      color: "#D97706",
      display_order: 2
    },
    {
      id: "cat-3",
      name: "Manuels & Parascolaire",
      slug: "manuels-parascolaire",
      description: "Dictionnaires, annales, livres d'exercices et révisions",
      icon: "graduation-cap",
      color: "#10B981",
      display_order: 3
    },
    {
      id: "cat-4",
      name: "Jeunesse & Bandes Dessinées",
      slug: "jeunesse-bd",
      description: "Albums illustrés, contes pour enfants et bandes dessinées",
      icon: "smile",
      color: "#EC4899",
      display_order: 4
    },
    {
      id: "cat-5",
      name: "Papeterie & Bureau",
      slug: "papeterie-bureau",
      description: "Classeurs, ramettes A4, chemises cartonnées et accessoires",
      icon: "briefcase",
      color: "#6366F1",
      display_order: 5
    }
  ],

  INITIAL_PRODUCTS: [
    {
      id: "prod-1",
      title: "Une Si Longue Lettre",
      category_id: "cat-1",
      type: "livre",
      author: "Mariama Bâ",
      pages_count: 165,
      description: "Chef-d'œuvre de la littérature africaine. À travers la lettre que Ramatoulaye adresse à son amie Aïssatou, une réflexion bouleversante sur la condition féminine et les traditions.",
      price: 4500,
      promo_price: 4000,
      image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 25,
      is_active: true,
      sales_count: 18,
      isbn_code: "978-2842612894",
      created_at: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: "prod-2",
      title: "Le Petit Prince",
      category_id: "cat-1",
      type: "livre",
      author: "Antoine de Saint-Exupéry",
      pages_count: 120,
      description: "Un conte poétique et philosophique universel illustré de dessins de l'auteur. Une lecture incontournable pour petits et grands qui touche l'âme.",
      price: 3500,
      promo_price: null,
      image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 40,
      is_active: true,
      sales_count: 34,
      isbn_code: "978-2070612758",
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: "prod-3",
      title: "Pack Rentrée : 5 Cahiers 200 Pages + Trousse Bic",
      category_id: "cat-2",
      type: "fourniture",
      author: "Clairefontaine / Bic",
      pages_count: 200,
      description: "Pack économique complet pour la rentrée scolaire comprenant 5 grands cahiers 200 pages grand carreaux (Séyès) et une trousse garnie de stylos 4 couleurs, correcteur et règle 30cm.",
      price: 6500,
      promo_price: 5800,
      image_url: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 50,
      is_active: true,
      sales_count: 42,
      isbn_code: "PACK-RENTREE-2026",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: "prod-4",
      title: "Dictionnaire Larousse Illustré 2026",
      category_id: "cat-3",
      type: "livre",
      author: "Éditions Larousse",
      pages_count: 1280,
      description: "Le dictionnaire de référence avec plus de 64 000 mots, 28 000 noms propres et des planches illustrées en couleurs. Indispensable pour la réussite scolaire.",
      price: 16000,
      promo_price: 14500,
      image_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 12,
      is_active: true,
      sales_count: 9,
      isbn_code: "978-2035987123",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: "prod-5",
      title: "Calculatrice Scientifique FX-92 Spéciale Collège",
      category_id: "cat-2",
      type: "fourniture",
      author: "Casio",
      pages_count: 0,
      description: "La calculatrice incontournable pour les programmes du collège et du lycée. Menus entièrement en français, fractions, statistiques et résolutions d'équations.",
      price: 18500,
      promo_price: null,
      image_url: "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 15,
      is_active: true,
      sales_count: 14,
      isbn_code: "CASIO-FX92-FR",
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: "prod-6",
      title: "L'Étranger",
      category_id: "cat-1",
      type: "livre",
      author: "Albert Camus",
      pages_count: 184,
      description: "Prix Nobel de littérature. Un récit saisissant sur l'absurdité de l'existence, débutant par la célèbre phrase : 'Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas.'",
      price: 4200,
      promo_price: null,
      image_url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 18,
      is_active: true,
      sales_count: 16,
      isbn_code: "978-2070360024",
      created_at: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: "prod-7",
      title: "Les Aventures de Tintin : Le Lotus Bleu",
      category_id: "cat-4",
      type: "livre",
      author: "Hergé",
      pages_count: 64,
      description: "Album mythique en couleurs. Tintin part à la découverte de la Chine et déjoue un complot international dans une intrigue passionnante.",
      price: 7000,
      promo_price: null,
      image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 8,
      is_active: true,
      sales_count: 22,
      isbn_code: "978-2203001046",
      created_at: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: "prod-8",
      title: "Ramette Papier A4 80g Extra Blanc (500 feuilles)",
      category_id: "cat-5",
      type: "fourniture",
      author: "Navigator",
      pages_count: 500,
      description: "Papier de haute qualité avec blancheur extrême (CIE 169). Idéal pour les photocopies, impressions de thèses et devoirs d'école sans bourrage.",
      price: 4000,
      promo_price: null,
      image_url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",
      stock_quantity: 60,
      is_active: true,
      sales_count: 31,
      isbn_code: "NAVIGATOR-A4-80G",
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    }
  ],

  INITIAL_ORDERS: [
    {
      id: "ord-101",
      order_number: "CMD-2026-081",
      customer_name: "Amadou Diallo",
      customer_phone: "+221 77 452 89 12",
      customer_city: "Dakar",
      customer_address: "Mermoz, Rue MZ-45, Immeuble Horizon",
      notes: "Appeler avant de venir svp, je serai disponible à partir de 14h.",
      total_amount: 10500,
      payment_method: "Paiement à la livraison",
      status: "en_attente",
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      items: [
        { product_id: "prod-1", product_title: "Une Si Longue Lettre", quantity: 1, unit_price: 4000, subtotal: 4000 },
        { product_id: "prod-3", product_title: "Pack Rentrée : 5 Cahiers 200 Pages + Trousse Bic", quantity: 1, unit_price: 5800, subtotal: 5800 }
      ]
    },
    {
      id: "ord-102",
      order_number: "CMD-2026-080",
      customer_name: "Fatou Kiné Ndiaye",
      customer_phone: "+221 70 812 34 56",
      customer_city: "Thiès",
      customer_address: "Quartier Cité Senghor, Villa 128",
      notes: "Livraison à domicile pour les enfants.",
      total_amount: 14500,
      payment_method: "Paiement à la livraison",
      status: "confirmee",
      created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
      items: [
        { product_id: "prod-4", product_title: "Dictionnaire Larousse Illustré 2026", quantity: 1, unit_price: 14500, subtotal: 14500 }
      ]
    },
    {
      id: "ord-103",
      order_number: "CMD-2026-079",
      customer_name: "Ibrahima Sarr",
      customer_phone: "+221 76 991 00 23",
      customer_city: "Dakar",
      customer_address: "Almadies, Résidence Les Alizés",
      notes: "Paiement cash préparé à la réception.",
      total_amount: 18500,
      payment_method: "Paiement à la livraison",
      status: "livree",
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      items: [
        { product_id: "prod-5", product_title: "Calculatrice Scientifique FX-92 Spéciale Collège", quantity: 1, unit_price: 18500, subtotal: 18500 }
      ]
    }
  ],

  INITIAL_SALES: [
    {
      id: "sale-1",
      product_id: "prod-1",
      product_title: "Une Si Longue Lettre",
      quantity: 2,
      unit_price: 4000,
      total_amount: 8000,
      sale_type: "magasin_direct",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: "sale-2",
      product_id: "prod-3",
      product_title: "Pack Rentrée : 5 Cahiers 200 Pages + Trousse Bic",
      quantity: 3,
      unit_price: 5800,
      total_amount: 17400,
      sale_type: "magasin_direct",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: "sale-3",
      product_id: "prod-2",
      product_title: "Le Petit Prince",
      quantity: 1,
      unit_price: 3500,
      total_amount: 3500,
      sale_type: "magasin_direct",
      created_at: new Date(Date.now() - 6 * 86400000).toISOString()
    }
  ]
};

// ==========================================
// OUTILS ET FORMATEURS GLOBAUX
// ==========================================

function formatPrice(amount, currency = null) {
  const curr = currency || localStorage.getItem("lumina_currency") || APP_CONFIG.defaultCurrency;
  if (isNaN(amount) || amount === null) return `0 ${curr}`;
  const formatted = Math.round(amount).toLocaleString('fr-FR');
  return `${formatted} ${curr}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type} animate-fade-in`;
  
  let iconName = "check-circle";
  if (type === "error") iconName = "alert-circle";
  if (type === "info") iconName = "info";

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0"></i>
    <div class="text-sm font-medium leading-snug flex-1">${message}</div>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
