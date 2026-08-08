import json
from rest_framework import serializers
from .models import CandidateProfile
from job237.validators import validate_cv_document, validate_image_upload


class CandidateProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user_email', 'user_full_name', 'phone', 'date_of_birth',
            'location', 'bio', 'cv_file', 'photo', 'skills', 'experience_years',
            'education_level', 'availability', 'linkedin_url', 'portfolio_url',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        """
        Normalise les données multipart/form-data avant validation.

        Args:
            data: Données de requête fournies par DRF, pouvant être un QueryDict
                ou un mapping Python standard. Les champs ``skills`` et ``availability``
                peuvent être transmis sous forme de chaîne JSON/string.

        Returns:
            dict: La représentation interne normalisée exploitable par DRF
            pour effectuer la validation des champs du serializer.
        """
        # Aplatir le QueryDict en dict simple (prend la dernière valeur de chaque clé)
        if hasattr(data, 'dict'):
            flat = data.dict()  # QueryDict → dict { key: last_value }
        else:
            flat = dict(data)
            # Si les valeurs sont des listes, prendre le dernier élément
            for k, v in flat.items():
                if isinstance(v, list) and len(v) == 1:
                    flat[k] = v[0]

        # Parser skills (JSON string → liste Python)
        if 'skills' in flat:
            raw = flat['skills']
            if isinstance(raw, str):
                try:
                    parsed = json.loads(raw)
                    flat['skills'] = parsed if isinstance(parsed, list) else [parsed]
                except (json.JSONDecodeError, TypeError):
                    flat['skills'] = [s.strip() for s in raw.split(',') if s.strip()]

        # Convertir availability string → bool
        if 'availability' in flat and isinstance(flat['availability'], str):
            flat['availability'] = flat['availability'].lower() in ('true', '1', 'yes')

        return super().to_internal_value(flat)

    def validate_cv_file(self, value):
        """Valide le fichier PDF/DOC/DOCX/ODT fourni comme CV.

        Args:
            value: Fichier uploadé à contrôler via les règles métier
                de validation de document.

        Returns:
            object: Le fichier uploadé validé, inchangé.
        """
        validate_cv_document(value)
        return value

    def validate_photo(self, value):
        """Valide l'image de profil fournie par l'utilisateur.

        Args:
            value: Fichier image uploadé à contrôler via les règles métier
                de validation d'image.

        Returns:
            object: Le fichier image validé, inchangé.
        """
        validate_image_upload(value)
        return value


class CandidateProfilePublicSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user_full_name', 'location', 'bio', 'skills',
            'experience_years', 'education_level', 'availability',
        ]
