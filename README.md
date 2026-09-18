# Job237 🇨🇲

**Job237** est une plateforme de recherche d’emplois et de stages au Cameroun.

Elle permet aux candidats de rechercher des opportunités, de postuler et de suivre leurs candidatures, tandis que les recruteurs peuvent publier leurs offres, gérer les candidatures et échanger avec les candidats.

La plateforme intègre également un espace d’administration permettant de gérer les utilisateurs et de suivre les statistiques globales.

---

## ✨ Fonctionnalités

### 👤 Candidat

* Recherche et consultation des offres d’emploi et de stage
* Filtrage des offres :

  * Type de contrat
  * Niveau d’expérience
  * Catégorie / secteur
  * Télétravail
  * Tri
* Consultation du détail d’une offre
* Création et gestion du profil candidat
* Candidature aux offres
* Suivi du statut des candidatures
* Gestion des offres favorites
* Notifications
* Messagerie avec les recruteurs
* Tableau de bord avec statistiques et graphiques

### 🏢 Recruteur

* Création et gestion d’une entreprise
* Ajout et gestion du logo de l’entreprise
* Publication d’offres d’emploi et de stage
* Modification des offres
* Consultation des candidatures reçues
* Gestion du statut des candidatures
* Notes internes sur les candidatures
* Messagerie avec les candidats
* Notifications
* Tableau de bord avec :

  * KPI
  * Tendances
  * Statistiques
  * Conseils

### ⚙️ Administrateur

* Tableau de bord global
* Statistiques sur :

  * Offres
  * Entreprises
  * Secteurs
  * Utilisateurs
  * Candidatures
* Suivi des entreprises les plus actives
* Gestion des utilisateurs

### 💬 Fonctionnalités générales

* Authentification JWT
* Rafraîchissement automatique des tokens
* Messagerie privée candidat ↔ recruteur
* Messagerie liée aux candidatures
* Notifications
* Commentaires sur les offres
* Notes internes sur les candidatures
* Statistiques selon le rôle

---

## 🛠️ Stack technique

### Backend

* **Python**
* **Django 6**
* **Django REST Framework**
* **JWT — SimpleJWT**

### Frontend

* **React 19**
* **Vite**
* **React Router 7**
* **CSS pur**

> Le frontend n’utilise pas de framework CSS. Le design est basé sur des **design tokens CSS** avec prise en charge des thèmes clair et sombre.

### Base de données

* **SQLite** — développement
* **PostgreSQL** — production

### Outils

* Git / GitHub
* Docker / Docker Compose
* Axios
* oxlint
* Gunicorn — production

---

## 🏗️ Architecture du projet

```text
job237/
│
├── backend/
│   ├── job237/                 # Configuration Django
│   │   ├── settings.py
│   │   └── urls.py
│   │
│   ├── accounts/               # Authentification et utilisateurs
│   ├── profiles/               # Profils candidats
│   ├── companies/              # Entreprises
│   ├── jobs/                   # Offres, candidatures, favoris et statistiques
│   ├── comments/               # Commentaires sur les offres
│   ├── notifications/          # Notifications
│   ├── messaging/              # Conversations et messages
│   ├── notes/                  # Notes internes sur les candidatures
│   ├── manage.py
│   ├── requirements.txt
│   ├── requirements-prod.txt
│   └── Dockerfile
│
├── frontend/
│   └── src/
│       ├── api/                # Client Axios et appels API
│       ├── components/         # Composants réutilisables
│       ├── context/            # Contextes React
│       ├── pages/              # Pages de l'application
│       ├── constants.js        # Constantes et helpers
│       ├── index.css           # Styles globaux et design tokens
│       └── App.jsx             # Routage principal
│
├── docker-compose.yml
├── .env
└── .env.example
```

---

# 🚀 Installation

## Prérequis

Avant de commencer, assurez-vous d’avoir installé :

* Python
* Node.js / npm
* Git

Docker est nécessaire uniquement pour le déploiement avec PostgreSQL.

---

## 🔙 Backend

Depuis le dossier du projet :

```bash
cd backend
```

### 1. Créer l'environnement virtuel

Sous Windows :

```bash
python -m venv venv
venv\Scripts\activate
```

Sous Linux / macOS :

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Appliquer les migrations

```bash
python manage.py migrate
```

### 4. Charger les données de démonstration

```bash
python manage.py seed_data
```

Cette commande crée notamment :

* 10 catégories
* des comptes de démonstration
* des données nécessaires pour tester l'application

### 5. Démarrer le serveur

```bash
python manage.py runserver
```

Le backend est alors disponible sur :

```text
http://localhost:8000
```

---

## 🎨 Frontend

Dans un autre terminal :

```bash
cd frontend
```

### 1. Installer les dépendances

```bash
npm install
```

### 2. Démarrer le serveur de développement

```bash
npm run dev
```

Le frontend est disponible sur :

```text
http://localhost:5173
```

Le frontend utilise la variable `VITE_API_URL` définie dans :

```text
frontend/.env
```

Le backend autorise les requêtes CORS provenant de :

```text
http://localhost:5173
```

---

## 🧪 Tests et vérifications

### Backend

Lancer la suite de tests Django :

```bash
python manage.py test
```

### Frontend

Vérifier le code avec oxlint :

```bash
npm run lint
```

Construire le frontend pour la production :

```bash
npm run build
```

Le build est généré dans :

```text
frontend/dist/
```

---

# 🔐 Comptes de démonstration

Après avoir exécuté :

```bash
python manage.py seed_data
```

les comptes suivants sont disponibles :

| Rôle           | Email                 | Mot de passe    |
| -------------- | --------------------- | --------------- |
| Administrateur | `admin@job237.cm`     | `admin1234`     |
| Recruteur      | `recruteur@job237.cm` | `recruteur1234` |
| Candidat       | `candidat@job237.cm`  | `candidat1234`  |

> ⚠️ Ces identifiants sont destinés uniquement au développement et à la démonstration. Ils ne doivent pas être utilisés en production.

---

# 🔌 API

L'API REST est organisée par ressources.

## Authentification & utilisateurs

| Méthode            | Endpoint                            | Description                    |
| ------------------ | ----------------------------------- | ------------------------------ |
| POST               | `/api/auth/register/`               | Inscription                    |
| POST               | `/api/auth/login/`                  | Connexion                      |
| POST               | `/api/auth/refresh/`                | Rafraîchir le token            |
| POST               | `/api/auth/password-reset/`         | Demander une réinitialisation  |
| POST               | `/api/auth/password-reset/confirm/` | Confirmer la réinitialisation  |
| GET / PUT          | `/api/auth/profile/`                | Consulter / modifier le profil |
| POST               | `/api/auth/change-password/`        | Modifier le mot de passe       |
| GET                | `/api/auth/admin/stats/`            | Statistiques globales          |
| GET                | `/api/auth/admin/users/`            | Liste des utilisateurs         |
| GET / PUT / DELETE | `/api/auth/admin/users/<pk>/`       | Gérer un utilisateur           |

## Profils candidats

| Méthode   | Endpoint                  | Description                 |
| --------- | ------------------------- | --------------------------- |
| GET / PUT | `/api/profile/candidate/` | Mon profil candidat         |
| GET       | `/api/candidates/<pk>/`   | Profil public d'un candidat |

## Offres

| Méthode | Endpoint               | Description                   |
| ------- | ---------------------- | ----------------------------- |
| GET     | `/api/jobs/`           | Liste et recherche des offres |
| GET     | `/api/jobs/<slug>/`    | Détail d'une offre            |
| POST    | `/api/jobs/create/`    | Créer une offre               |
| GET     | `/api/jobs/my/`        | Mes offres                    |
| PUT     | `/api/jobs/<pk>/edit/` | Modifier une offre            |
| GET     | `/api/categories/`     | Liste des catégories          |

## Candidatures

| Méthode            | Endpoint                                    | Description              |
| ------------------ | ------------------------------------------- | ------------------------ |
| POST               | `/api/jobs/<job_pk>/apply/`                 | Postuler à une offre     |
| GET                | `/api/applications/`                        | Mes candidatures         |
| GET                | `/api/jobs/<job_pk>/applications/`          | Candidatures reçues      |
| PUT                | `/api/jobs/<job_pk>/applications/<pk>/`     | Modifier le statut       |
| GET                | `/api/applications/stats/`                  | Statistiques recruteur   |
| GET                | `/api/applications/mine/stats/`             | Statistiques candidat    |
| GET / PUT / DELETE | `/api/applications/<application_pk>/notes/` | Gérer les notes internes |

## Entreprises

| Méthode | Endpoint                 | Description             |
| ------- | ------------------------ | ----------------------- |
| GET     | `/api/companies/`        | Liste des entreprises   |
| POST    | `/api/companies/`        | Créer une entreprise    |
| GET     | `/api/companies/<slug>/` | Détail d'une entreprise |
| GET     | `/api/companies/my/`     | Mes entreprises         |

## Favoris

| Méthode | Endpoint                          | Description                 |
| ------- | --------------------------------- | --------------------------- |
| GET     | `/api/favorites/`                 | Mes favoris                 |
| POST    | `/api/favorites/<job_pk>/toggle/` | Ajouter / retirer un favori |

## Commentaires

| Méthode            | Endpoint              | Description                        |
| ------------------ | --------------------- | ---------------------------------- |
| GET / POST         | `/api/comments/`      | Consulter / créer des commentaires |
| GET / PUT / DELETE | `/api/comments/<pk>/` | Gérer un commentaire               |

## Notifications

| Méthode | Endpoint                           | Description                                 |
| ------- | ---------------------------------- | ------------------------------------------- |
| GET     | `/api/notifications/`              | Mes notifications                           |
| GET     | `/api/notifications/unread-count/` | Nombre de notifications non lues            |
| PUT     | `/api/notifications/<pk>/read/`    | Marquer une notification comme lue          |
| POST    | `/api/notifications/read-all/`     | Marquer toutes les notifications comme lues |

## Messagerie

| Méthode | Endpoint                                      | Description                        |
| ------- | --------------------------------------------- | ---------------------------------- |
| GET     | `/api/conversations/`                         | Mes conversations                  |
| GET     | `/api/contacts/`                              | Contacts joignables                |
| POST    | `/api/conversations/start/`                   | Créer / récupérer une conversation |
| GET     | `/api/conversations/unread/`                  | Nombre de messages non lus         |
| GET     | `/api/conversations/<conv_pk>/`               | Détail d'une conversation          |
| GET     | `/api/conversations/<conv_pk>/messages/`      | Messages                           |
| POST    | `/api/conversations/<conv_pk>/messages/send/` | Envoyer un message                 |

## Healthcheck

```text
GET /healthz/
```

Retourne notamment le statut de l'application, l'environnement et l'état de la base de données.

---

# 🐳 Déploiement

Le projet utilise **SQLite par défaut en développement**.

PostgreSQL est prévu pour l'environnement de production via Docker Compose.

## Configuration de production

Créer/configurer les variables d'environnement :

```env
DJANGO_ENV=production
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=<vraie-valeur>
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend

DJANGO_USE_POSTGRES=True

POSTGRES_DB=job237
POSTGRES_USER=job237
POSTGRES_PASSWORD=<mot-de-passe-fort>
POSTGRES_HOST=db

FRONTEND_URL=https://votre-domaine.cm

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=
# EMAIL_PORT=
# EMAIL_HOST_USER=
# EMAIL_HOST_PASSWORD=
```

## Lancer la stack Docker

Après activation des services PostgreSQL dans `docker-compose.yml` :

```bash
docker compose up -d --build
```

Le conteneur backend :

1. applique les migrations ;
2. exécute `collectstatic` ;
3. démarre Gunicorn.

---

## 📦 Fichiers statiques et médias

En développement, Django sert directement les fichiers statiques et médias.

En production, Django ne les sert plus directement.

Il est donc nécessaire de prévoir un reverse proxy comme **Nginx** pour servir :

```text
/media/
/static/
```

ou d'utiliser **WhiteNoise** pour la gestion des fichiers statiques.

---

# 🔒 Variables d'environnement

Les informations sensibles ne doivent pas être directement enregistrées dans le dépôt.

Utiliser :

```text
.env
```

pour la configuration locale et :

```text
.env.example
```

comme modèle.

En production, utiliser des valeurs sécurisées pour :

* `DJANGO_SECRET_KEY`
* `POSTGRES_PASSWORD`
* les identifiants SMTP
* les autres secrets éventuels

---

# 📌 État du projet

Job237 est actuellement structuré autour de trois espaces principaux :

* **Candidat**
* **Recruteur**
* **Administrateur**

avec un backend Django REST Framework et un frontend React séparé.

Le projet est conçu pour fonctionner en développement avec SQLite et pour être déployé avec PostgreSQL et Docker en production.

---

## 👩🏽‍💻 Auteur

**Jeanne Moukodi**

Développeuse Backend — Python Django · Java Spring Boot · API REST

* GitHub : `github.com/PaolaJeanne`
* LinkedIn : `linkedin.com/in/jeanne-moukodi-4aa0b7324`

---

## 📄 Licence

Ce projet est un projet personnel.

Les conditions d'utilisation, de modification et de redistribution peuvent être définies ultérieurement.
