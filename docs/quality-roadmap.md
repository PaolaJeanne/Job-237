# Roadmap qualité Job237

## Priorité 1 — Cohérence du cycle de validation
- Ajouter une vraie liste de tests API pour les flux auth, jobs et applications.
- Compléter les tests métier de company/profile/messaging.
- Brancher une CI de support avec `python manage.py test` et le build frontend.

## Priorité 2 — Sécurisation prod
- Utiliser `DJANGO_ENV=production` et un secret réel.
- Planner le passage à PostgreSQL pour l’environnement de production.
- Activer les `SECURE_*` settings dans un runtime défini comme prod.
- Activer le token blacklist de JWT.

## Priorité 3 — Observabilité
- Ajouter un endpoint de santé `healthz/`.
- Préparer les logs API et les traces métier.
- Ajouter des alertes sur latence et erreurs API.
