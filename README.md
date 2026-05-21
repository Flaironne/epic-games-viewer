# Epic Library Viewer

Interface web pour visualiser ta bibliothèque de jeux Epic Games sous forme de liste ou de grille.

## Fonctionnalités

- Récupération automatique de tous tes jeux via l'API Epic Games (pagination complète)
- Affichage en **liste** ou en **grille** (toggle)
- Recherche par nom en temps réel
- Tri alphabétique A→Z / Z→A
- Bouton Refresh pour recharger la bibliothèque
- Compteur total de jeux

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- Pas de librairie UI externe
- Proxy Vite pour contourner le CORS en dev

## Structure

```
epic-games-viewer/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── epicGames.ts   # logique fetch + pagination
│   │   ├── App.tsx            # composant principal
│   │   ├── main.tsx           # entry point
│   │   └── index.css          # styles (thème sombre)
│   ├── .env                   # cookie de session (non commité)
│   ├── .env.example           # template à copier
│   └── vite.config.ts         # proxy CORS configuré
└── README.md
```

## Installation et lancement

```bash
cd frontend
npm install
```

Copie le fichier d'environnement et renseigne ton cookie :

```bash
cp .env.example .env
```

Lance le serveur de développement :

```bash
npm run dev
```

L'app est disponible sur [http://localhost:5173](http://localhost:5173).

## Configuration du cookie

Le cookie Epic Games est nécessaire pour authentifier les requêtes API. Il expire toutes les 24h environ.

**Comment le récupérer :**

1. Ouvre [accounts.epicgames.com](https://accounts.epicgames.com) et connecte-toi
2. Ouvre les DevTools (`F12`) → onglet **Network**
3. Actualise la page, clique sur n'importe quelle requête vers `epicgames.com`
4. Dans **Headers** → **Request Headers** → copie la valeur du header `Cookie`
5. Colle-la dans `.env` :

```env
EPIC_COOKIE="EPIC_CLIENT_SESSION=... ; EPIC_DEVICE=... ; ..."
```

6. Redémarre `npm run dev`

> Le cookie reste côté serveur (proxy Vite) et n'est jamais inclus dans le bundle JavaScript.
