/**
 * ==============================================================================
 * 📚 LIBRAIRIE & PAPETERIE SCOLAIRE - TABLEAU DE BORD ADMINISTRATEUR COMPLET
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 1. GESTION DE L'AUTHENTIFICATION
  const authGate = document.getElementById("auth-gate");
  const adminMain = document.getElementById("admin-main");
  const authForm = document.getElementById("auth-form");
  const authPassword = document.getElementById("auth-password");
  const authError = document.getElementById("auth-error");
  const logoutBtn = document.getElementById("logout-btn");

  function isAuthenticated() {
    return sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_SESSION) === "true";
  }

  function checkAuth() {
    if (isAuthenticated()) {
      if (authGate) authGate.classList.add("hidden");
      if (adminMain) adminMain.classList.remove("hidden");
      initDashboard();
    } else {
      if (authGate) authGate.classList.remove("hidden");
      if (adminMain) adminMain.classList.add("hidden");
      if (authPassword) authPassword.focus();
    }
  }

  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const settings = window.dataManager.getSettings();
      const entered = authPassword.value.trim();
      const validPass = settings.admin_password || APP_CONFIG.defaultAdminPassword;

      if (entered === validPass) {
        sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.ADMIN_SESSION, "true");
        authError.classList.add("hidden");
        checkAuth();
        showToast("Bienvenue dans votre espace d'administration !", "success");
      } else {
        authError.classList.remove("hidden");
        authPassword.value = "";
        authPassword.focus();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ADMIN_SESSION);
      checkAuth();
      showToast("Vous avez été déconnecté.", "info");
    });
  }

  // 2. NAVIGATION ENTRE LES ONGLETS
  const navTabs = document.querySelectorAll(".admin-nav-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  function switchTab(tabId) {
    navTabs.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add("bg-amber-600", "text-white");
        btn.classList.remove("text-slate-600", "hover:bg-slate-100");
      } else {
        btn.classList.remove("bg-amber-600", "text-white");
        btn.classList.add("text-slate-600", "hover:bg-slate-100");
      }
    });

    tabContents.forEach(tab => {
      if (tab.id === `tab-${tabId}`) {
        tab.classList.remove("hidden");
      } else {
        tab.classList.add("hidden");
      }
    });

    if (tabId === "stats") {
      renderStatsCharts();
    }
  }

  navTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });

  // 3. INITIALISATION DU DASHBOARD
  let categories = [];
  let products = [];
  let orders = [];
  let sales = [];
  let currentStatsFilter = "all";
  let chartRevenue = null;
  let chartCategories = null;
  let chartTopProducts = null;

  async function initDashboard() {
    await loadAllData();
    renderKpiMetrics();
    renderProductsTable();
    renderCategoriesTable();
    renderOrdersTable();
    populateCategorySelects();
    populatePOSProductSelect();
    renderStatsCharts();
  }

  async function loadAllData() {
    [categories, products, orders, sales] = await Promise.all([
      window.dataManager.getCategories(),
      window.dataManager.getProducts(false),
      window.dataManager.getOrders(),
      window.dataManager.getSales("all")
    ]);
  }

  // 4. METRIQUES KPI & DASHBOARD
  function renderKpiMetrics() {
    const totalSalesRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0);
    const totalSalesCount = sales.reduce((sum, s) => sum + (parseInt(s.quantity, 10) || 0), 0);
    const pendingOrdersCount = orders.filter(o => o.status === "en_attente").length;
    const lowStockCount = products.filter(p => p.stock_quantity <= 5).length;

    const kpiRevenue = document.getElementById("kpi-revenue");
    const kpiSales = document.getElementById("kpi-sales");
    const kpiOrders = document.getElementById("kpi-orders");
    const kpiLowStock = document.getElementById("kpi-low-stock");

    if (kpiRevenue) kpiRevenue.textContent = formatPrice(totalSalesRevenue);
    if (kpiSales) kpiSales.textContent = `${totalSalesCount} article(s)`;
    if (kpiOrders) kpiOrders.textContent = `${pendingOrdersCount} à traiter`;
    if (kpiLowStock) kpiLowStock.textContent = `${lowStockCount} article(s)`;
  }

  // 5. GESTION DU CATALOGUE (LIVRES & ARTICLES)
  const productsTableBody = document.getElementById("products-table-body");
  const productModal = document.getElementById("product-modal");
  const productForm = document.getElementById("product-form");
  const btnNewProduct = document.getElementById("btn-new-product");
  const closeProductModal = document.getElementById("close-product-modal");
  const productSearch = document.getElementById("admin-product-search");
  const productCategoryFilter = document.getElementById("admin-product-cat-filter");

  function renderProductsTable() {
    if (!productsTableBody) return;
    productsTableBody.innerHTML = "";

    const search = (productSearch ? productSearch.value : "").trim().toLowerCase();
    const catFilter = productCategoryFilter ? productCategoryFilter.value : "all";

    const filtered = products.filter(p => {
      const matchSearch = !search || 
        p.title.toLowerCase().includes(search) || 
        (p.author && p.author.toLowerCase().includes(search));
      const matchCat = catFilter === "all" || p.category_id === catFilter;
      return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-slate-400">
            <i data-lucide="package-search" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
            Aucun article trouvé pour ces critères.
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filtered.forEach(p => {
      const cat = categories.find(c => c.id === p.category_id);
      const isBook = p.type === "livre";

      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-100 hover:bg-amber-50/30 transition text-sm";
      tr.innerHTML = `
        <td class="px-5 py-3.5">
          <div class="flex items-center gap-3">
            <img src="${p.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}" 
                 class="w-11 h-14 object-cover rounded-lg shadow-sm border border-slate-200 flex-shrink-0" 
                 alt="${p.title}"
                 onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
            <div>
              <div class="font-bold text-slate-900 leading-snug line-clamp-1">${p.title}</div>
              <div class="text-xs text-slate-500">${p.author || (isBook ? 'Auteur inconnu' : 'Fourniture')}</div>
              ${p.pages_count && p.pages_count > 0 ? `
                <span class="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold mt-0.5">
                  <i data-lucide="book-open" class="w-3 h-3"></i> ${p.pages_count} pages
                </span>
              ` : ''}
            </div>
          </div>
        </td>
        <td class="px-5 py-3.5">
          <span class="px-2.5 py-1 rounded-md text-xs font-semibold" style="background-color: ${cat ? cat.color + '20' : '#EEF2FF'}; color: ${cat ? cat.color : '#4F46E5'}">
            ${cat ? cat.name : 'Général'}
          </span>
        </td>
        <td class="px-5 py-3.5">
          <div class="font-bold text-slate-800">${formatPrice(p.price)}</div>
          ${p.promo_price ? `<div class="text-xs text-amber-700 font-medium">Promo: ${formatPrice(p.promo_price)}</div>` : ''}
        </td>
        <td class="px-5 py-3.5 text-center">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${p.stock_quantity <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
            ${p.stock_quantity} en stock
          </span>
          <div class="text-[11px] text-slate-400 mt-1">${p.sales_count || 0} vendus</div>
        </td>
        <td class="px-5 py-3.5 text-center">
          <button class="btn-toggle-status px-2.5 py-1 rounded-full text-xs font-bold transition ${p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-300'}" data-id="${p.id}">
            ${p.is_active ? 'Actif en boutique' : 'Masqué'}
          </button>
        </td>
        <td class="px-5 py-3.5 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <!-- Vente directe rapide -->
            <button class="btn-quick-sale p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition" data-id="${p.id}" title="Enregistrer une vente directe en caisse">
              <i data-lucide="shopping-cart" class="w-4 h-4"></i>
            </button>
            <!-- Modifier -->
            <button class="btn-edit-prod p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition" data-id="${p.id}" title="Modifier l'article">
              <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
            <!-- Supprimer -->
            <button class="btn-delete-prod p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition" data-id="${p.id}" title="Supprimer">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;

      // Événements boutons de ligne
      tr.querySelector(".btn-toggle-status").addEventListener("click", async () => {
        await window.dataManager.toggleProductStatus(p.id);
        await refreshAll();
        showToast("Statut de visibilité mis à jour.", "info");
      });

      tr.querySelector(".btn-quick-sale").addEventListener("click", () => {
        openQuickSaleModal(p);
      });

      tr.querySelector(".btn-edit-prod").addEventListener("click", () => {
        openProductModal(p);
      });

      tr.querySelector(".btn-delete-prod").addEventListener("click", async () => {
        if (confirm(`Confirmez-vous la suppression de l'article "${p.title}" ?`)) {
          await window.dataManager.deleteProduct(p.id);
          await refreshAll();
          showToast("Article supprimé.", "success");
        }
      });

      productsTableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openProductModal(prod = null) {
    productForm.reset();
    populateCategorySelects();

    if (prod) {
      document.getElementById("prod-modal-title").textContent = "Modifier l'article / livre";
      document.getElementById("prod-id").value = prod.id;
      document.getElementById("prod-title").value = prod.title;
      document.getElementById("prod-category").value = prod.category_id || "";
      document.getElementById("prod-type").value = prod.type || "livre";
      document.getElementById("prod-author").value = prod.author || "";
      document.getElementById("prod-pages").value = prod.pages_count || 0;
      document.getElementById("prod-price").value = prod.price;
      document.getElementById("prod-promo").value = prod.promo_price || "";
      document.getElementById("prod-stock").value = prod.stock_quantity;
      document.getElementById("prod-image").value = prod.image_url || "";
      document.getElementById("prod-desc").value = prod.description || "";
      document.getElementById("prod-active").checked = prod.is_active;
    } else {
      document.getElementById("prod-modal-title").textContent = "Ajouter un nouveau livre ou article";
      document.getElementById("prod-id").value = "";
      document.getElementById("prod-pages").value = 0;
      document.getElementById("prod-stock").value = 10;
      document.getElementById("prod-active").checked = true;
    }

    productModal.classList.remove("hidden");
    productModal.classList.add("flex");
  }

  function closeProdModal() {
    productModal.classList.add("hidden");
    productModal.classList.remove("flex");
  }

  if (btnNewProduct) btnNewProduct.addEventListener("click", () => openProductModal(null));
  if (closeProductModal) closeProductModal.addEventListener("click", closeProdModal);

  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("prod-id").value;
      const title = document.getElementById("prod-title").value.trim();
      const category_id = document.getElementById("prod-category").value;
      const type = document.getElementById("prod-type").value;
      const author = document.getElementById("prod-author").value.trim();
      const pages_count = parseInt(document.getElementById("prod-pages").value, 10) || 0;
      const price = parseFloat(document.getElementById("prod-price").value) || 0;
      const promo_price = document.getElementById("prod-promo").value ? parseFloat(document.getElementById("prod-promo").value) : null;
      const stock_quantity = parseInt(document.getElementById("prod-stock").value, 10) || 0;
      const image_url = document.getElementById("prod-image").value.trim();
      const description = document.getElementById("prod-desc").value.trim();
      const is_active = document.getElementById("prod-active").checked;

      const payload = {
        id: id || undefined,
        title,
        category_id,
        type,
        author,
        pages_count,
        price,
        promo_price,
        stock_quantity,
        image_url,
        description,
        is_active
      };

      await window.dataManager.saveProduct(payload);
      closeProdModal();
      await refreshAll();
      showToast(id ? "Article modifié avec succès !" : "Nouvel article ajouté au catalogue !", "success");
    });
  }

  if (productSearch) productSearch.addEventListener("input", renderProductsTable);
  if (productCategoryFilter) productCategoryFilter.addEventListener("change", renderProductsTable);

  // 6. GESTION DES CATÉGORIES
  const categoriesTableBody = document.getElementById("categories-table-body");
  const categoryModal = document.getElementById("category-modal");
  const categoryForm = document.getElementById("category-form");
  const btnNewCategory = document.getElementById("btn-new-category");
  const closeCategoryModal = document.getElementById("close-category-modal");

  function renderCategoriesTable() {
    if (!categoriesTableBody) return;
    categoriesTableBody.innerHTML = "";

    categories.forEach(c => {
      const prodCount = products.filter(p => p.category_id === c.id).length;
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-100 hover:bg-slate-50 transition text-sm";
      tr.innerHTML = `
        <td class="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background-color: ${c.color || '#4F46E5'}"></span>
          <i data-lucide="${c.icon || 'book'}" class="w-4 h-4 text-slate-500"></i>
          ${c.name}
        </td>
        <td class="px-5 py-3.5 text-slate-500 text-xs">${c.description || '-'}</td>
        <td class="px-5 py-3.5 text-center font-bold text-slate-700">${prodCount}</td>
        <td class="px-5 py-3.5 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button class="btn-edit-cat p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition" data-id="${c.id}">
              <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
            <button class="btn-delete-cat p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition" data-id="${c.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;

      tr.querySelector(".btn-edit-cat").addEventListener("click", () => openCatModal(c));
      tr.querySelector(".btn-delete-cat").addEventListener("click", async () => {
        if (confirm(`Supprimer la catégorie "${c.name}" ? Les produits associés ne seront pas supprimés.`)) {
          await window.dataManager.deleteCategory(c.id);
          await refreshAll();
          showToast("Catégorie supprimée.", "success");
        }
      });

      categoriesTableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openCatModal(cat = null) {
    categoryForm.reset();
    if (cat) {
      document.getElementById("cat-modal-title").textContent = "Modifier la catégorie";
      document.getElementById("cat-id").value = cat.id;
      document.getElementById("cat-name").value = cat.name;
      document.getElementById("cat-desc").value = cat.description || "";
      document.getElementById("cat-color").value = cat.color || "#4F46E5";
      document.getElementById("cat-icon").value = cat.icon || "book-open";
    } else {
      document.getElementById("cat-modal-title").textContent = "Créer une nouvelle catégorie";
      document.getElementById("cat-id").value = "";
      document.getElementById("cat-color").value = "#D97706";
      document.getElementById("cat-icon").value = "book-open";
    }
    categoryModal.classList.remove("hidden");
    categoryModal.classList.add("flex");
  }

  function closeCatModal() {
    categoryModal.classList.add("hidden");
    categoryModal.classList.remove("flex");
  }

  if (btnNewCategory) btnNewCategory.addEventListener("click", () => openCatModal(null));
  if (closeCategoryModal) closeCategoryModal.addEventListener("click", closeCatModal);

  if (categoryForm) {
    categoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("cat-id").value;
      const name = document.getElementById("cat-name").value.trim();
      const description = document.getElementById("cat-desc").value.trim();
      const color = document.getElementById("cat-color").value;
      const icon = document.getElementById("cat-icon").value;

      await window.dataManager.saveCategory({
        id: id || undefined,
        name,
        description,
        color,
        icon
      });

      closeCatModal();
      await refreshAll();
      showToast("Catégorie enregistrée !", "success");
    });
  }

  // 7. GESTION DES COMMANDES (PAIEMENT À LA LIVRAISON)
  const ordersTableBody = document.getElementById("orders-table-body");
  const orderStatusFilter = document.getElementById("admin-order-status-filter");

  function renderOrdersTable() {
    if (!ordersTableBody) return;
    ordersTableBody.innerHTML = "";

    const filter = orderStatusFilter ? orderStatusFilter.value : "all";
    const filtered = orders.filter(o => filter === "all" || o.status === filter);

    if (filtered.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-slate-400">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
            Aucune commande dans cette catégorie.
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filtered.forEach(o => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-100 hover:bg-slate-50 transition text-sm";

      let statusBadge = "";
      if (o.status === "en_attente") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> À confirmer</span>`;
      } else if (o.status === "confirmee") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 w-max">Confirmée</span>`;
      } else if (o.status === "en_livraison") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 w-max">En livraison</span>`;
      } else if (o.status === "livree") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 w-max">Livrée & Payée</span>`;
      } else if (o.status === "annulee") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 w-max">Annulée</span>`;
      }

      // Nettoyer numéro de téléphone pour WhatsApp/Call
      const cleanPhone = o.customer_phone.replace(/[^0-9+]/g, "");

      const itemsSummary = (o.items && o.items.length > 0)
        ? o.items.map(it => `<div class="truncate text-xs font-medium text-slate-800">• ${it.quantity}x ${it.product_title}</div>`).join("")
        : `<div class="text-xs text-slate-400">Articles divers</div>`;

      tr.innerHTML = `
        <td class="px-5 py-3.5">
          <span class="font-extrabold text-amber-700 font-mono text-xs">${o.order_number}</span>
          <div class="text-[11px] text-slate-400">${formatDate(o.created_at)}</div>
        </td>
        <td class="px-5 py-3.5">
          <div class="font-bold text-slate-900">${o.customer_name}</div>
          <div class="flex items-center gap-2 mt-1">
            <a href="tel:${cleanPhone}" class="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1" title="Appeler le client">
              <i data-lucide="phone" class="w-3 h-3"></i> ${o.customer_phone}
            </a>
            <a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" class="p-1 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition text-[11px] font-bold flex items-center gap-1" title="Contacter par WhatsApp">
              <i data-lucide="message-circle" class="w-3 h-3"></i> WhatsApp
            </a>
          </div>
        </td>
        <td class="px-5 py-3.5 max-w-xs">
          <div class="text-xs font-semibold text-slate-800">${o.customer_city}</div>
          <div class="text-xs text-slate-500 leading-snug">${o.customer_address}</div>
          ${o.notes ? `<div class="text-[11px] text-amber-700 italic mt-1 bg-amber-50 p-1 rounded">Note: ${o.notes}</div>` : ''}
        </td>
        <td class="px-5 py-3.5 max-w-xs">
          ${itemsSummary}
        </td>
        <td class="px-5 py-3.5 font-extrabold text-slate-900">
          ${formatPrice(o.total_amount)}
          <div class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">Paiement livraison</div>
        </td>
        <td class="px-5 py-3.5">
          ${statusBadge}
        </td>
        <td class="px-5 py-3.5 text-right">
          <select class="select-order-status text-xs font-bold border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:border-amber-500" data-id="${o.id}">
            <option value="en_attente" ${o.status === 'en_attente' ? 'selected' : ''}>À confirmer (Appel)</option>
            <option value="confirmee" ${o.status === 'confirmee' ? 'selected' : ''}>Confirmée</option>
            <option value="en_livraison" ${o.status === 'en_livraison' ? 'selected' : ''}>En livraison</option>
            <option value="livree" ${o.status === 'livree' ? 'selected' : ''}>Livrée & Payée</option>
            <option value="annulee" ${o.status === 'annulee' ? 'selected' : ''}>Annulée</option>
          </select>
        </td>
      `;

      tr.querySelector(".select-order-status").addEventListener("change", async (e) => {
        const newStatus = e.target.value;
        await window.dataManager.updateOrderStatus(o.id, newStatus);
        await refreshAll();
        showToast(`Commande ${o.order_number} passée au statut : ${newStatus}`, "success");
      });

      ordersTableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  if (orderStatusFilter) orderStatusFilter.addEventListener("change", renderOrdersTable);

  // 8. VENTE DIRECTE RAPIDE EN MAGASIN / CAISSE
  const quickSaleModal = document.getElementById("quick-sale-modal");
  const quickSaleForm = document.getElementById("quick-sale-form");
  const closeQuickSaleModal = document.getElementById("close-quick-sale-modal");
  const qsProductTitle = document.getElementById("qs-product-title");
  const qsProductStock = document.getElementById("qs-product-stock");
  const qsQuantity = document.getElementById("qs-quantity");
  const qsPrice = document.getElementById("qs-price");
  const qsTotalPreview = document.getElementById("qs-total-preview");

  let quickSaleCurrentProduct = null;

  function openQuickSaleModal(prod) {
    quickSaleCurrentProduct = prod;
    qsProductTitle.textContent = prod.title;
    qsProductStock.textContent = `${prod.stock_quantity} disponible(s)`;
    qsQuantity.value = 1;
    qsQuantity.max = prod.stock_quantity;
    qsPrice.value = prod.promo_price || prod.price;
    updateQsTotal();

    quickSaleModal.classList.remove("hidden");
    quickSaleModal.classList.add("flex");
  }

  function closeQsModal() {
    quickSaleModal.classList.add("hidden");
    quickSaleModal.classList.remove("flex");
  }

  if (closeQuickSaleModal) closeQuickSaleModal.addEventListener("click", closeQsModal);

  function updateQsTotal() {
    const qty = parseInt(qsQuantity.value, 10) || 1;
    const price = parseFloat(qsPrice.value) || 0;
    qsTotalPreview.textContent = formatPrice(qty * price);
  }

  if (qsQuantity) qsQuantity.addEventListener("input", updateQsTotal);
  if (qsPrice) qsPrice.addEventListener("input", updateQsTotal);

  if (quickSaleForm) {
    quickSaleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!quickSaleCurrentProduct) return;

      const qty = parseInt(qsQuantity.value, 10) || 1;
      const customPrice = parseFloat(qsPrice.value);

      try {
        await window.dataManager.recordDirectSale(quickSaleCurrentProduct.id, qty, customPrice);
        closeQsModal();
        await refreshAll();
        showToast(`Vente enregistrée : ${qty}x "${quickSaleCurrentProduct.title}" ! Stock mis à jour.`, "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  // Onglet Caisse / Vente Manuelle Directe
  const posForm = document.getElementById("pos-sale-form");
  const posProductSelect = document.getElementById("pos-product-select");
  const posQuantity = document.getElementById("pos-quantity");
  const posPrice = document.getElementById("pos-price");
  const posTotalPreview = document.getElementById("pos-total-preview");

  function populatePOSProductSelect() {
    if (!posProductSelect) return;
    posProductSelect.innerHTML = `<option value="">-- Choisissez un livre ou une fourniture --</option>`;
    products.forEach(p => {
      posProductSelect.innerHTML += `
        <option value="${p.id}" data-price="${p.promo_price || p.price}" data-stock="${p.stock_quantity}">
          ${p.title} (${p.stock_quantity} en stock) - ${formatPrice(p.promo_price || p.price)}
        </option>
      `;
    });
  }

  if (posProductSelect) {
    posProductSelect.addEventListener("change", () => {
      const selected = posProductSelect.selectedOptions[0];
      if (selected && selected.value) {
        posPrice.value = selected.dataset.price;
        posQuantity.max = selected.dataset.stock;
        updatePosTotal();
      }
    });
  }

  function updatePosTotal() {
    const qty = parseInt(posQuantity.value, 10) || 1;
    const price = parseFloat(posPrice.value) || 0;
    if (posTotalPreview) posTotalPreview.textContent = formatPrice(qty * price);
  }

  if (posQuantity) posQuantity.addEventListener("input", updatePosTotal);
  if (posPrice) posPrice.addEventListener("input", updatePosTotal);

  if (posForm) {
    posForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const prodId = posProductSelect.value;
      if (!prodId) {
        showToast("Veuillez sélectionner un article", "error");
        return;
      }
      const qty = parseInt(posQuantity.value, 10) || 1;
      const customPrice = parseFloat(posPrice.value);

      try {
        await window.dataManager.recordDirectSale(prodId, qty, customPrice);
        posForm.reset();
        updatePosTotal();
        await refreshAll();
        showToast("Vente en caisse enregistrée avec succès !", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  // 9. STATISTIQUES & GRAPHIQUES AVEC FILTRES (7j, Mois, Année, Tout)
  const statsFilterButtons = document.querySelectorAll(".stats-filter-btn");

  statsFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      statsFilterButtons.forEach(b => {
        b.classList.remove("active", "bg-amber-600", "text-white");
        b.classList.add("bg-white", "text-slate-600");
      });
      btn.classList.add("active", "bg-amber-600", "text-white");
      btn.classList.remove("bg-white", "text-slate-600");
      currentStatsFilter = btn.dataset.period;
      renderStatsCharts();
    });
  });

  async function renderStatsCharts() {
    if (typeof Chart === "undefined") return;

    const filteredSales = await window.dataManager.getSales(currentStatsFilter);

    // Calculs totaux période
    const periodRevenue = filteredSales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0);
    const periodCount = filteredSales.reduce((sum, s) => sum + (parseInt(s.quantity, 10) || 0), 0);

    const statsPeriodRevenue = document.getElementById("stats-period-revenue");
    const statsPeriodCount = document.getElementById("stats-period-count");
    if (statsPeriodRevenue) statsPeriodRevenue.textContent = formatPrice(periodRevenue);
    if (statsPeriodCount) statsPeriodCount.textContent = `${periodCount} article(s)`;

    // 1. Graphique Évolution Revenus
    const revenueCanvas = document.getElementById("chart-revenue");
    if (revenueCanvas) {
      const salesByDate = {};
      filteredSales.forEach(s => {
        const d = new Date(s.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
        salesByDate[d] = (salesByDate[d] || 0) + parseFloat(s.total_amount);
      });

      const labels = Object.keys(salesByDate);
      const data = Object.values(salesByDate);

      if (chartRevenue) chartRevenue.destroy();
      chartRevenue = new Chart(revenueCanvas, {
        type: "line",
        data: {
          labels: labels.length > 0 ? labels : ["Aucune vente"],
          datasets: [{
            label: "Chiffre d'affaires",
            data: data.length > 0 ? data : [0],
            borderColor: "#D97706",
            backgroundColor: "rgba(217, 119, 6, 0.12)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: "#B45309",
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#F1F5F9" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Graphique Répartition Catégories
    const catCanvas = document.getElementById("chart-categories");
    if (catCanvas) {
      const salesByCat = {};
      categories.forEach(c => salesByCat[c.name] = 0);

      filteredSales.forEach(s => {
        const prod = products.find(p => p.id === s.product_id);
        const cat = prod ? categories.find(c => c.id === prod.category_id) : null;
        const catName = cat ? cat.name : "Autre";
        salesByCat[catName] = (salesByCat[catName] || 0) + (parseInt(s.quantity, 10) || 1);
      });

      const catLabels = Object.keys(salesByCat).filter(k => salesByCat[k] > 0);
      const catData = catLabels.map(k => salesByCat[k]);

      if (chartCategories) chartCategories.destroy();
      chartCategories = new Chart(catCanvas, {
        type: "doughnut",
        data: {
          labels: catLabels.length > 0 ? catLabels : ["Aucune"],
          datasets: [{
            data: catData.length > 0 ? catData : [1],
            backgroundColor: ["#D97706", "#4F46E5", "#10B981", "#EC4899", "#6366F1", "#F59E0B"],
            borderWidth: 2,
            borderColor: "#FFFFFF"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    // 3. Top 5 des articles les plus vendus
    const topProdCanvas = document.getElementById("chart-top-products");
    if (topProdCanvas) {
      const sortedBySales = [...products].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 5);
      const topLabels = sortedBySales.map(p => p.title.length > 20 ? p.title.substring(0, 20) + "..." : p.title);
      const topData = sortedBySales.map(p => p.sales_count || 0);

      if (chartTopProducts) chartTopProducts.destroy();
      chartTopProducts = new Chart(topProdCanvas, {
        type: "bar",
        data: {
          labels: topLabels,
          datasets: [{
            label: "Unités vendues",
            data: topData,
            backgroundColor: "#4F46E5",
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { color: "#F1F5F9" } },
            y: { grid: { display: false } }
          }
        }
      });
    }
  }

  // 10. PARAMÈTRES SUPABASE & MOT DE PASSE
  const supabaseForm = document.getElementById("supabase-config-form");
  const sbUrlInput = document.getElementById("sb-url");
  const sbKeyInput = document.getElementById("sb-key");
  const sbStatusBadge = document.getElementById("sb-status-badge");
  const btnCopySql = document.getElementById("btn-copy-sql");
  const adminPassForm = document.getElementById("admin-password-form");
  const newPassInput = document.getElementById("new-admin-password");

  // Charger configuration actuelle
  if (sbUrlInput) sbUrlInput.value = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_URL) || "";
  if (sbKeyInput) sbKeyInput.value = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SUPABASE_KEY) || "";

  function updateSupabaseStatusUI() {
    if (!sbStatusBadge) return;
    if (window.dataManager.isSupabaseConnected) {
      sbStatusBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5";
      sbStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Supabase Connecté`;
    } else {
      sbStatusBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5";
      sbStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> Mode Local (LocalStorage)`;
    }
  }
  updateSupabaseStatusUI();

  if (supabaseForm) {
    supabaseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = sbUrlInput.value.trim();
      const key = sbKeyInput.value.trim();

      showToast("Test de connexion à Supabase...", "info");
      const result = await window.dataManager.configureSupabase(url, key);

      if (result.success) {
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }
      updateSupabaseStatusUI();
      await refreshAll();
    });
  }

  if (btnCopySql) {
    btnCopySql.addEventListener("click", () => {
      // Lire ou copier le script SQL
      const sqlSample = `-- Copiez le contenu de sql/supabase_schema.sql dans votre éditeur SQL Supabase.`;
      navigator.clipboard.writeText(sqlSample);
      showToast("Fichier SQL prêt dans le dossier sql/supabase_schema.sql !", "info");
    });
  }

  if (adminPassForm) {
    adminPassForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPass = newPassInput.value.trim();
      if (!newPass) {
        showToast("Le mot de passe ne peut pas être vide", "error");
        return;
      }
      window.dataManager.saveSettings({ admin_password: newPass });
      newPassInput.value = "";
      showToast("Nouveau mot de passe administrateur enregistré !", "success");
    });
  }

  // Utilitaires de rafraîchissement
  function populateCategorySelects() {
    const prodCat = document.getElementById("prod-category");
    const filterCat = document.getElementById("admin-product-cat-filter");

    if (prodCat) {
      prodCat.innerHTML = `<option value="">Sélectionnez une catégorie...</option>`;
      categories.forEach(c => {
        prodCat.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }

    if (filterCat) {
      const currentVal = filterCat.value;
      filterCat.innerHTML = `<option value="all">Toutes les catégories</option>`;
      categories.forEach(c => {
        filterCat.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
      filterCat.value = currentVal;
    }
  }

  async function refreshAll() {
    await loadAllData();
    renderKpiMetrics();
    renderProductsTable();
    renderCategoriesTable();
    renderOrdersTable();
    populateCategorySelects();
    populatePOSProductSelect();
    renderStatsCharts();
  }

  // Démarrage de vérification d'authentification
  checkAuth();
});
