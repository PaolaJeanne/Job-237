# Job237 — Frontend

Frontend React (Vite) pour l'API Django REST « Job237 », une plateforme d'offres
d'emploi et de recrutement au Cameroun.

## Stack

- React 19 + Vite
- React Router 7 (routage)
- Axios (appels API + rafraîchissement automatique des tokens JWT)
- CSS pur avec un système de tokens et thèmes dark / light (pas de framework CSS)
- oxlint (lint)

## Prérequis

- Node.js 18+
- Le backend Django doit tourner (par défaut sur `http://localhost:8000`)
  et autoriser CORS depuis `http://localhost:5173` (déjà configuré dans
  `job237/settings.py` → `CORS_ALLOWED_ORIGINS`).

## Installation

```bash
npm install
```

## Configuration

Le fichier `.env` définit l'URL de l'API :

```
VITE_API_URL=http://localhost:8000/api
```

Modifiez cette valeur si votre backend tourne sur une autre adresse (par
exemple en production).

## Lancer en développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:5173`.

## Vérifier le code

```bash
npm run lint     # oxlint
```

## Build de production

```bash
npm run build
```

Les fichiers statiques sont générés dans `dist/`. Vous pouvez les servir avec
n'importe quel serveur statique (Nginx, Vercel, Netlify, ou même
`django.contrib.staticfiles` si vous préférez tout servir depuis Django).

## Fonctionnalités couvertes

**Public**
- Accueil avec recherche, statistiques en direct et dernières offres
- Liste des offres avec filtres (type de contrat, expérience, catégorie,
  télétravail, tri) et pagination
- Détail d'une offre (avec commentaires)
- Annuaire des entreprises et page détail (avec ses offres actives)
- Connexion / inscription (candidat ou recruteur)

**Espace candidat**
- Tableau de bord (KPI : candidatures, favoris, présélections ; graphique)
- Candidature à une offre (lettre de motivation + CV)
- Suivi du statut de ses candidatures
- Favoris
- Profil candidat (bio, compétences, niveau d'étude, disponibilité, liens)
- Messagerie privée avec les recruteurs
- Modification du mot de passe

**Espace recruteur**
- Tableau de bord (KPI : entreprises, offres, candidatures, vues ; tendances)
- Création / modification d'entreprise (avec logo)
- Publication / modification d'offres
- Gestion des candidatures par offre (changement de statut)
- Notes internes sur les candidatures
- Messagerie privée avec les candidats

**Espace admin**
- Dashboard global (offres, entreprises, secteurs, utilisateurs,
  candidatures, top entreprises)
- Gestion des utilisateurs

**Général**
- Authentification JWT avec rafraîchissement automatique du token
- Thème sombre / clair
- Notifications (cloche avec compteur, marquage lu/tout lu)
- Messagerie (badge de non-lus, nouvelle conversation depuis les contacts)

## Structure

```
src/
  api/          appels à l'API Django (un fichier par ressource)
  components/   composants réutilisables (Navbar, JobCard, Loader…)
  context/      AuthContext (état de connexion), ThemeContext (thème)
  pages/        une page par route
  constants.js  choix partagés (types de contrat, statuts…) + helpers de format
  index.css     design tokens + styles globaux (thèmes dark / light)
  App.jsx       routage
```
