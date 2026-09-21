# 📚 Lumina - Librairie & Papeterie Scolaire Moderne

Application web complète, moderne et lumineuse pour la gestion et la vente en ligne de **livres** (romans, manuels scolaires, littérature, jeunesse) et de **fournitures scolaires**, connectée à **Supabase** et hébergeable gratuitement (GitHub Pages, Vercel, Netlify, ou en local).

---

## 🌟 Fonctionnalités Incluses

### 1. Boutique Publique en Ligne (Vitrine Lumineuse & Époustouflante)
- **Catalogue interactif** avec recherche instantanée par titre, auteur ou mot-clé.
- **Filtres par catégories** : *Livres & Romans*, *Fournitures Scolaires*, *Manuels & Parascolaire*, *Jeunesse & BD*, *Papeterie & Bureau*.
- **Fiches produits complètes** avec **nombre de pages** (📖 *ex: 184 pages*), auteur/marque, prix, promotions, stock et badges d'état.
- **Commande rapide en popup avec Paiement à la Livraison (Cash on Delivery)** :
  - Nom complet, téléphone (pour confirmation d'appel), ville, adresse détaillée et instructions.
  - Calcul du total en temps réel et animation de confettis lors de la confirmation.
  - La commande est transmise instantanément dans l'espace administration.

### 2. Espace Administrateur Complet
- **Sécurisé par mot de passe simple** : Mot de passe par défaut : `admin123` (modifiable à tout moment).
- **Raccourci Bureau** : Fichier `admin_launcher.html` et script `Lancer_Librairie.bat` à placer sur votre Bureau pour un accès en 1 clic.
- **Gestion des Catégories** : Création, modification, suppression avec choix de couleur et d'icône.
- **Gestion des Livres & Fournitures** :
  - Formulaire complet avec **Nombre de pages**, Titre, Catégorie, Auteur, Prix, Promo, Stock, Image et Description.
  - Activer / Désactiver la visibilité d'un article dans la boutique en un clic.
  - **Enregistrement de ventes directes en caisse** : décrémente automatiquement le stock et met à jour le chiffre d'affaires.
- **Gestion des Commandes** :
  - Liste de toutes les commandes avec statuts : *À confirmer (Appel)*, *Confirmée*, *En livraison*, *Livrée & Payée*, *Annulée*.
  - Boutons d'appel téléphonique direct (`tel:`) et contact WhatsApp instantané (`wa.me`).
  - Validation automatique des ventes lors du passage au statut "Livrée & Payée".
- **Statistiques & Graphiques Interactifs (Chart.js)** :
  - Filtres temporels : **7 derniers jours**, **Ce mois-ci**, **Cette année**, **Tout l'historique**.
  - Évolution du chiffre d'affaires dans le temps (courbe lissée).
  - Répartition des ventes par catégorie (diagramme circulaire).
  - Top 5 des livres et articles les plus vendus.
- **Bouton direct "Voir la boutique"** pour basculer facilement entre gestion et boutique client.

---

## 🚀 Démarrage Rapide (En Local)

Vous n'avez besoin d'aucun serveur lourd ni d'installation de Node.js !

1. Ouvrez le dossier du projet :
   ```
   C:\Users\silim\.gemini\antigravity\scratch\librairie-app\
   ```
2. Double-cliquez sur :
   - **`Lancer_Librairie.bat`** : pour choisir d'ouvrir la boutique ou l'admin en 1 clic.
   - Ou directement **`index.html`** (Boutique) ou **`admin.html`** (Administration).
   - Vous pouvez également copier le fichier **`admin_launcher.html`** sur votre **Bureau Windows** !

---

## 🗄️ Configuration de la Base de Données Supabase (Optionnelle mais Recommandée)

L'application fonctionne immédiatement en mode local (avec sauvegarde dans votre navigateur). Pour la synchroniser sur le Cloud avec Supabase :

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte gratuit.
2. Créez un nouveau projet (ex: `lumina-librairie`).
3. Allez dans l'onglet **SQL Editor** dans Supabase.
4. Ouvrez le fichier `sql/supabase_schema.sql` présent dans ce dossier, copiez tout son contenu et collez-le dans l'éditeur SQL de Supabase, puis cliquez sur **Run**.
5. Allez dans **Project Settings > API** dans Supabase, copiez :
   - **Project URL**
   - **Project API Anon Key**
6. Ouvrez votre administration (`admin.html`), allez dans l'onglet **Supabase & Réglages**, collez votre URL et votre clé Anon, puis cliquez sur **Enregistrer & Tester la connexion**.
7. C'est tout ! Vos livres, catégories, commandes et ventes sont désormais en ligne dans votre vraie base de données.

---

## 🌐 Hébergement Gratuit (GitHub Pages, Netlify, Vercel)

### Option A : GitHub Pages (100% Gratuit)
1. Créez un dépôt sur GitHub (ex: `ma-librairie`).
2. Déposez-y tous les fichiers du dossier `librairie-app`.
3. Dans GitHub, allez dans **Settings > Pages > Source : Deploy from a branch (main / root)**.
4. Votre site est accessible en ligne avec son adresse HTTPS gratuite !

### Option B : Netlify Drop
1. Glissez-déposez le dossier `librairie-app` sur [app.netlify.com/drop](https://app.netlify.com/drop).
2. Votre boutique et votre administration sont en ligne instantanément !

---

## 📁 Structure des Fichiers

```
librairie-app/
│
├── index.html               # Vitrine boutique en ligne (catalogue, détails avec pages, commande COD)
├── admin.html               # Administration complète (CRUD livres, ventes, commandes, stats Chart.js)
├── admin_launcher.html      # Raccourci de bureau Windows
├── Lancer_Librairie.bat     # Lanceur batch Windows 1-clic
│
├── css/
│   └── styles.css           # Thème lumineux, finitions soignées, responsive
│
├── js/
│   ├── config.js            # Données initiales et outils globaux
│   ├── supabaseClient.js    # Client Supabase & LocalStorage adaptatif
│   ├── store.js             # Logique boutique & modal de commande
│   └── admin.js             # Logique admin, caisse et graphiques
│
├── sql/
│   └── supabase_schema.sql  # Script de migration SQL Supabase complet
│
└── README.md                # Documentation détaillée
```
