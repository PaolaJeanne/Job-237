from rest_framework import permissions


class IsCandidate(permissions.BasePermission):
    """Réserve l'accès aux utilisateurs dont le rôle est 'candidate'.

    Empêche un recruteur ou un admin de créer/consulter un CandidateProfile
    (CV, compétences, bio…) qui n'a pas de sens pour son rôle.
    """

    message = "Cette ressource est réservée aux comptes candidats."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'candidate'
        )
