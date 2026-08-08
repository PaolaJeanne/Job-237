# Job237 — Emploi et Stages au Cameroun

Plateforme de recherche d'emplois et de stages au Cameroun : annuaire
d'offres, candidatures, favoris, messagerie entre candidats et recruteurs,
notifications, tableaux de bord candidat / recruteur / admin.

## Stack technique

- **Backend:** Django 6 + Django REST Framework
- **Frontend:** React 19 + Vite + React Router 7
- **Base de données:** SQLite (dev) / PostgreSQL (prod, docker-compose)
- **Auth:** JWT (djangorestframework-simplejwt) + rafraîchissement automatique
- **Style:** CSS pur avec design tokens (pas de framework CSS)

## Lancement rapide

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data     # Données de test (10 catégories + comptes de démo)
python manage.py runserver     # http://localhost:8000
```

Lancer les tests :

```bash
python manage.py test          # Suite complète (backend)
```

### Frontend

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Vérifier et builder :

```bash
npm run lint                   # oxlint
npm run build                  # build de production dans dist/
```

> Le frontend appelle l'API via `VITE_API_URL` (défini dans `frontend/.env`).
> Le backend autorise le CORS depuis `http://localhost:5173`.

## Comptes de test

Créés par `python manage.py seed_data` :

| Rôle     | Email                   | Mot de passe   |
|----------|-------------------------|----------------|
| Admin    | admin@job237.cm         | admin1234      |
| Recruteur| recruteur@job237.cm     | recruteur1234  |
| Candidat | candidat@job237.cm      | candidat1234   |

## Fonctionnalités

- **Public** : accueil avec recherche + stats, liste d'offres filtrable
  (type de contrat, expérience, catégorie, télétravail, tri), détail d'offre,
  annuaire d'entreprises, inscription candidat / recruteur.
- **Candidat** : tableau de bord (KPI + graphiques), candidatures
  (envoi + suivi du statut), favoris, profil, notifications, messagerie.
- **Recruteur** : tableau de bord (KPI, tendances, conseils), entreprises
  (création/modification + logo), publication/modification d'offres, gestion
  des candidatures reçues, messagerie.
- **Admin** : dashboard global (offres, entreprises, secteurs, utilisateurs,
  candidatures, top entreprises), gestion des utilisateurs.
- **Général** : messagerie privée (candidat ↔ recruteur, liée aux
  candidatures), notifications, commentaires sur les offres, notes internes
  sur les candidatures, stats (candidat / recruteur / admin).

## API Endpoints

### Auth & utilisateurs
- `POST /api/auth/register/` — Inscription
- `POST /api/auth/login/` — Connexion (JWT)
- `POST /api/auth/refresh/` — Rafraîchir le token
- `POST /api/auth/password-reset/` / `.../confirm/` — Mot de passe oublié
- `GET/PUT /api/auth/profile/` — Profil utilisateur
- `POST /api/auth/change-password/` — Changer le mot de passe
- `GET /api/auth/admin/stats/` — Stats globales (admin)
- `GET /api/auth/admin/users/` + `GET/PUT/DELETE /api/auth/admin/users/<pk>/` — Gestion des utilisateurs (admin)

### Profils candidats
- `GET/PUT /api/profile/candidate/` — Mon profil candidat
- `GET /api/candidates/<pk>/` — Profil public d'un candidat

### Offres
- `GET /api/jobs/` — Liste des offres (filtres, recherche, pagination)
- `GET /api/jobs/<slug>/` — Détail d'une offre
- `POST /api/jobs/create/` — Créer une offre (recruteur)
- `GET /api/jobs/my/` — Mes offres (recruteur)
- `PUT /api/jobs/<pk>/edit/` — Modifier une offre (recruteur)
- `GET /api/categories/` — Catégories (secteurs d'activité)

### Candidatures
- `POST /api/jobs/<job_pk>/apply/` — Postuler
- `GET /api/applications/` — Mes candidatures
- `GET /api/jobs/<job_pk>/applications/` — Candidatures reçues (recruteur)
- `PUT /api/jobs/<job_pk>/applications/<pk>/` — Modifier le statut
- `GET /api/applications/stats/` — Stats recruteur
- `GET /api/applications/mine/stats/` — Stats candidat
- `GET/PUT/DELETE /api/applications/<application_pk>/notes/` — Notes internes

### Entreprises
- `GET /api/companies/` — Liste des entreprises
- `POST /api/companies/` — Créer une entreprise
- `GET /api/companies/<slug>/` — Détail entreprise
- `GET /api/companies/my/` — Mes entreprises

### Favoris
- `GET /api/favorites/` — Mes favoris
- `POST /api/favorites/<job_pk>/toggle/` — Ajouter / retirer des favoris

### Commentaires
- `GET/POST /api/comments/` — Commentaires (filtrés par offre)
- `GET/PUT/DELETE /api/comments/<pk>/` — Gérer un commentaire

### Notifications
- `GET /api/notifications/` — Mes notifications
- `GET /api/notifications/unread-count/` — Nombre de non lues
- `PUT /api/notifications/<pk>/read/` — Marquer comme lue
- `POST /api/notifications/read-all/` — Tout marquer comme lu

### Messagerie
- `GET /api/conversations/` — Mes conversations
- `GET /api/contacts/` — Contacts joignables (liés par une candidature)
- `POST /api/conversations/start/` — Ouvrir / récupérer une conversation
- `GET /api/conversations/unread/` — Nombre total de messages non lus
- `GET /api/conversations/<conv_pk>/` — Détail + marquer les non-lus comme lus
- `GET /api/conversations/<conv_pk>/messages/` — Messages d'une conversation
- `POST /api/conversations/<conv_pk>/messages/send/` — Envoyer un message

### Divers
- `GET /healthz/` — Healthcheck (statut, environnement, base de données)

## Structure du projet

```
job237/
├── backend/
│   ├── job237/          # Configuration Django (settings, urls)
│   ├── accounts/        # Auth, utilisateurs, stats & gestion admin
│   ├── profiles/        # Profils candidats
│   ├── companies/       # Entreprises
│   ├── jobs/            # Offres, candidatures, favoris, stats, commentaires
│   ├── comments/        # Commentaires sur les offres
│   ├── notifications/   # Alertes (nouveau message, statut de candidature…)
│   ├── messaging/       # Conversations privées et messages
│   ├── notes/           # Notes internes sur les candidatures
│   ├── manage.py
│   ├── requirements.txt / requirements-prod.txt
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── api/         # Client Axios (un fichier par ressource)
│       ├── components/  # Composants réutilisables (Navbar, JobCard, Loader…)
│       ├── context/     # AuthContext, ThemeContext
│       ├── pages/       # Une page par route
│       ├── constants.js # Choix partagés + helpers (types de contrat, statuts…)
│       ├── index.css    # Design tokens + styles globaux (dark/light)
│       └── App.jsx      # Routage
├── docker-compose.yml   # PostgreSQL + backend (production, désactivé par défaut)
├── .env                 # Configuration locale
└── .env.example
```

## Déploiement (production)

En local, rien à faire : le backend tourne sur **SQLite**
(`DJANGO_USE_POSTGRES=False` par défaut).

La stack **PostgreSQL** (Postgres + backend gunicorn) est prête dans
`docker-compose.yml`, mais **commentée** pour ne pas perturber le dev local.
Le jour du passage en production :

1. Activer Postgres dans `backend/job237/settings.py` via le `.env` :
   ```
   DJANGO_ENV=production
   DJANGO_DEBUG=False
   DJANGO_SECRET_KEY=<vraie valeur>
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
   DJANGO_USE_POSTGRES=True
   POSTGRES_DB=job237
   POSTGRES_USER=job237
   POSTGRES_PASSWORD=<mot de passe fort>
   POSTGRES_HOST=db
   FRONTEND_URL=https://votre-domaine.cm
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   # EMAIL_HOST / EMAIL_PORT / EMAIL_HOST_USER / EMAIL_HOST_PASSWORD
   ```
2. Décommenter `docker-compose.yml` puis lancer :
   ```bash
   docker compose up -d --build
   ```
   Le conteneur `backend` fait `migrate`, `collectstatic` puis démarre gunicorn.

3. **Media / fichiers statiques** : en production, Django ne les sert plus
   (uniquement en dev). Prévoir un reverse-proxy (nginx) qui sert `/media/` et
   `/static/` depuis les volumes, ou ajouter whitenoise pour servir le static
   sans nginx.

Note : gunicorn est dans `backend/requirements-prod.txt` (utilisé uniquement
par l'image Docker) car il ne s'installe pas sous Windows.
