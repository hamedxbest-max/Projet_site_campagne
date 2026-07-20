# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campaign', '0001_initial'),
    ]

    operations = [
        migrations.AddField(model_name='contribution', name='age', field=models.PositiveSmallIntegerField(blank=True, null=True)),
        migrations.AddField(model_name='contribution', name='sexe', field=models.CharField(blank=True, choices=[('M', 'Masculin'), ('F', 'Féminin')], max_length=1)),
        migrations.AddField(model_name='contribution', name='ville_residence', field=models.CharField(blank=True, max_length=180)),
        migrations.AddField(model_name='contribution', name='deja_participe_campagne', field=models.CharField(blank=True, choices=[('oui', 'Oui'), ('non', 'Non')], max_length=3)),
        migrations.AddField(model_name='contribution', name='ressortissant_est', field=models.CharField(blank=True, choices=[('oui', 'Oui'), ('non', 'Non')], max_length=3)),
        migrations.AddField(model_name='contribution', name='parle_makaa', field=models.CharField(blank=True, choices=[('oui', 'Oui'), ('non', 'Non')], max_length=3)),
        migrations.AddField(model_name='contribution', name='taille_tshirt', field=models.CharField(blank=True, max_length=10)),
        migrations.AddField(model_name='contribution', name='allergies_sante', field=models.TextField(blank=True)),
        migrations.AddField(model_name='contribution', name='attentes_campagne', field=models.TextField(blank=True)),
        migrations.AddField(model_name='contribution', name='contact_urgence_nom', field=models.CharField(blank=True, max_length=180)),
        migrations.AddField(model_name='contribution', name='contact_urgence_lien', field=models.CharField(blank=True, max_length=80)),
        migrations.AddField(model_name='contribution', name='contact_urgence_telephone', field=models.CharField(blank=True, max_length=20)),
        migrations.AddField(model_name='contribution', name='contact_urgence_ville', field=models.CharField(blank=True, max_length=180)),
        migrations.AddField(model_name='contribution', name='photo', field=models.ImageField(blank=True, null=True, upload_to='student_photos/%Y/%m/')),
        migrations.AlterField(
            model_name='contribution',
            name='niveau_academique',
            field=models.CharField(blank=True, choices=[('licence1', 'Licence 1'), ('licence2', 'Licence 2'), ('licence3', 'Licence 3'), ('master1', 'Master 1'), ('master2', 'Master 2'), ('doctorat', 'Doctorat')], max_length=20),
        ),
    ]
