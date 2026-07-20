from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from campaign.models import Contribution


DEMO_ROWS = [
    dict(contributor_type='etudiant', nom='Nkomo', prenom='Marie-Claire', telephone='+237677123456',
         email='marie.nkomo@student.ud.ac.cm', niveau_academique='licence3', filiere='Médecine',
         ecole="Faculté de Médecine et des Sciences Pharmaceutiques de l'Université de Douala",
         numero_carte_etudiant='UD-MED-2024-8841', mode_paiement='en_ligne', methode_preferee='orange',
         amount=20000, payment_method='orange', payment_status='SUCCESSFUL',
         campay_reference='DEMO-CMP-001'),
    dict(contributor_type='etudiant', nom='Abanda', prenom='Jean-Paul', telephone='+237694567890',
         email='jp.abanda@univ-yaounde1.cm', niveau_academique='master1', filiere='Santé publique',
         ecole='Faculté de Médecine et des Sciences Biomédicales de Yaoundé',
         numero_carte_etudiant='UY1-FMSB-7720', mode_paiement='en_ligne', methode_preferee='mtn',
         amount=20000, payment_method='mtn', payment_status='SUCCESSFUL',
         campay_reference='DEMO-CMP-002'),
    dict(contributor_type='etudiant', nom='Manga', prenom='Stéphanie', telephone='+237655334422',
         email='s.manga@udschang.cm', niveau_academique='licence2', filiere='Pharmacie',
         ecole="Faculté de Médecine et des Sciences Pharmaceutiques de l'Université de Dschang",
         numero_carte_etudiant='UDS-PHAR-5512', mode_paiement='especes', methode_preferee='orange',
         amount=20000, payment_status='PENDING'),
    dict(contributor_type='etudiant', nom='Tchoumi', prenom='Eric', telephone='+237678901234',
         email='eric.tchoumi@gmail.com', niveau_academique='doctorat', filiere='Médecine',
         ecole="Faculté de Médecine et des Sciences Biomédicales de l'Université de Garoua",
         numero_carte_etudiant='UGA-MED-3301', mode_paiement='en_ligne', methode_preferee='orange',
         amount=20000, payment_method='orange', payment_status='SUCCESSFUL',
         campay_reference='DEMO-CMP-004'),
    dict(contributor_type='etudiant', nom='Fotsing', prenom='Brice', telephone='+237699887766',
         email='brice.f@montagnes.cm', niveau_academique='licence1', filiere='Sciences infirmières',
         ecole='Université des Montagnes', numero_carte_etudiant='UM-SI-1190',
         mode_paiement='especes', methode_preferee='mtn', amount=20000, payment_status='PENDING'),
    dict(contributor_type='etudiant', nom='Essomba', prenom='Patricia', telephone='+237671223344',
         email='p.essomba@issse.cm', niveau_academique='ide', filiere='IDE',
         ecole='École des Sciences de la Santé de Bertoua', numero_carte_etudiant='ISSSE-IDE-442',
         mode_paiement='en_ligne', methode_preferee='mtn', amount=20000, payment_method='mtn',
         payment_status='FAILED', campay_reference='DEMO-CMP-FAIL'),
    dict(contributor_type='etudiant', nom='Ndjock', prenom='Alain', telephone='+237656778899',
         email='alain.ndjock@doumaintang.cm', niveau_academique='ide', filiere='Soins infirmiers',
         ecole='Institut des IDE de Doumaintang', numero_carte_etudiant='IDE-DMT-88',
         mode_paiement='en_ligne', methode_preferee='orange', amount=20000, payment_method='orange',
         payment_status='SUCCESSFUL', campay_reference='DEMO-CMP-007'),
    dict(contributor_type='donateur', nom='Pharmacie du Centre', telephone='+237677445566',
         email='contact@pharmaciecentre.cm', mode_paiement='en_ligne', methode_preferee='orange',
         amount=100000, payment_method='orange', payment_status='SUCCESSFUL',
         campay_reference='DEMO-DON-001'),
    dict(contributor_type='donateur', nom='M. Nguefack', telephone='+237694112233', email='',
         mode_paiement='en_ligne', methode_preferee='mtn', amount=25000, payment_method='mtn',
         payment_status='SUCCESSFUL', campay_reference='DEMO-DON-002'),
    dict(contributor_type='donateur', nom='Société BICEC Douala', telephone='+237699001122',
         email='partenariat@bicec.cm', mode_paiement='en_ligne', methode_preferee='orange',
         amount=500000, payment_method='orange', payment_status='SUCCESSFUL',
         campay_reference='DEMO-DON-003'),
    dict(contributor_type='donateur', nom='Mme Atangana', telephone='+237655667788', email='',
         mode_paiement='en_ligne', methode_preferee='mtn', amount=10000, payment_method='mtn',
         payment_status='PENDING', campay_reference='DEMO-DON-PEND'),
    dict(contributor_type='donateur', nom='Dr. Owona', telephone='+237678334455',
         email='dr.owona@health.cm', mode_paiement='en_ligne', methode_preferee='orange',
         amount=75000, payment_method='orange', payment_status='SUCCESSFUL',
         campay_reference='DEMO-DON-005'),
]


class Command(BaseCommand):
    help = 'Insère des contributions fictives pour tester le dashboard admin.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Supprime les contributions existantes avant insertion.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            deleted, _ = Contribution.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'{deleted} enregistrement(s) supprimé(s).'))

        now = timezone.now()
        created = 0
        for i, row in enumerate(DEMO_ROWS):
            Contribution.objects.create(
                **row,
                created_at=now - timedelta(days=len(DEMO_ROWS) - i, hours=i * 3),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'{created} contributions de démo créées.'))
        self.stdout.write('Connectez-vous sur /admin-dashboard avec un compte admin Django.')
