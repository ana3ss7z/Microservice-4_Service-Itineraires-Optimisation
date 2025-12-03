# Itinéraire Optimisation - Frontend React

Frontend moderne pour le microservice d'itinéraires et optimisation de tournées - Transport Maroc.

## 🚀 Technologies

- **React 18** - Bibliothèque UI
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Navigation
- **Axios** - Client HTTP
- **React Leaflet** - Cartes interactives
- **Lucide React** - Icônes
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations

## 📦 Installation

```bash
# Naviguer vers le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier frontend :

```env
# Pour le développement local (avec proxy)
VITE_API_URL=/api

# Pour connexion directe au backend
VITE_API_URL=http://localhost:8082/api

# Pour le serveur de production
VITE_API_URL=http://172.30.80.11:31030/api
```

### Proxy de développement

Le fichier `vite.config.js` configure un proxy pour rediriger les requêtes `/api` vers le backend :

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8082',
      changeOrigin: true,
    }
  }
}
```

## 📱 Fonctionnalités

### 1. Dashboard

- Vue d'ensemble du service
- Statistiques (villes, localisation)
- Actions rapides
- État du service (health check)

### 2. Calculer Itinéraire (`/calculator`)

- Calcul par coordonnées GPS
- Calcul par adresses textuelles
- Sélection rapide de villes marocaines
- Option aller-retour
- Visualisation sur carte

### 3. Optimiser Tournée (`/optimizer`)

- Multi-points (jusqu'à 15)
- Algorithme TSP (plus proche voisin)
- Exemples prédéfinis (Grand Tour, Côte Atlantique, Villes Impériales)
- Glisser-déposer pour réordonner

### 4. Demande Transport (`/demande`)

- Informations client complètes
- Volume et nature de marchandise
- Date de départ
- Calcul avec retour automatique

### 5. Historique (`/history`)

- Historique par utilisateur
- Détails des trajets
- Pagination
- Informations utilisateur complètes

### 6. Localisation (`/location`)

- Détection IP automatique
- Recherche par IP
- Informations serveur
- Exemples d'IP (Google DNS, Maroc Telecom)

### 7. Villes Maroc (`/cities`)

- Liste complète des villes
- Recherche
- Visualisation sur carte
- Détails par ville

## 🎨 Design

- **Couleurs Morocco** : Rouge (#C1272D), Vert (#006233)
- **Gradient moderne** avec effets glass-morphism
- **Responsive** pour mobile, tablette et desktop
- **Dark mode ready** (structure préparée)
- **Animations fluides** avec Framer Motion

## 📁 Structure du projet

```
frontend/
├── public/
│   └── vite.svg           # Favicon
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── LoadingSpinner.jsx
│   │   ├── MapView.jsx
│   │   ├── Navbar.jsx
│   │   ├── RouteResultCard.jsx
│   │   └── Sidebar.jsx
│   ├── pages/             # Pages de l'application
│   │   ├── CitiesPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DemandeRoute.jsx
│   │   ├── LocationPage.jsx
│   │   ├── RouteCalculator.jsx
│   │   ├── RouteHistory.jsx
│   │   └── RouteOptimizer.jsx
│   ├── services/          # Services API
│   │   └── api.js
│   ├── App.jsx            # Composant principal
│   ├── index.css          # Styles globaux + Tailwind
│   └── main.jsx           # Point d'entrée
├── .env                   # Variables d'environnement
├── index.html             # Template HTML
├── package.json           # Dépendances
├── postcss.config.js      # Configuration PostCSS
├── tailwind.config.js     # Configuration Tailwind
└── vite.config.js         # Configuration Vite
```

## 🔌 API Endpoints utilisés

| Endpoint                | Méthode | Description             |
| ----------------------- | ------- | ----------------------- |
| `/routes/health`        | GET     | Health check            |
| `/routes/coordinates`   | POST    | Calcul par GPS          |
| `/routes/address`       | POST    | Calcul par adresse      |
| `/routes/optimize`      | POST    | Optimisation TSP        |
| `/routes/demande-info`  | POST    | Demande avec volume     |
| `/routes/history`       | GET     | Historique              |
| `/routes/user-info`     | GET     | Info utilisateur        |
| `/routes/{id}`          | GET     | Détail route            |
| `/routes/ville`         | GET     | Liste villes            |
| `/location/current`     | GET     | Localisation actuelle   |
| `/location/ip/{ip}`     | GET     | Localisation par IP     |
| `/location/refresh`     | POST    | Rafraîchir localisation |
| `/location/server-info` | GET     | Info serveur            |

## 🚀 Build pour production

```bash
# Build
npm run build

# Preview du build
npm run preview
```

Les fichiers de production seront dans le dossier `dist/`.

## 📝 Scripts disponibles

| Script            | Description             |
| ----------------- | ----------------------- |
| `npm run dev`     | Lancer en développement |
| `npm run build`   | Build pour production   |
| `npm run preview` | Preview du build        |
| `npm run lint`    | Vérification ESLint     |

## 🐳 Docker (optionnel)

Pour déployer avec Docker, créez un `Dockerfile` :

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

Développé pour le projet **Microservice 4 - Itinéraires & Optimisation** 🇲🇦
