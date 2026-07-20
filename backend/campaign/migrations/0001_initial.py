# Generated manually for BOUAN'O DOUMAINTANG

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Contribution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contributor_type', models.CharField(blank=True, choices=[('etudiant', 'Étudiant'), ('donateur', 'Donateur'), ('benevole', 'Bénévole')], max_length=10, null=True)),
                ('nom', models.CharField(max_length=180)),
                ('prenom', models.CharField(blank=True, max_length=100)),
                ('telephone', models.CharField(max_length=20)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('methode_preferee', models.CharField(choices=[('orange', 'Orange Money'), ('mtn', 'MTN Mobile Money')], default='orange', max_length=10)),
                ('niveau_academique', models.CharField(blank=True, choices=[('licence1', 'Licence 1'), ('licence2', 'Licence 2'), ('licence3', 'Licence 3'), ('master1', 'Master 1'), ('master2', 'Master 2'), ('doctorat', 'Doctorat'), ('ide', 'IDE / Infirmier'), ('autre', 'Autre')], max_length=20)),
                ('ecole', models.CharField(blank=True, max_length=255)),
                ('filiere', models.CharField(blank=True, max_length=180)),
                ('numero_carte_etudiant', models.CharField(blank=True, max_length=80)),
                ('mode_paiement', models.CharField(choices=[('en_ligne', 'Paiement en ligne'), ('especes', 'Paiement en espèces')], default='en_ligne', max_length=10)),
                ('payment_proof', models.FileField(blank=True, null=True, upload_to='payment_proofs/%Y/%m/')),
                ('amount', models.PositiveIntegerField(blank=True, null=True)),
                ('payment_method', models.CharField(blank=True, choices=[('orange', 'Orange Money'), ('mtn', 'MTN Mobile Money')], max_length=10, null=True)),
                ('campay_reference', models.CharField(blank=True, max_length=100)),
                ('payment_status', models.CharField(choices=[('PENDING', 'En attente'), ('SUCCESSFUL', 'Payé'), ('FAILED', 'Échoué')], default='PENDING', max_length=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
