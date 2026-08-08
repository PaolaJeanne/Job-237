from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Autorise la lecture (GET/HEAD/OPTIONS) à tout le monde.
    Autorise l'écriture (PUT/PATCH/DELETE) uniquement au propriétaire de l'objet.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id
