/**
 * ==============================================================================
 * 📚 LIBRAIRIE & PAPETERIE SCOLAIRE - CONFIGURATION GLOBALE
 * ==============================================================================
 * CENTRALISATION DIRECTE SUPABASE (Pas de fausses données de simulation locales)
 */

const APP_CONFIG = {
  appName: "Lumina Librairie & Papeterie Scolaire",
  defaultCurrency: "FCFA",
  
  // ⚡ CONFIGURATION SUPABASE OFFICIELLE
  // Renseignez ici directement votre URL et votre Clé Anon Supabase
  // Elles seront ainsi automatiquement actives en Local ET sur GitHub Pages !
  SUPABASE_URL: "",       // Ex: "https://votre-projet.supabase.co"
  SUPABASE_ANON_KEY: "",  // Ex: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  // Clés LocalStorage pour mémoriser les clés si saisies via l'interface
  STORAGE_KEYS: {
    SUPABASE_URL: "lumina_supabase_url",
    SUPABASE_KEY: "lumina_supabase_anon_key",
    ADMIN_SESSION: "lumina_admin_authenticated"
  }
};

// ==========================================
// OUTILS ET FORMATEURS GLOBAUX
// ==========================================

function formatPrice(amount, currency = null) {
  const curr = currency || APP_CONFIG.defaultCurrency;
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
