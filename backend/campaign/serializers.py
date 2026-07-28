from rest_framework import serializers
from .models import Contribution, PaymentInstallment, STUDENT_FEE, MIN_INSTALLMENT

MAX_PHOTO_BYTES = 5 * 1024 * 1024
ALLOWED_PHOTO_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}


class PaymentInstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentInstallment
        fields = [
            'id', 'installment_number', 'amount', 'mode_paiement',
            'payment_method', 'payment_status', 'campay_reference',
            'created_at',
        ]


class ContributionSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    amount_due = serializers.IntegerField(read_only=True)
    fee_total = serializers.IntegerField(read_only=True)
    installments = PaymentInstallmentSerializer(many=True, read_only=True)
    photo = serializers.SerializerMethodField()
    payment_proof = serializers.SerializerMethodField()

    def get_photo(self, obj):
        if not obj.photo:
            return ''
        request = self.context.get('request')
        url = obj.photo.url
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    def get_payment_proof(self, obj):
        if not obj.payment_proof:
            return ''
        request = self.context.get('request')
        url = obj.payment_proof.url
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    class Meta:
        model = Contribution
        fields = [
            'id', 'contributor_type', 'nom', 'prenom', 'display_name',
            'age', 'sexe', 'telephone', 'email', 'methode_preferee',
            'niveau_academique', 'ecole', 'filiere', 'ville_residence',
            'deja_participe_campagne', 'ressortissant_est', 'parle_makaa',
            'taille_tshirt', 'allergies_sante', 'attentes_campagne',
            'contact_urgence_nom', 'contact_urgence_lien',
            'contact_urgence_telephone', 'contact_urgence_ville',
            'photo', 'numero_carte_etudiant',
            'mode_paiement', 'payment_proof',
            'amount', 'amount_paid', 'amount_due', 'fee_total',
            'payment_method', 'payment_status', 'campay_reference',
            'installments', 'created_at',
        ]
        read_only_fields = ['id', 'payment_status', 'campay_reference', 'amount_paid', 'created_at']


class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = [
            'nom', 'prenom', 'age', 'sexe', 'telephone', 'email', 'methode_preferee',
            'niveau_academique', 'ecole', 'filiere', 'ville_residence',
            'deja_participe_campagne', 'ressortissant_est', 'parle_makaa',
            'taille_tshirt', 'allergies_sante', 'attentes_campagne',
            'contact_urgence_nom', 'contact_urgence_lien',
            'contact_urgence_telephone', 'contact_urgence_ville',
            'photo',
        ]
        extra_kwargs = {
            'allergies_sante': {'required': False, 'allow_blank': True},
            'attentes_campagne': {'required': False, 'allow_blank': True},
            'photo': {'required': False},
        }

    def validate_email(self, value):
        # Email is optional for students; accept blank/None
        if not value:
            return ''
        return value.strip()

    def validate_telephone(self, value):
        if not value or len(value.strip()) < 8:
            raise serializers.ValidationError('Numéro de téléphone invalide.')
        return value.strip()

    def validate_age(self, value):
        if value is not None and (value < 16 or value > 65):
            raise serializers.ValidationError('Âge invalide (16–65 ans).')
        return value

    def validate_niveau_academique(self, value):
        if not value:
            raise serializers.ValidationError('Niveau d\'étude requis.')
        return value

    def validate_filiere(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Filière requise.')
        return value.strip()

    def validate_ecole(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Université / Faculté requise.')
        return value.strip()

    def validate_photo(self, value):
        if not value:
            return value
        if value.size > MAX_PHOTO_BYTES:
            raise serializers.ValidationError('La photo ne doit pas dépasser 5 Mo.')
        content_type = (getattr(value, 'content_type', '') or '').lower()
        name = (getattr(value, 'name', '') or '').lower()
        if name.endswith(('.heic', '.heif')):
            raise serializers.ValidationError(
                'Format HEIC non supporté. Utilisez JPG ou PNG.',
            )
        if content_type and content_type not in ALLOWED_PHOTO_TYPES:
            raise serializers.ValidationError('Format non supporté. Utilisez JPG, PNG ou WEBP.')
        if not content_type:
            allowed_ext = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
            if not any(name.endswith(ext) for ext in allowed_ext):
                raise serializers.ValidationError('Format non supporté. Utilisez JPG ou PNG.')
        return value

    def create(self, validated_data):
        validated_data['contributor_type'] = 'etudiant'
        validated_data['amount'] = STUDENT_FEE
        validated_data['amount_paid'] = 0
        validated_data['payment_status'] = 'PENDING'
        return super().create(validated_data)


class DonorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = ['nom', 'telephone', 'email', 'methode_preferee']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
        }

    def validate_telephone(self, value):
        if not value or len(value.strip()) < 8:
            raise serializers.ValidationError('Numéro de téléphone invalide.')
        return value.strip()

    def create(self, validated_data):
        validated_data['contributor_type'] = 'donateur'
        validated_data['mode_paiement'] = 'en_ligne'
        validated_data['payment_status'] = 'PENDING'
        validated_data['amount_paid'] = 0
        return super().create(validated_data)


class PaymentRequestSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)
    phone = serializers.CharField(max_length=20)
    method = serializers.ChoiceField(choices=['orange', 'mtn'])


class CashInstallmentSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1, required=False)


class RegisteredStudentSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    niveau_label = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Contribution
        fields = [
            'id', 'display_name', 'ecole', 'niveau_academique',
            'niveau_label', 'filiere', 'payment_status', 'status_label', 'created_at',
        ]

    def get_niveau_label(self, obj):
        return obj.get_niveau_academique_display() if obj.niveau_academique else ''

    def get_status_label(self, obj):
        if obj.payment_status == 'SUCCESSFUL':
            return 'Inscrit'
        if obj.payment_status == 'PARTIAL':
            return f'Partiel ({obj.amount_paid:,} FCFA)'.replace(',', ' ')
        if obj.mode_paiement == 'especes':
            return 'En validation'
        return 'En attente'
