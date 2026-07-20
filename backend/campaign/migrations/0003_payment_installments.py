from django.db import migrations, models
import django.db.models.deletion


def backfill_amount_paid(apps, schema_editor):
    Contribution = apps.get_model('campaign', 'Contribution')
    for c in Contribution.objects.filter(payment_status='SUCCESSFUL'):
        if c.amount and not c.amount_paid:
            c.amount_paid = c.amount
            c.save(update_fields=['amount_paid'])


class Migration(migrations.Migration):

    dependencies = [
        ('campaign', '0002_student_extended_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='contribution',
            name='amount_paid',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='contribution',
            name='payment_status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'En attente'),
                    ('PARTIAL', 'Partiellement payé'),
                    ('SUCCESSFUL', 'Payé'),
                    ('FAILED', 'Échoué'),
                ],
                default='PENDING',
                max_length=12,
            ),
        ),
        migrations.CreateModel(
            name='PaymentInstallment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('installment_number', models.PositiveSmallIntegerField()),
                ('amount', models.PositiveIntegerField()),
                ('mode_paiement', models.CharField(
                    choices=[('en_ligne', 'Paiement en ligne'), ('especes', 'Paiement en espèces')],
                    default='en_ligne',
                    max_length=10,
                )),
                ('payment_method', models.CharField(
                    blank=True,
                    choices=[('orange', 'Orange Money'), ('mtn', 'MTN Mobile Money')],
                    max_length=10,
                    null=True,
                )),
                ('campay_reference', models.CharField(blank=True, max_length=100)),
                ('payment_proof', models.FileField(blank=True, null=True, upload_to='payment_proofs/%Y/%m/')),
                ('payment_status', models.CharField(
                    choices=[
                        ('PENDING', 'En attente'),
                        ('PARTIAL', 'Partiellement payé'),
                        ('SUCCESSFUL', 'Payé'),
                        ('FAILED', 'Échoué'),
                    ],
                    default='PENDING',
                    max_length=12,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('contribution', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='installments',
                    to='campaign.contribution',
                )),
            ],
            options={
                'ordering': ['installment_number', 'created_at'],
            },
        ),
        migrations.RunPython(backfill_amount_paid, migrations.RunPython.noop),
    ]
