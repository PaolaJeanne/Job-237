import os
from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions
from PIL import Image

ALLOWED_CV_EXTENSIONS = {'pdf', 'doc', 'docx', 'odt'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_CV_SIZE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024


def validate_cv_document(upload):
    """Valide le contenu d'un document CV téléversé.

    Args:
        upload: Objet fichier téléversé, typiquement un ``InMemoryUploadedFile``
            ou un fichier Django. La méthode vérifie l'extension et la taille.

    Raises:
        ValidationError: Si le type d'extension ou la taille du CV ne respecte pas
        les contraintes métier.
    """
    if not upload:
        return

    filename = getattr(upload, 'name', '') or ''
    extension = os.path.splitext(filename)[1].lower().lstrip('.')
    if extension not in ALLOWED_CV_EXTENSIONS:
        raise ValidationError('Seuls les fichiers PDF, DOC, DOCX et ODT sont acceptés pour le CV.')

    size = getattr(upload, 'size', 0) or 0
    if size > MAX_CV_SIZE_BYTES:
        raise ValidationError('Le CV ne doit pas dépasser 5 Mo.')


def validate_image_upload(upload):
    """Valide le contenu d'une image téléversée pour un profil.

    Args:
        upload: Objet fichier image téléversé. La méthode contrôle l'extension,
            la taille, l'authenticité du contenu image et les dimensions minimales.

    Raises:
        ValidationError: Si l'image n'est pas un fichier image accepté ou si ses
            dimensions / poids ne respectent pas les règles métier.
    """
    if not upload:
        return

    filename = getattr(upload, 'name', '') or ''
    extension = os.path.splitext(filename)[1].lower().lstrip('.')
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError('Seules les images au format PNG, JPG, JPEG ou WEBP sont acceptées.')

    size = getattr(upload, 'size', 0) or 0
    if size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError('L’image ne doit pas dépasser 2 Mo.')

    image = None
    try:
        upload.seek(0)
        image = Image.open(upload)
        image.verify()
    except Exception as exc:
        raise ValidationError('Le fichier fourni n’est pas une image valide.') from exc

    upload.seek(0)
    width, height = get_image_dimensions(upload)
    if width < 50 or height < 50:
        raise ValidationError('L’image doit faire au moins 50×50 pixels.')
