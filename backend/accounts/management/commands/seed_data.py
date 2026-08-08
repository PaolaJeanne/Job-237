import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from companies.models import Company
from jobs.models import JobCategory, JobOffer
from profiles.models import CandidateProfile

User = get_user_model()

CATEGORIES = [
    ('Informatique / IT', 'informatique-it'),
    ('Marketing / Communication', 'marketing-communication'),
    ('Finance / Comptabilite', 'finance-comptabilite'),
    ('Ressources Humaines', 'ressources-humaines'),
    ('Commercial / Vente', 'commercial-vente'),
    ('Construction / Genie Civil', 'construction-genie-civil'),
    ('Sante / Medical', 'sante-medical'),
    ('Education / Formation', 'education-formation'),
    ('Transport / Logistique', 'transport-logistique'),
    ('Agriculture / Agroalimentaire', 'agriculture-agroalimentaire'),
]

COMPANIES = [
    {'name': 'Camtel', 'slug': 'camtel', 'description': 'Operateur de telecommunications au Cameroun.', 'email': 'hr@camtel.cm', 'location': 'Yaounde', 'industry': 'Telecommunications', 'size': 'large'},
    {'name': 'MTN Cameroon', 'slug': 'mtn-cameroon', 'description': 'Leader des telecoms mobiles au Cameroun.', 'email': 'jobs@mtn.cm', 'location': 'Douala', 'industry': 'Telecommunications', 'size': 'large'},
    {'name': 'Sedima', 'slug': 'sedima', 'description': 'Leader de la volaille au Cameroun.', 'email': 'recrutement@sedima.cm', 'location': 'Douala', 'industry': 'Agroalimentaire', 'size': 'medium'},
    {'name': 'Nkambe Agro', 'slug': 'nkambe-agro', 'description': 'Entreprise agroalimentaire basee dans l\'Adamaoua.', 'email': 'hr@nkambe-agro.cm', 'location': 'Ngaoundere', 'industry': 'Agriculture', 'size': 'small'},
    {'name': 'Digital Cameroon', 'slug': 'digital-cameroon', 'description': 'Startup tech specialisee dans les solutions digitales.', 'email': 'team@digitalcm.cm', 'location': 'Yaounde', 'industry': 'Informatique', 'size': 'small'},
    {'name': 'Ecobank Cameroon', 'slug': 'ecobank-cameroon', 'description': 'Banque pan-africaine presente au Cameroun.', 'email': 'careers@ecobank.cm', 'location': 'Douala', 'industry': 'Finance', 'size': 'large'},
    {'name': 'Activa International Insurance', 'slug': 'activa-assurance', 'description': 'Compagnie d\'assurance multirisque au Cameroun.', 'email': 'rh@activa-assurance.cm', 'location': 'Douala', 'industry': 'Assurance', 'size': 'medium'},
    {'name': 'Nexttel', 'slug': 'nexttel', 'description': 'Operateur mobile camerounais.', 'email': 'jobs@nexttel.cm', 'location': 'Yaounde', 'industry': 'Telecommunications', 'size': 'medium'},
]

OFFERS = [
    {'title': 'Developpeur Full Stack React/Django', 'desc': 'Nous recherchons un developpeur full stack passionne pour rejoindre notre equipe technique.\n\nMissions:\n- Developper et maintenir des applications web\n- Participer a l\'architecture technique\n- Code review et mentorat\n\nRequis: 2 ans d\'experience, React, Django, PostgreSQL', 'loc': 'Yaounde', 'type': 'full_time', 'exp': 'mid', 'sal_min': 300000, 'sal_max': 600000},
    {'title': 'Commercial Terrain H/F', 'desc': 'Poste de commercial terrain pour la prospection de nouveaux clients.\n\nMissions:\n- Prospection et prise de contact\n- Presentation des offres\n- Suivi des dossiers\n- Objectifs de vente', 'loc': 'Douala', 'type': 'full_time', 'exp': 'junior', 'sal_min': 100000, 'sal_max': 200000},
    {'title': 'Stage Marketing Digital', 'desc': 'Stage de 6 mois au sein de notre departement marketing.\n\nMissions:\n- Gestion des reseaux sociaux\n- Creation de contenu\n- Analytics et reporting\n- Campagnes publicitaires', 'loc': 'Yaounde', 'type': 'internship', 'exp': 'entry', 'sal_min': 50000, 'sal_max': 80000},
    {'title': 'Comptable Senior', 'desc': 'Nous recherchons un comptable experimente pour gerer la comptabilite de l\'entreprise.\n\nMissions:\n- Tenue de la comptabilite\n- Declarations fiscales\n- Reporting financier\n- Encadrement de l\'equipe comptable', 'loc': 'Douala', 'type': 'cdi', 'exp': 'senior', 'sal_min': 400000, 'sal_max': 700000},
    {'title': 'Ingenieur Reseau', 'desc': 'Poste d\'ingenieur reseau pour la maintenance et l\'evolution de notre infrastructure.\n\nMissions:\n- Installation et configuration des equipements\n- Maintenance preventive et curative\n- Securisation du reseau', 'loc': 'Yaounde', 'type': 'full_time', 'exp': 'mid', 'sal_min': 250000, 'sal_max': 500000},
    {'title': 'Charge de Communication', 'desc': 'Poste de charge de communication interne et externe.\n\nMissions:\n- Redaction de contenus\n- Gestion de la communication interne\n- Relations presse\n- Organisation d\'evenements', 'loc': 'Douala', 'type': 'full_time', 'exp': 'junior', 'sal_min': 150000, 'sal_max': 300000},
    {'title': 'Freelance UI/UX Designer', 'desc': 'Nous recherchons un designer UI/UX freelance pour un projet de 3 mois.\n\nMissions:\n- Maquettes et prototypes\n- Design system\n- Tests utilisateurs\n- Collaboration avec l\'equipe dev', 'loc': 'Yaounde', 'type': 'freelance', 'exp': 'mid', 'sal_min': 200000, 'sal_max': 400000},
    {'title': 'Assistant(e) RH', 'desc': 'Poste d\'assistant(e) RH pour soutenir notre departement ressources humaines.\n\nMissions:\n- Gestion des dossiers du personnel\n- Recrutement et integration\n- Administration du personnel\n- Paie', 'loc': 'Bafoussam', 'type': 'part_time', 'exp': 'entry', 'sal_min': 80000, 'sal_max': 120000},
    {'title': 'Chef de Projet IT', 'desc': 'Nous recherchons un chef de projet IT experimente.\n\nMissions:\n- Pilotage de projets IT\n- Coordination des equipes\n- Definition des specs\n- Suivi et reporting', 'loc': 'Yaounde', 'type': 'full_time', 'exp': 'senior', 'sal_min': 500000, 'sal_max': 800000},
    {'title': 'Developpeur Mobile React Native', 'desc': 'Poste de developpeur mobile pour créer notre application mobile.\n\nMissions:\n- Developpement React Native\n- Integation API REST\n- Tests et deploiement\n- Maintenance', 'loc': 'Douala', 'type': 'full_time', 'exp': 'mid', 'sal_min': 250000, 'sal_max': 500000},
    {'title': 'Stage Administration Systeme', 'desc': 'Stage de 3 mois en administration systeme.\n\nMissions:\n- Supervision des serveurs\n- Gestion des sauvegardes\n- Documentation technique\n- Support utilisateurs', 'loc': 'Yaounde', 'type': 'internship', 'exp': 'entry', 'sal_min': 40000, 'sal_max': 70000},
    {'title': 'Vendeur / Conseiller Commercial', 'desc': 'Poste de vendeur en magasin.\n\nMissions:\n- Accueil et conseil client\n- Encaissement\n- Gestion du stock\n- Objectifs de vente', 'loc': 'Kribi', 'type': 'contract', 'exp': 'entry', 'sal_min': 70000, 'sal_max': 120000},
]


class Command(BaseCommand):
    help = 'Peuple la base de donnees avec des donnees de test'

    def handle(self, *args, **options):
        self.stdout.write('Creation des donnees de test...')

        admin, _ = User.objects.get_or_create(
            email='admin@job237.cm',
            defaults={'first_name': 'Admin', 'last_name': 'Job237', 'role': 'admin', 'is_staff': True, 'is_superuser': True}
        )
        admin.set_password('admin1234')
        admin.save()

        recruiter, _ = User.objects.get_or_create(
            email='recruteur@job237.cm',
            defaults={'first_name': 'Paul', 'last_name': 'Njoya', 'role': 'recruiter', 'is_verified': True}
        )
        recruiter.set_password('recruteur1234')
        recruiter.save()

        candidate, _ = User.objects.get_or_create(
            email='candidat@job237.cm',
            defaults={'first_name': 'Marie', 'last_name': 'Kamga', 'role': 'candidate', 'is_verified': True}
        )
        candidate.set_password('candidat1234')
        candidate.save()

        CandidateProfile.objects.get_or_create(
            user=candidate,
            defaults={'phone': '+237690000000', 'location': 'Yaounde', 'skills': ['Python', 'Django', 'React', 'PostgreSQL'], 'experience_years': 3, 'education_level': 'master'}
        )

        for cat_name, cat_slug in CATEGORIES:
            JobCategory.objects.get_or_create(slug=cat_slug, defaults={'name': cat_name})

        categories = list(JobCategory.objects.all())

        for comp_data in COMPANIES:
            Company.objects.get_or_create(
                slug=comp_data['slug'],
                defaults={**comp_data, 'owner': recruiter, 'is_verified': True}
            )

        companies = list(Company.objects.all())

        now = timezone.now()
        for i, offer_data in enumerate(OFFERS):
            from django.utils.text import slugify
            slug = slugify(offer_data['title'])[:50]
            JobOffer.objects.get_or_create(
                slug=slug,
                defaults={
                    'company': companies[i % len(companies)],
                    'category': random.choice(categories),
                    'title': offer_data['title'],
                    'description': offer_data['desc'],
                    'location': offer_data['loc'],
                    'job_type': offer_data['type'],
                    'experience_level': offer_data['exp'],
                    'salary_min': offer_data['sal_min'],
                    'salary_max': offer_data['sal_max'],
                    'deadline': now + timedelta(days=random.randint(14, 60)),
                    'is_active': True,
                    'views_count': random.randint(10, 500),
                }
            )

        self.stdout.write(self.style.SUCCESS('Done! Donnees de test creees.'))
        self.stdout.write(f'  Admin:      admin@job237.cm / admin1234')
        self.stdout.write(f'  Recruteur:  recruteur@job237.cm / recruteur1234')
        self.stdout.write(f'  Candidat:   candidat@job237.cm / candidat1234')
