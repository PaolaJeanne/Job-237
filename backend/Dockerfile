# ============================================================================
# Image de PRODUCTION (utilisee par docker-compose.yml au deploiement).
# En local vous n'avez pas besoin de Docker : lancez le backend avec
#   python manage.py runserver
# depuis un venv (SQLite). Cette image ajoute gunicorn (requis seulement
# dans le conteneur) et demarre en prod. Note : gunicorn n'est PAS dans
# requirements.txt car il n'est pas installable sur Windows.
# ============================================================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt requirements-prod.txt ./
RUN pip install --upgrade pip && pip install -r requirements-prod.txt

COPY . ./

EXPOSE 8000

CMD ["gunicorn", "job237.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
