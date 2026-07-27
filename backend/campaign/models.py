from django.db import models

STUDENT_FEE = 20000
MIN_INSTALLMENT = 5000


class Contribution(models.Model):
    METHODE_CHOICES = [
        ('orange', 'Orange Money'),
        ('mtn', 'MTN Mobile Money'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('PARTIAL', 'Partiellement payé'),
        ('SUCCESSFUL', 'Payé'),
        ('FAILED', 'Échoué'),
    ]
    CONTRIBUTOR_TYPE_CHOICES = [
        ('etudiant', 'Étudiant'),
        ('donateur', 'Donateur'),
        ('benevole', 'Bénévole'),
    ]
    NIVEAU_CHOICES = [
        ('licence1', 'Licence 1'),
        ('licence2', 'Licence 2'),
        ('licence3', 'Licence 3'),
        ('master1', 'Master 1'),
        ('master2', 'Master 2'),
        ('doctorat', 'Doctorat'),
    ]
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    OUI_NON_CHOICES = [
        ('oui', 'Oui'),
        ('non', 'Non'),
    ]
    MODE_PAIEMENT_CHOICES = [
        ('en_ligne', 'Paiement en ligne'),
        ('especes', 'Paiement en espèces'),
    ]

    contributor_type = models.CharField(
        max_length=10, choices=CONTRIBUTOR_TYPE_CHOICES, null=True, blank=True,
    )

    nom = models.CharField(max_length=180)
    prenom = models.CharField(max_length=100, blank=True)
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, blank=True)
    telephone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    methode_preferee = models.CharField(max_length=10, choices=METHODE_CHOICES, default='orange')

    niveau_academique = models.CharField(max_length=20, choices=NIVEAU_CHOICES, blank=True)
    ecole = models.CharField(max_length=255, blank=True)
    filiere = models.CharField(max_length=180, blank=True)
    ville_residence = models.CharField(max_length=180, blank=True)

    deja_participe_campagne = models.CharField(max_length=3, choices=OUI_NON_CHOICES, blank=True)
    ressortissant_est = models.CharField(max_length=3, choices=OUI_NON_CHOICES, blank=True)
    parle_makaa = models.CharField(max_length=3, choices=OUI_NON_CHOICES, blank=True)
    taille_tshirt = models.CharField(max_length=10, blank=True)
    allergies_sante = models.TextField(blank=True)
    attentes_campagne = models.TextField(blank=True)

    contact_urgence_nom = models.CharField(max_length=180, blank=True)
    contact_urgence_lien = models.CharField(max_length=80, blank=True)
    contact_urgence_telephone = models.CharField(max_length=20, blank=True)
    contact_urgence_ville = models.CharField(max_length=180, blank=True)

    photo = models.FileField(upload_to='student_photos/%Y/%m/', blank=True, null=True)
    numero_carte_etudiant = models.CharField(max_length=80, blank=True)

    mode_paiement = models.CharField(
        max_length=10, choices=MODE_PAIEMENT_CHOICES, default='en_ligne',
    )
    payment_proof = models.FileField(upload_to='payment_proofs/%Y/%m/', blank=True, null=True)

    amount = models.PositiveIntegerField(null=True, blank=True)
    amount_paid = models.PositiveIntegerField(default=0)
    payment_method = models.CharField(max_length=10, choices=METHODE_CHOICES, null=True, blank=True)
    campay_reference = models.CharField(max_length=100, blank=True)
    payment_status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='PENDING')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nom} — {self.amount or 0} FCFA ({self.payment_status})"

    @property
    def display_name(self):
        if self.prenom:
            return f"{self.prenom} {self.nom}".strip()
        return self.nom

    @property
    def fee_total(self):
        if self.contributor_type == 'etudiant':
            return self.amount or STUDENT_FEE
        return self.amount or 0

    @property
    def amount_due(self):
        return max(0, self.fee_total - self.amount_paid)

    def sync_amount_paid(self):
        total = self.installments.filter(payment_status='SUCCESSFUL').aggregate(
            total=models.Sum('amount'),
        )['total'] or 0
        if total == 0 and self.payment_status == 'SUCCESSFUL' and self.amount:
            total = self.amount
        self.amount_paid = total

    def recalculate_payment_status(self):
        if self.contributor_type != 'etudiant':
            if self.amount_paid >= (self.amount or 0) and self.amount:
                self.payment_status = 'SUCCESSFUL'
            return

        fee = self.fee_total
        if self.amount_paid >= fee:
            self.payment_status = 'SUCCESSFUL'
        elif self.amount_paid > 0:
            self.payment_status = 'PARTIAL'
        elif self.payment_status not in ('FAILED',):
            self.payment_status = 'PENDING'


class PaymentInstallment(models.Model):
    contribution = models.ForeignKey(
        Contribution, related_name='installments', on_delete=models.CASCADE,
    )
    installment_number = models.PositiveSmallIntegerField()
    amount = models.PositiveIntegerField()
    mode_paiement = models.CharField(
        max_length=10, choices=Contribution.MODE_PAIEMENT_CHOICES, default='en_ligne',
    )
    payment_method = models.CharField(
        max_length=10, choices=Contribution.METHODE_CHOICES, null=True, blank=True,
    )
    campay_reference = models.CharField(max_length=100, blank=True)
    payment_proof = models.FileField(upload_to='payment_proofs/%Y/%m/', blank=True, null=True)
    payment_status = models.CharField(
        max_length=12, choices=Contribution.STATUS_CHOICES, default='PENDING',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['installment_number', 'created_at']

    def __str__(self):
        return f"Tranche {self.installment_number} — {self.amount} FCFA ({self.payment_status})"

 
class Payment(models.Model):
    """Record of an external payment provider notification (Taramoney).

    Stores the raw payload and optional links to Contribution or PaymentInstallment.
    """
    contribution = models.ForeignKey(
        Contribution, related_name='payments', null=True, blank=True, on_delete=models.SET_NULL,
    )
    installment = models.ForeignKey(
        PaymentInstallment, related_name='payments', null=True, blank=True, on_delete=models.SET_NULL,
    )
    business_id = models.CharField(max_length=120, blank=True)
    payment_id = models.CharField(max_length=200, blank=True)
    collection_id = models.CharField(max_length=200, blank=True)
    phone_number = models.CharField(max_length=40, blank=True)
    vendor = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=32, blank=True)
    raw_payload = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.payment_id or 'unknown'} — {self.status}"
