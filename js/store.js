/**
 * ==============================================================================
 * 📚 LIBRAIRIE & PAPETERIE SCOLAIRE - LOGIQUE DE LA BOUTIQUE PUBLIQUE
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Éléments DOM
  const searchInput = document.getElementById("search-input");
  const categoriesContainer = document.getElementById("categories-filter-container");
  const productsGrid = document.getElementById("products-grid");
  const productsCountBadge = document.getElementById("products-count-badge");
  const emptyState = document.getElementById("empty-state");

  // Modal Détails Produit
  const productDetailModal = document.getElementById("product-detail-modal");
  const detailModalClose = document.getElementById("close-detail-modal");
  const detailImage = document.getElementById("detail-image");
  const detailCategoryBadge = document.getElementById("detail-category-badge");
  const detailPagesBadge = document.getElementById("detail-pages-badge");
  const detailStockBadge = document.getElementById("detail-stock-badge");
  const detailTitle = document.getElementById("detail-title");
  const detailAuthor = document.getElementById("detail-author");
  const detailPrice = document.getElementById("detail-price");
  const detailOldPrice = document.getElementById("detail-old-price");
  const detailDescription = document.getElementById("detail-description");
  const detailOrderBtn = document.getElementById("detail-order-btn");

  // Modal Commande (Paiement à la livraison)
  const orderModal = document.getElementById("order-modal");
  const closeOrderModal = document.getElementById("close-order-modal");
  const orderForm = document.getElementById("order-form");
  const orderProductTitle = document.getElementById("order-product-title");
  const orderProductPrice = document.getElementById("order-product-price");
  const orderQuantity = document.getElementById("order-quantity");
  const orderTotalPreview = document.getElementById("order-total-preview");
  const orderSubmitBtn = document.getElementById("order-submit-btn");

  // Modal Succès Commande
  const orderSuccessModal = document.getElementById("order-success-modal");
  const successOrderNumber = document.getElementById("success-order-number");
  const closeSuccessBtn = document.getElementById("close-success-btn");

  // État local
  let allProducts = [];
  let allCategories = [];
  let activeCategoryId = "all";
  let currentSelectedProduct = null;

  // 1. CHARGEMENT INITIAL
  async function loadStoreData() {
    try {
      [allCategories, allProducts] = await Promise.all([
        window.dataManager.getCategories(),
        window.dataManager.getProducts(true) // Seulement les produits actifs
      ]);

      renderCategoriesNav();
      renderProducts();
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
      showToast("Erreur lors du chargement de la boutique", "error");
    }
  }

  // 2. RENDU DES CATÉGORIES (PILLS)
  function renderCategoriesNav() {
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = "";

    // Bouton "Tous les articles"
    const allBtn = document.createElement("button");
    allBtn.className = `category-pill px-5 py-2.5 rounded-full text-xs font-bold border transition ${
      activeCategoryId === "all" 
        ? "active bg-amber-600 text-white shadow-md border-amber-600" 
        : "bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:text-amber-700"
    }`;
    allBtn.innerHTML = `<span>Tous les articles</span> (${allProducts.length})`;
    allBtn.addEventListener("click", () => {
      activeCategoryId = "all";
      updateActiveCategoryPills();
      renderProducts();
    });
    categoriesContainer.appendChild(allBtn);

    // Boutons pour chaque catégorie
    allCategories.forEach(cat => {
      const count = allProducts.filter(p => p.category_id === cat.id).length;
      const btn = document.createElement("button");
      btn.className = `category-pill px-4 py-2.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
        activeCategoryId === cat.id 
          ? "active bg-amber-600 text-white shadow-md border-amber-600" 
          : "bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:text-amber-700"
      }`;
      btn.dataset.id = cat.id;
      btn.innerHTML = `
        <i data-lucide="${cat.icon || 'book-open'}" class="w-3.5 h-3.5"></i>
        <span>${cat.name}</span>
        <span class="opacity-75 font-normal">(${count})</span>
      `;
      btn.addEventListener("click", () => {
        activeCategoryId = cat.id;
        updateActiveCategoryPills();
        renderProducts();
      });
      categoriesContainer.appendChild(btn);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function updateActiveCategoryPills() {
    document.querySelectorAll(".category-pill").forEach(el => {
      const isAll = !el.dataset.id && activeCategoryId === "all";
      const isCurrent = el.dataset.id === activeCategoryId;
      if (isAll || isCurrent) {
        el.classList.add("active", "bg-amber-600", "text-white", "border-amber-600");
        el.classList.remove("bg-white", "text-slate-700", "border-slate-200");
      } else {
        el.classList.remove("active", "bg-amber-600", "text-white", "border-amber-600");
        el.classList.add("bg-white", "text-slate-700", "border-slate-200");
      }
    });
  }

  // 3. RENDU DES PRODUITS DANS LA GRILLE
  function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    const searchTerm = (searchInput ? searchInput.value : "").trim().toLowerCase();

    const filtered = allProducts.filter(p => {
      const matchesCategory = activeCategoryId === "all" || p.category_id === activeCategoryId;
      const matchesSearch = !searchTerm || 
        p.title.toLowerCase().includes(searchTerm) ||
        (p.author && p.author.toLowerCase().includes(searchTerm)) ||
        (p.description && p.description.toLowerCase().includes(searchTerm));
      return matchesCategory && matchesSearch;
    });

    if (productsCountBadge) {
      productsCountBadge.textContent = `${filtered.length} article${filtered.length > 1 ? 's' : ''}`;
    }

    if (filtered.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    filtered.forEach(p => {
      const category = allCategories.find(c => c.id === p.category_id);
      const isBook = p.type === "livre";
      const inStock = p.stock_quantity > 0;
      const hasPromo = p.promo_price && p.promo_price < p.price;
      const effectivePrice = hasPromo ? p.promo_price : p.price;

      const card = document.createElement("div");
      card.className = "bg-white rounded-2xl overflow-hidden shadow-sm card-hover-effect flex flex-col relative animate-fade-in";

      card.innerHTML = `
        <!-- Image & Rubans -->
        <div class="relative w-full h-56 bg-slate-100 overflow-hidden cursor-pointer product-click-target">
          <img 
            src="${p.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}" 
            alt="${p.title}"
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'"
          />
          ${hasPromo ? `<span class="ribbon-promo">Promo</span>` : ""}
          <div class="absolute bottom-2 left-2 flex flex-wrap gap-1">
            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm backdrop-blur-md" 
                  style="background-color: rgba(255,255,255,0.9); color: ${category ? category.color : '#4F46E5'};">
              ${category ? category.name : 'Général'}
            </span>
          </div>
        </div>

        <!-- Corps de la carte -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <!-- Auteur / Marque & Pages -->
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="text-xs font-semibold text-slate-500 truncate">
                ${p.author ? p.author : (isBook ? 'Auteur non renseigné' : 'Papeterie de qualité')}
              </span>
              ${p.pages_count && p.pages_count > 0 ? `
                <span class="badge-pages" title="${p.pages_count} pages">
                  <i data-lucide="book-open" class="w-3 h-3"></i> ${p.pages_count} p.
                </span>
              ` : ''}
            </div>

            <!-- Titre -->
            <h3 class="text-base font-bold text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-amber-600 transition product-click-target" title="${p.title}">
              ${p.title}
            </h3>

            <!-- Extrait Description -->
            <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              ${p.description || "Aucune description détaillée disponible."}
            </p>
          </div>

          <!-- Pied de carte : Prix & Boutons -->
          <div class="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-3">
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-lg font-extrabold text-amber-700">${formatPrice(effectivePrice)}</span>
                ${hasPromo ? `<span class="text-xs text-slate-400 line-through ml-1.5 font-medium">${formatPrice(p.price)}</span>` : ""}
              </div>
              <div>
                ${inStock ? `
                  <span class="badge-stock bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En stock
                  </span>
                ` : `
                  <span class="badge-stock bg-rose-50 text-rose-700 border border-rose-200">
                    Rupture
                  </span>
                `}
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="grid grid-cols-2 gap-2">
              <button 
                class="btn-detail px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-1.5"
                data-id="${p.id}"
              >
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-500"></i> Détails
              </button>
              
              <button 
                class="btn-order px-3 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center justify-center gap-1.5 ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}"
                data-id="${p.id}"
                ${!inStock ? 'disabled' : ''}
              >
                <i data-lucide="truck" class="w-3.5 h-3.5"></i> Commander
              </button>
            </div>
          </div>
        </div>
      `;

      // Événements de clic
      card.querySelectorAll(".product-click-target, .btn-detail").forEach(el => {
        el.addEventListener("click", () => openProductDetailModal(p));
      });

      const orderBtn = card.querySelector(".btn-order");
      if (orderBtn && inStock) {
        orderBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openOrderModal(p);
        });
      }

      productsGrid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 4. MODAL DÉTAILS DU PRODUIT
  function openProductDetailModal(product) {
    currentSelectedProduct = product;
    const category = allCategories.find(c => c.id === product.category_id);
    const hasPromo = product.promo_price && product.promo_price < product.price;
    const effectivePrice = hasPromo ? product.promo_price : product.price;

    detailImage.src = product.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
    detailTitle.textContent = product.title;
    detailAuthor.textContent = product.author ? `Par ${product.author}` : (product.type === "livre" ? "Livre de collection" : "Article scolaire & papeterie");
    detailCategoryBadge.textContent = category ? category.name : "Article";
    detailCategoryBadge.style.color = category ? category.color : "#4F46E5";
    
    // Badge pages
    if (product.pages_count && product.pages_count > 0) {
      detailPagesBadge.innerHTML = `<i data-lucide="book-open" class="w-3.5 h-3.5"></i> ${product.pages_count} pages`;
      detailPagesBadge.classList.remove("hidden");
    } else {
      detailPagesBadge.classList.add("hidden");
    }

    // Badge stock
    if (product.stock_quantity > 0) {
      detailStockBadge.className = "badge-stock bg-emerald-50 text-emerald-700 border border-emerald-200";
      detailStockBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${product.stock_quantity} disponible(s)`;
      detailOrderBtn.disabled = false;
      detailOrderBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      detailStockBadge.className = "badge-stock bg-rose-50 text-rose-700 border border-rose-200";
      detailStockBadge.innerHTML = "Rupture de stock temporaire";
      detailOrderBtn.disabled = true;
      detailOrderBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    detailPrice.textContent = formatPrice(effectivePrice);
    if (hasPromo) {
      detailOldPrice.textContent = formatPrice(product.price);
      detailOldPrice.classList.remove("hidden");
    } else {
      detailOldPrice.classList.add("hidden");
    }

    detailDescription.textContent = product.description || "Aucune description fournie pour cet article.";

    productDetailModal.classList.remove("hidden");
    productDetailModal.classList.add("flex");
    document.body.style.overflow = "hidden";

    if (window.lucide) window.lucide.createIcons();
  }

  function closeDetail() {
    productDetailModal.classList.add("hidden");
    productDetailModal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }

  if (detailModalClose) detailModalClose.addEventListener("click", closeDetail);
  if (productDetailModal) {
    productDetailModal.addEventListener("click", (e) => {
      if (e.target === productDetailModal) closeDetail();
    });
  }

  if (detailOrderBtn) {
    detailOrderBtn.addEventListener("click", () => {
      closeDetail();
      if (currentSelectedProduct) openOrderModal(currentSelectedProduct);
    });
  }

  // 5. MODAL DE COMMANDE AVEC PAIEMENT À LA LIVRAISON
  function openOrderModal(product) {
    currentSelectedProduct = product;
    const effectivePrice = (product.promo_price && product.promo_price < product.price) 
      ? product.promo_price 
      : product.price;

    orderProductTitle.textContent = product.title;
    orderProductPrice.textContent = formatPrice(effectivePrice);
    orderQuantity.value = 1;
    orderQuantity.max = product.stock_quantity || 10;
    updateOrderTotal();

    orderModal.classList.remove("hidden");
    orderModal.classList.add("flex");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const nameField = document.getElementById("customer_name");
      if (nameField) nameField.focus();
    }, 100);
  }

  function closeOrder() {
    orderModal.classList.add("hidden");
    orderModal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }

  if (closeOrderModal) closeOrderModal.addEventListener("click", closeOrder);
  if (orderModal) {
    orderModal.addEventListener("click", (e) => {
      if (e.target === orderModal) closeOrder();
    });
  }

  function updateOrderTotal() {
    if (!currentSelectedProduct) return;
    const qty = parseInt(orderQuantity.value, 10) || 1;
    const unitPrice = (currentSelectedProduct.promo_price && currentSelectedProduct.promo_price < currentSelectedProduct.price) 
      ? currentSelectedProduct.promo_price 
      : currentSelectedProduct.price;
    const total = unitPrice * qty;
    if (orderTotalPreview) orderTotalPreview.textContent = formatPrice(total);
  }

  if (orderQuantity) {
    orderQuantity.addEventListener("input", updateOrderTotal);
    orderQuantity.addEventListener("change", updateOrderTotal);
  }

  // Soumission de la commande
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentSelectedProduct) return;

      const customerName = document.getElementById("customer_name").value.trim();
      const customerPhone = document.getElementById("customer_phone").value.trim();
      const customerCity = document.getElementById("customer_city").value.trim();
      const customerAddress = document.getElementById("customer_address").value.trim();
      const notes = document.getElementById("customer_notes").value.trim();
      const qty = parseInt(orderQuantity.value, 10) || 1;

      if (!customerName || !customerPhone || !customerCity || !customerAddress) {
        showToast("Veuillez remplir tous les champs obligatoires (*)", "error");
        return;
      }

      orderSubmitBtn.disabled = true;
      orderSubmitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Validation en cours...
      `;

      try {
        const unitPrice = (currentSelectedProduct.promo_price && currentSelectedProduct.promo_price < currentSelectedProduct.price) 
          ? currentSelectedProduct.promo_price 
          : currentSelectedProduct.price;
        const totalAmount = unitPrice * qty;

        const orderData = {
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_city: customerCity,
          customer_address: customerAddress,
          notes: notes,
          total_amount: totalAmount,
          items: [
            {
              product_id: currentSelectedProduct.id,
              product_title: currentSelectedProduct.title,
              quantity: qty,
              unit_price: unitPrice,
              subtotal: totalAmount
            }
          ]
        };

        const createdOrder = await window.dataManager.createOrder(orderData);

        // Fermer modal de commande et réinitialiser
        closeOrder();
        orderForm.reset();

        // Afficher modal de succès avec confetti
        if (successOrderNumber) successOrderNumber.textContent = createdOrder.order_number;
        orderSuccessModal.classList.remove("hidden");
        orderSuccessModal.classList.add("flex");

        if (typeof confetti === "function") {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        showToast("Commande enregistrée avec succès !", "success");
      } catch (err) {
        console.error("Erreur commande :", err);
        showToast("Une erreur est survenue lors de la validation.", "error");
      } finally {
        orderSubmitBtn.disabled = false;
        orderSubmitBtn.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Confirmer la commande (Paiement à la livraison)`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", () => {
      orderSuccessModal.classList.add("hidden");
      orderSuccessModal.classList.remove("flex");
      document.body.style.overflow = "auto";
    });
  }

  // 6. ÉCOUTEURS DE RECHERCHE
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderProducts();
    });
  }

  // Démarrage
  await loadStoreData();
});
