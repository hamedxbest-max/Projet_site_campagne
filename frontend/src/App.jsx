import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Stethoscope, HeartHandshake, GraduationCap, Users,
  CreditCard, Banknote, ShieldCheck, Upload, ArrowLeft,
} from 'lucide-react';
import SunProgress from './components/SunProgress.jsx';
import CountdownTimer from './components/CountdownTimer.jsx';
import GoalThermometer from './components/GoalThermometer.jsx';
import StatStrip from './components/StatStrip.jsx';
import LogoMarquee from './components/LogoMarquee.jsx';
import PartnerLogoGrid from './components/PartnerLogoGrid.jsx';
import PartnerOrganizationsGrid from './components/PartnerOrganizationsGrid.jsx';
import ShareButton from './components/ShareButton.jsx';
import RegisteredStudentsList from './components/RegisteredStudentsList.jsx';
import { PARTNER_SCHOOLS, PARTNER_SCHOOL_NAMES } from './data/partnerSchools.js';
import {
  EMPTY_STUDENT_FORM,
  FILIERE_OPTIONS,
  NIVEAU_ETUDE_OPTIONS,
  TAILLE_TSHIRT_OPTIONS,
} from './data/studentFormConfig.js';
import {
  createStudentRegistration,
  createDonorRegistration,
  initiatePayment,
  getPaymentStatus,
  confirmCashPayment,
  uploadPaymentProof,
  STUDENT_FEE,
  MIN_DONATION,
  MAX_PHOTO_BYTES,
} from './api/client.js';
import FormErrorSummary from './components/FormErrorSummary.jsx';
import FormField from './components/FormField.jsx';
import {
  formatApiError,
  parseApiFieldErrors,
  scrollToFirstFormError,
} from './utils/formErrors.js';
import { preparePhotoForUpload } from './utils/imageUpload.js';

const TOTAL_STEPS = 12;

const NIVEAU_OPTIONS = NIVEAU_ETUDE_OPTIONS;

const EMPTY_STUDENT = { ...EMPTY_STUDENT_FORM };

const EMPTY_DONOR = {
  nom: '', telephone: '', email: '', methode_preferee: 'orange',
};

function clearFieldError(setErrors, field) {
  setErrors((prev) => {
    if (!prev[field]) return prev;
    const next = { ...prev };
    delete next[field];
    return next;
  });
}

export default function App() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [userType, setUserType] = useState(null); // 'etudiant' | 'donateur'
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT);
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [donorForm, setDonorForm] = useState(EMPTY_DONOR);
  const [errors, setErrors] = useState({});
  const [contributionId, setContributionId] = useState(null);
  const [amount, setAmount] = useState(STUDENT_FEE);
  const [payPhone, setPayPhone] = useState('');
  const [payMethod, setPayMethod] = useState('orange');
  const [paymentMode, setPaymentMode] = useState('en_ligne'); // en_ligne | especes
  const [paymentProof, setPaymentProof] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payStatus, setPayStatus] = useState(null);
  const [payError, setPayError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedAs, setCompletedAs] = useState(null); // 'online' | 'cash'

  const goNext = () => { setDirection('forward'); setStep((s) => Math.min(TOTAL_STEPS, s + 1)); };
  const goBack = () => { setDirection('back'); setStep((s) => Math.max(1, s - 1)); };
  const goToStep = (n) => { setDirection(n > step ? 'forward' : 'back'); setStep(n); };

  

  function chooseUserType(type) {
    setUserType(type);
    setAmount(type === 'etudiant' ? STUDENT_FEE : 10000);
    setPaymentMode('en_ligne');
    setPayError('');
    setErrors({});
    goNext();
  }

  function validateStudentForm() {
    const e = {};
    if (!studentForm.nom.trim()) e.nom = 'Nom requis.';
    if (!studentForm.prenom.trim()) e.prenom = 'Prénom(s) requis.';
    const age = Number(studentForm.age);
    if (!studentForm.age || Number.isNaN(age) || age < 16 || age > 65) e.age = 'Âge invalide (16–65 ans).';
    if (!studentForm.sexe) e.sexe = 'Sexe requis.';
    if (!studentForm.filiere) e.filiere = 'Filière requise.';
    if (!studentForm.niveau_academique) e.niveau_academique = 'Niveau d\'étude requis.';
    if (!/^\+?[0-9]{8,15}$/.test(studentForm.telephone.trim())) e.telephone = 'Numéro invalide.';
    if (studentForm.email && studentForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentForm.email.trim())) {
      e.email = 'Email invalide.';
    }
    if (!studentForm.ecole.trim()) e.ecole = 'Université / Faculté requise.';
    if (!studentForm.ville_residence.trim()) e.ville_residence = 'Ville de résidence requise.';
    if (!studentForm.deja_participe_campagne) e.deja_participe_campagne = 'Réponse requise.';
    if (!studentForm.ressortissant_est) e.ressortissant_est = 'Réponse requise.';
    if (!studentForm.parle_makaa) e.parle_makaa = 'Réponse requise.';
    if (!studentForm.taille_tshirt) e.taille_tshirt = 'Taille de T-shirt requise.';
    if (!studentForm.contact_urgence_nom.trim()) e.contact_urgence_nom = 'Nom requis.';
    if (!studentForm.contact_urgence_lien.trim()) e.contact_urgence_lien = 'Lien de parenté requis.';
    if (!/^\+?[0-9]{8,15}$/.test(studentForm.contact_urgence_telephone.trim())) {
      e.contact_urgence_telephone = 'Numéro invalide.';
    }
    if (!studentForm.contact_urgence_ville.trim()) e.contact_urgence_ville = 'Ville requise.';
    if (studentPhoto) {
      if (!studentPhoto.type.startsWith('image/')) {
        e.photo = 'Le fichier doit être une image (JPG, PNG, etc.).';
      } else if (studentPhoto.size > MAX_PHOTO_BYTES) {
        e.photo = 'La photo ne doit pas dépasser 5 Mo.';
      }
    }
    setErrors(e);
    if (Object.keys(e).length > 0) scrollToFirstFormError();
    return Object.keys(e).length === 0;
  }

  function validateDonorForm() {
    const e = {};
    if (!donorForm.nom.trim()) e.nom = 'Nom requis.';
    if (!donorForm.telephone.trim()) {
      e.telephone = 'Téléphone requis.';
    } else if (!/^\+?[0-9]{8,15}$/.test(donorForm.telephone.trim())) {
      e.telephone = 'Numéro invalide.';
    }
    if (donorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorForm.email.trim())) {
      e.email = 'Email invalide.';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) scrollToFirstFormError();
    return Object.keys(e).length === 0;
  }

  async function handleStudentSubmit() {
    if (!validateStudentForm()) {
      setPayError('');
      return;
    }
    setPayError('');
    setSubmitting(true);
    try {
      const payload = {
        ...studentForm,
        age: Number(studentForm.age),
      };
      let photoToSend = null;
      if (studentPhoto) {
        try {
          photoToSend = await preparePhotoForUpload(studentPhoto);
        } catch (imgErr) {
          setErrors({ photo: imgErr.message });
          scrollToFirstFormError();
          return;
        }
      }
      const res = await createStudentRegistration(payload, photoToSend);
      setContributionId(res.id);
      setPayPhone(studentForm.telephone);
      setPayMethod(studentForm.methode_preferee);
      goNext();
    } catch (err) {
      const apiErrors = parseApiFieldErrors(err?.response?.data);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
        scrollToFirstFormError();
      }
      setPayError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDonorSubmit() {
    if (!validateDonorForm()) {
      setPayError('');
      return;
    }
    setPayError('');
    setSubmitting(true);
    try {
      const res = await createDonorRegistration(donorForm);
      setContributionId(res.id);
      setPayPhone(donorForm.telephone);
      setPayMethod(donorForm.methode_preferee);
      goNext();
    } catch (err) {
      const apiErrors = parseApiFieldErrors(err?.response?.data);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
        scrollToFirstFormError();
      }
      setPayError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOnlinePay() {
    setPayError('');
    const payAmt = userType === 'etudiant' ? STUDENT_FEE : amount;
    const minAmt = userType === 'etudiant' ? STUDENT_FEE : MIN_DONATION;

    if (payAmt === 5000 || payAmt === 10000) {
      setPayError('Les montants de 5 000 et 10 000 FCFA ne sont plus autorisés ici.');
      return;
    }
    if (payAmt < minAmt) {
      setPayError(`Montant minimum : ${minAmt.toLocaleString('fr-FR')} FCFA.`);
      return;
    }
    if (userType === 'etudiant' && payAmt !== STUDENT_FEE) {
      setPayError(`Le paiement étudiant doit être exactement ${STUDENT_FEE.toLocaleString('fr-FR')} FCFA.`);
      return;
    }
    if (!/^\+?[0-9]{8,15}$/.test(payPhone.trim())) {
      setPayError('Numéro de téléphone invalide.');
      return;
    }

    setPaying(true);
    setPayStatus('PENDING');
    try {
      await initiatePayment(contributionId, payAmt, payPhone, payMethod);
      pollStatus('online');
    } catch {
      setPaying(false);
      setPayError('Impossible de contacter Taramoney. Réessayez.');
      setPayStatus(null);
    }
  }

  async function handleCashSubmit() {
    setPayError('');
    if (!paymentProof) {
      setPayError('Veuillez joindre une preuve de paiement (capture ou reçu).');
      return;
    }
    setPaying(true);
    try {
      await confirmCashPayment(contributionId);
      await uploadPaymentProof(contributionId, paymentProof);
      setCompletedAs('cash');
      setPaying(false);
      celebrateAndFinish();
    } catch {
      setPaying(false);
      setPayError('Envoi impossible. Vérifiez la connexion au serveur.');
    }
  }

  function pollStatus(mode) {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await getPaymentStatus(contributionId);
        if (res.status === 'SUCCESSFUL') {
          clearInterval(interval);
          setPayStatus('SUCCESSFUL');
          setPaying(false);
          setCompletedAs(mode);
          celebrateAndFinish();
        } else if (res.status === 'FAILED') {
          clearInterval(interval);
          setPayStatus('FAILED');
          setPaying(false);
        }
      } catch { /* ignore */ }
      if (attempts > 20) {
        clearInterval(interval);
        setPaying(false);
        setPayError('Le paiement prend plus de temps que prévu. Vérifiez votre téléphone.');
      }
    }, 3000);
  }

  function celebrateAndFinish() {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#D4A72C', '#1B4D3E', '#0F2A47', '#F0D77B'],
    });
    goNext();
  }

  return (
    <div className="app-shell">
      <SunProgress step={step} total={TOTAL_STEPS} />

      <div className="step-viewport">
        <div key={`${step}-${userType}`} className={`step-card ${step === 3 || step === 7 ? 'step-card-wide' : ''} ${direction === 'forward' ? 'enter-forward' : 'enter-back'}`}>
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
          {step === 6 && <Step6 />}
          {step === 7 && <Step7 />}
          {step === 8 && <Step8 onStart={() => goToStep(9)} />}
          {step === 9 && <Step9Choice onChoose={chooseUserType} onBack={() => goToStep(8)} />}
          {step === 10 && userType === 'etudiant' && (
            <Step10Student
              form={studentForm}
              setForm={setStudentForm}
              photo={studentPhoto}
              setPhoto={setStudentPhoto}
              errors={errors}
              setErrors={setErrors}
              payError={payError}
              onSubmit={handleStudentSubmit}
              onBack={() => goToStep(9)}
              clearError={(field) => clearFieldError(setErrors, field)}
              submitting={submitting}
            />
          )}
          {step === 10 && userType === 'donateur' && (
            <Step10Donor
              form={donorForm}
              setForm={setDonorForm}
              errors={errors}
              payError={payError}
              onSubmit={handleDonorSubmit}
              onBack={() => goToStep(9)}
              clearError={(field) => clearFieldError(setErrors, field)}
              submitting={submitting}
            />
          )}
          {step === 11 && userType === 'etudiant' && (
            <Step11StudentPayment
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
              payPhone={payPhone}
              setPayPhone={setPayPhone}
              payMethod={payMethod}
              setPayMethod={setPayMethod}
              paymentProof={paymentProof}
              setPaymentProof={setPaymentProof}
              paying={paying}
              payStatus={payStatus}
              payError={payError}
              onOnlinePay={handleOnlinePay}
              onCashSubmit={handleCashSubmit}
              onBack={() => goToStep(10)}
            />
          )}
          {step === 11 && userType === 'donateur' && (
            <Step11DonorPayment
              amount={amount}
              setAmount={setAmount}
              payPhone={payPhone}
              setPayPhone={setPayPhone}
              payMethod={payMethod}
              setPayMethod={setPayMethod}
              paying={paying}
              payStatus={payStatus}
              payError={payError}
              onPay={handleOnlinePay}
              onBack={() => goToStep(10)}
            />
          )}
          {step === 12 && userType === 'etudiant' && (
            <Step12StudentSuccess completedAs={completedAs} />
          )}
          {step === 12 && userType === 'donateur' && (
            <Step12DonorSuccess amount={amount} />
          )}
        </div>
      </div>

      {step < 9 && (
        <div className="footer-nav">
          <button className="btn btn-outline" onClick={goBack} disabled={step === 1}>
            ← Retour
          </button>
          <button className="btn btn-primary" onClick={goNext}>
            Suivant →
          </button>
        </div>
      )}
      
    </div>
  );
}

/* ---------------- Steps 1–8 : narrative ---------------- */

function Step1() {
  return (
    <>
      <div className="hero-frame">
        <img src="/images/page1-hero.png" alt="Campagne de santé BOUANE Ô DOUMAINTANG" />
      </div>
      <span className="eyebrow">ASSERES · Doumaintang</span>
      <h1 className="headline">Merci de tout cœur de vouloir soutenir le projet <span className="accent">BOUANE Ô DOUMAINTANG</span></h1>
      <p className="lede">Mais avant, savez-vous de quoi il s'agit ?</p>
      <CountdownTimer />
      <div className="btn-row" style={{ marginTop: -8, marginBottom: 6 }}>
        <ShareButton />
      </div>
    </>
  );
}

function Step2() {
  return (
    <>
      <div className="hero-frame">
        <img src="/images/page2-programme.png" alt="Programme de la campagne de santé" />
      </div>
      <span className="eyebrow">Le projet</span>
      <p className="body-text">
        Le projet <strong>« BOUANE Ô DOUMAINTANG »</strong> est une campagne de santé gratuite organisée
        par l'Association des Étudiants Ressortissants de l'Est (ASSERES) de la Faculté de Médecine
        et des Sciences Pharmaceutiques de l'Université de Douala, à l'endroit des populations
        locales de la commune de Doumaintang. Soutenus par de nombreuses élites, forces vives et
        piliers de l'association et de la commune, son ambition tend à offrir aux populations de
        Doumaintang de vastes prestations sanitaires par des étudiants et professionnels de santé,
        durant la période du <strong>16 au 23 août 2026</strong>.
      </p>
      <StatStrip />
      <p className="lede" style={{ marginTop: 24 }}>Mais pourquoi dois-je m'engager à la soutenir ?</p>
    </>
  );
}

function Step3() {
  return (
    <>
      <span className="eyebrow">Ils s'engagent avec nous</span>
      <h1 className="headline">Plus de <span className="accent">100 professionnels</span> mobilisés</h1>
      <p className="lede">
        Dans plusieurs écoles de santé du Cameroun, donnant un accès simple, gratuit et professionnel
        à des consultations faites par des spécialistes.
      </p>
      <PartnerLogoGrid partners={PARTNER_SCHOOLS} />
      <LogoMarquee partners={PARTNER_SCHOOLS} />
    </>
  );
}

function Step4() {
  return (
    <div className="bg-watermark-card">
      <img src="/images/page4-depistage.png" alt="Dépistage VIH et hépatite" />
      <span className="eyebrow">Dépistage de masse</span>
      <h1 className="headline">Pour des activités de dépistage VIH/SIDA et Hépatite</h1>
      <p className="lede" style={{ color: 'white' }}>Afin de renforcer la protection de nos populations.</p>
    </div>
  );
}

function Step5() {
  return (
    <div className="bg-watermark-card">
      <img src="/images/page5-medicaments.png" alt="Accès aux médicaments essentiels" />
      <span className="eyebrow">Accès aux soins</span>
      <h1 className="headline">Pour un accès réglementé et gratuit des médicaments essentiels et vitaux</h1>
    </div>
  );
}

function Step6() {
  const photos = ['page6-1.png', 'page6-2.png', 'page6-3.png', 'page6-4.png', 'page6-5.png'];
  return (
    <>
      <span className="eyebrow">Sur le terrain</span>
      <h1 className="headline">Pour un investissement humain au service des populations de Doumaintang</h1>
      <div className="photo-grid">
        {photos.map((p) => (
          <div className="photo-frame" key={p}>
            <img src={`/images/${p}`} alt="Équipe médicale ASSERES sur le terrain" />
          </div>
        ))}
      </div>
    </>
  );
}

function Step7() {
  return (
    <>
      <span className="eyebrow">Ils nous ont rejoints ❗</span>
      <h1 className="headline">Nos partenaires</h1>
      <p className="lede">Institutions et organisations qui accompagnent la campagne BOUANE Ô DOUMAINTANG.</p>
      <PartnerOrganizationsGrid />
    </>
  );
}

function Step8({ onStart }) {
  const photos = ['page8-1.png', 'page8-2.png', 'page8-3.png', 'page8-4.png', 'page8-5.png', 'page8-6.png'];
  return (
    <>
      <span className="eyebrow">Eux aussi ❗</span>
      <h1 className="headline">Ils soutiennent BOUANE Ô DOUMAINTANG</h1>
      <div className="photo-grid">
        {photos.map((photo) => (
          <div className="photo-frame" key={photo}>
            <img src={`/images/${photo}`} alt="Soutien à la campagne BOUANE Ô DOUMAINTANG" />
          </div>
        ))}
      </div>
      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 24 }}>
        <button type="button" className="btn btn-primary" onClick={onStart}>
          Je participe →
        </button>
      </div>
    </>
  );
}

/* ---------------- Step 9 : choix Étudiant / Donateur ---------------- */

function Step9Choice({ onChoose, onBack }) {
  return (
    <>
      <StepBack onBack={onBack} />
      <span className="eyebrow"><Users size={13} /> Rejoignez le mouvement</span>
      <h1 className="headline">Comment souhaitez-vous <span className="accent">participer</span> ?</h1>
      <p className="lede">Choisissez votre profil pour continuer.</p>

      <div className="role-choice-grid">
        <button type="button" className="role-card role-student" onClick={() => onChoose('etudiant')}>
          <div className="role-icon"><GraduationCap size={32} strokeWidth={1.6} /></div>
          <h3>Bénévole</h3>
          <p className="role-price">{STUDENT_FEE.toLocaleString('fr-FR')} FCFA</p>
          <p>Participez à la campagne sur le terrain. Inscription avec vérification académique pour garantir l'authenticité.</p>
          <span className="role-cta">S'inscrire →</span>
        </button>

        <button type="button" className="role-card role-donor" onClick={() => onChoose('donateur')}>
          <div className="role-icon"><HeartHandshake size={32} strokeWidth={1.6} /></div>
          <h3>Donateur</h3>
          <p className="role-price">Montant libre</p>
          <p>Soutenez financièrement la campagne. Quelques informations suffisent — rapide et simple.</p>
          <span className="role-cta">Faire un don →</span>
        </button>
      </div>

      <RegisteredStudentsList compact />
    </>
  );
}

/* ---------------- Step 10 : formulaires ---------------- */

function StepBack({ onBack }) {
  return (
    <button type="button" className="step-back-btn" onClick={onBack}>
      <ArrowLeft size={16} /> Retour
    </button>
  );
}

function YesNoField({ label, name, value, onChange, error, required = false }) {
  return (
    <div className="form-field" id={`field-${name}`} data-invalid={error ? 'true' : undefined}>
      <label>
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>
      <div className="radio-inline">
        <label className="radio-option">
          <input type="radio" name={name} value="oui" checked={value === 'oui'} onChange={onChange} />
          Oui
        </label>
        <label className="radio-option">
          <input type="radio" name={name} value="non" checked={value === 'non'} onChange={onChange} />
          Non
        </label>
      </div>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

function fieldInputProps(fieldKey, errors) {
  return {
    'aria-invalid': errors[fieldKey] ? 'true' : undefined,
    className: errors[fieldKey] ? 'input-invalid' : undefined,
  };
}

function Step10Student({ form, setForm, photo, setPhoto, errors, setErrors, payError, onSubmit, onBack, clearError, submitting }) {
  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    clearError?.(k);
  };
  return (
    <>
      <StepBack onBack={onBack} />
      <span className="eyebrow"><ShieldCheck size={13} /> Inscription étudiant</span>
      <h1 className="headline">Informations personnelles</h1>
      <p className="lede">
        Les champs marqués <span className="required-mark">*</span> sont obligatoires.
        Participation fixée à <strong>{STUDENT_FEE.toLocaleString('fr-FR')} FCFA</strong>.
      </p>

      <FormErrorSummary errors={errors} />

      <div className="form-block">
        <h2 className="form-section-title">Informations personnelles</h2>

        <div className="form-row-2">
          <FormField id="nom" label="1. Nom" required error={errors.nom}>
            <input id="input-nom" {...fieldInputProps('nom', errors)} value={form.nom} onChange={update('nom')} placeholder="Nom de famille" />
          </FormField>
          <FormField id="prenom" label="Prénom(s)" required error={errors.prenom}>
            <input id="input-prenom" {...fieldInputProps('prenom', errors)} value={form.prenom} onChange={update('prenom')} placeholder="Prénom(s)" />
          </FormField>
        </div>

        <div className="form-row-2">
          <FormField id="age" label="2. Âge" required error={errors.age}>
            <input id="input-age" {...fieldInputProps('age', errors)} value={form.age} onChange={update('age')} placeholder="Ex. 22" type="number" min="16" max="65" />
          </FormField>
          <FormField id="sexe" label="3. Sexe" required error={errors.sexe}>
            <select id="input-sexe" {...fieldInputProps('sexe', errors)} value={form.sexe} onChange={update('sexe')}>
              <option value="">— Sélectionner —</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </FormField>
        </div>

        <FormField id="filiere" label="4. Filière" required error={errors.filiere}>
          <select id="input-filiere" {...fieldInputProps('filiere', errors)} value={form.filiere} onChange={update('filiere')}>
            <option value="">— Sélectionner —</option>
            {FILIERE_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </FormField>

        <FormField id="niveau_academique" label="5. Niveau d'étude" required error={errors.niveau_academique}>
          <select id="input-niveau_academique" {...fieldInputProps('niveau_academique', errors)} value={form.niveau_academique} onChange={update('niveau_academique')}>
            <option value="">— Sélectionner —</option>
            {NIVEAU_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormField>

        <FormField id="telephone" label="7. Numéro de téléphone" required error={errors.telephone}>
          <input id="input-telephone" {...fieldInputProps('telephone', errors)} value={form.telephone} onChange={update('telephone')} placeholder="+237 6XX XXX XXX" />
        </FormField>

        <FormField id="email" label="8. Adresse e-mail" optional error={errors.email}>
          <input id="input-email" {...fieldInputProps('email', errors)} value={form.email} onChange={update('email')} placeholder="vous@email.com" type="email" />
        </FormField>

        <FormField id="ecole" label="9. Université / Faculté d'appartenance" required error={errors.ecole}>
          <select id="input-ecole" {...fieldInputProps('ecole', errors)} value={form.ecole} onChange={update('ecole')}>
            <option value="">— Sélectionner —</option>
            {PARTNER_SCHOOL_NAMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FormField>

        <FormField id="ville_residence" label="10. Ville de résidence (ville d'où vous partirez pour la campagne)" required error={errors.ville_residence}>
          <input id="input-ville_residence" {...fieldInputProps('ville_residence', errors)} value={form.ville_residence} onChange={update('ville_residence')} placeholder="Ex. Douala, Yaoundé…" />
        </FormField>

        <YesNoField
          label="11. Avez-vous déjà participé à une campagne de santé auparavant ?"
          name="deja_participe_campagne"
          value={form.deja_participe_campagne}
          onChange={update('deja_participe_campagne')}
          error={errors.deja_participe_campagne}
          required
        />

        <YesNoField
          label="12. Êtes-vous un ressortissant de la région de l'Est ?"
          name="ressortissant_est"
          value={form.ressortissant_est}
          onChange={update('ressortissant_est')}
          error={errors.ressortissant_est}
          required
        />

        <YesNoField
          label="13. Savez-vous vous exprimer en Maka'a ?"
          name="parle_makaa"
          value={form.parle_makaa}
          onChange={update('parle_makaa')}
          error={errors.parle_makaa}
          required
        />

        <FormField id="taille_tshirt" label="14. Quelle est votre taille de T-shirt ?" required error={errors.taille_tshirt}>
          <select id="input-taille_tshirt" {...fieldInputProps('taille_tshirt', errors)} value={form.taille_tshirt} onChange={update('taille_tshirt')}>
            <option value="">— Sélectionner —</option>
            {TAILLE_TSHIRT_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>

        <FormField id="allergies_sante" label="15. Allergies ou soucis de santé particuliers" optional>
          <textarea
            id="input-allergies_sante"
            value={form.allergies_sante}
            onChange={update('allergies_sante')}
            placeholder="Indiquez le cas échéant…"
            rows={3}
          />
        </FormField>

        <FormField id="attentes_campagne" label="16. Quelles sont vos attentes vis-à-vis de cette campagne ?" optional>
          <textarea
            id="input-attentes_campagne"
            value={form.attentes_campagne}
            onChange={update('attentes_campagne')}
            placeholder="Vos attentes…"
            rows={3}
          />
        </FormField>

        <FormField id="photo" label={<><Upload size={14} /> Ajouter une photo (JPG/PNG, max 5 Mo)</>} optional error={errors.photo}>
          <input
            id="input-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png"
            onChange={async (e) => {
              const file = e.target.files?.[0] || null;
              setPhoto(file);
              clearError?.('photo');
              if (!file) return;
              try {
                await preparePhotoForUpload(file);
              } catch (imgErr) {
                setPhoto(null);
                e.target.value = '';
                clearError?.('photo');
                setErrors((prev) => ({ ...prev, photo: imgErr.message }));
                scrollToFirstFormError();
              }
            }}
            className={`file-input${errors.photo ? ' input-invalid' : ''}`}
          />
          {photo && <p className="file-name">{photo.name} ({(photo.size / 1024 / 1024).toFixed(2)} Mo)</p>}
        </FormField>
      </div>

      <div className="form-block">
        <h2 className="form-section-title">Contact d&apos;urgence</h2>

        <FormField id="contact_urgence_nom" label="1. Nom et prénom(s) de la personne à contacter en cas d'urgence" required error={errors.contact_urgence_nom}>
          <input id="input-contact_urgence_nom" {...fieldInputProps('contact_urgence_nom', errors)} value={form.contact_urgence_nom} onChange={update('contact_urgence_nom')} placeholder="Nom complet" />
        </FormField>

        <FormField id="contact_urgence_lien" label="2. Lien de parenté (parent, frère/sœur, tuteur, ami…)" required error={errors.contact_urgence_lien}>
          <input id="input-contact_urgence_lien" {...fieldInputProps('contact_urgence_lien', errors)} value={form.contact_urgence_lien} onChange={update('contact_urgence_lien')} placeholder="Ex. Parent, ami…" />
        </FormField>

        <FormField id="contact_urgence_telephone" label="3. Numéro de téléphone de la personne à contacter" required error={errors.contact_urgence_telephone}>
          <input id="input-contact_urgence_telephone" {...fieldInputProps('contact_urgence_telephone', errors)} value={form.contact_urgence_telephone} onChange={update('contact_urgence_telephone')} placeholder="+237 6XX XXX XXX" />
        </FormField>

        <FormField id="contact_urgence_ville" label="4. Ville / lieu de résidence de la personne à contacter" required error={errors.contact_urgence_ville}>
          <input id="input-contact_urgence_ville" {...fieldInputProps('contact_urgence_ville', errors)} value={form.contact_urgence_ville} onChange={update('contact_urgence_ville')} placeholder="Ville ou lieu" />
        </FormField>
      </div>

      <div className="btn-row">
        {payError && <div className="field-error form-submit-error">{payError}</div>}
        <button className="btn btn-primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Envoi en cours…' : 'Continuer vers le paiement →'}
        </button>
      </div>
    </>
  );
}

function Step10Donor({ form, setForm, errors, payError, onSubmit, onBack, clearError, submitting }) {
  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    clearError?.(k);
  };
  return (
    <>
      <StepBack onBack={onBack} />
      <span className="eyebrow"><HeartHandshake size={13} /> Faire un don</span>
      <h1 className="headline">Merci pour votre générosité</h1>
      <p className="lede">Seulement l'essentiel — vous pourrez choisir le montant à l'étape suivante.</p>

      <FormErrorSummary errors={errors} title="Champs obligatoires manquants :" />

      <div className="form-block form-block-minimal">
        <FormField id="nom" label="Votre nom" required error={errors.nom}>
          <input id="input-donor-nom" {...fieldInputProps('nom', errors)} value={form.nom} onChange={update('nom')} placeholder="Nom ou organisation" />
        </FormField>
        <FormField id="telephone" label="Téléphone (pour le paiement mobile)" required error={errors.telephone}>
          <input id="input-donor-tel" {...fieldInputProps('telephone', errors)} value={form.telephone} onChange={update('telephone')} placeholder="+237 6XX XXX XXX" />
        </FormField>
        <FormField id="email" label="Email" optional error={errors.email}>
          <input id="input-donor-email" {...fieldInputProps('email', errors)} value={form.email} onChange={update('email')} placeholder="vous@email.com" type="email" />
        </FormField>
      </div>

      <div className="btn-row">
        {payError && <div className="field-error form-submit-error">{payError}</div>}
        <button className="btn btn-gold" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Envoi en cours…' : 'Choisir le montant →'}
        </button>
      </div>
    </>
  );
}

/* ---------------- Step 11 : paiements ---------------- */

function Step11StudentPayment({
  paymentMode, setPaymentMode, payPhone, setPayPhone, payMethod, setPayMethod,
  paymentProof, setPaymentProof, paying, payStatus, payError,
  onOnlinePay, onCashSubmit, onBack,
}) {
  return (
    <>
      <StepBack onBack={onBack} />
      <span className="eyebrow">Paiement · {STUDENT_FEE.toLocaleString('fr-FR')} FCFA</span>
      <h1 className="headline">Finalisez votre inscription</h1>

      <div className="fee-badge">
        <span>Participation étudiante</span>
        <strong>{STUDENT_FEE.toLocaleString('fr-FR')} FCFA</strong>
      </div>

      <div className="payment-mode-tabs">
        <button
          type="button"
          className={`mode-tab ${paymentMode === 'en_ligne' ? 'active' : ''}`}
          onClick={() => setPaymentMode('en_ligne')}
        >
          <CreditCard size={18} /> Paiement en ligne
        </button>
        <button
          type="button"
          className={`mode-tab ${paymentMode === 'especes' ? 'active' : ''}`}
          onClick={() => setPaymentMode('especes')}
        >
          <Banknote size={18} /> Paiement en espèces
        </button>
      </div>

      {paymentMode === 'en_ligne' ? (
        <>
          <p className="lede">Payez via Orange Money ou MTN MoMo (Taramoney). Le montant est unique : {STUDENT_FEE.toLocaleString('fr-FR')} FCFA.</p>
          <div className="fee-badge" style={{ marginBottom: 18 }}>
            <span>Montant unique</span>
            <strong>{STUDENT_FEE.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          <div className="form-block">
            <div className="form-field">
              <label>Numéro pour le paiement</label>
              <input value={payPhone} onChange={(e) => setPayPhone(e.target.value)} placeholder="+237 6XX XXX XXX" />
            </div>
          </div>
          <div className="payment-methods" style={{ marginBottom: 22 }}>
            <div className={`method-pill ${payMethod === 'orange' ? 'active' : ''}`} onClick={() => setPayMethod('orange')}>
              🟠 Orange Money
            </div>
            <div className={`method-pill ${payMethod === 'mtn' ? 'active' : ''}`} onClick={() => setPayMethod('mtn')}>
              🟡 MTN MoMo
            </div>
          </div>
          {payError && <div className="field-error" style={{ marginBottom: 14 }}>{payError}</div>}
          <div className="btn-row">
            <button className="btn btn-gold" onClick={onOnlinePay} disabled={paying}>
              {paying ? 'Vérification…' : `Payer ${STUDENT_FEE.toLocaleString('fr-FR')} FCFA`}
            </button>
          </div>
          {payStatus === 'PENDING' && (
            <p className="amount-hint" style={{ marginTop: 14 }}>
              Validez la demande reçue sur votre téléphone.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="lede">
            Effectuez le paiement en espèces auprès d'un responsable ASSERES, puis joignez une photo du reçu.
          </p>
          <div className="cash-info-box">
            <p><strong>Montant :</strong> {STUDENT_FEE.toLocaleString('fr-FR')} FCFA</p>
            <p>Votre inscription sera validée après vérification de la preuve par l'équipe ASSERES.</p>
          </div>
          <div className="form-block">
            <div className="form-field">
              <label><Upload size={14} /> Preuve de paiement (photo ou PDF)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="file-input"
              />
              {paymentProof && <p className="file-name">{paymentProof.name}</p>}
            </div>
          </div>
          {payError && <div className="field-error" style={{ marginBottom: 14 }}>{payError}</div>}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={onCashSubmit} disabled={paying}>
              {paying ? 'Envoi…' : 'Soumettre la preuve'}
            </button>
          </div>
        </>
      )}
    </>
  );
}

function Step11DonorPayment({
  amount, setAmount, payPhone, setPayPhone, payMethod, setPayMethod,
  paying, payStatus, payError, onPay, onBack,
}) {
  const presets = [25000, 50000, 100000];
  return (
    <>
      <StepBack onBack={onBack} />
      <span className="eyebrow">Paiement sécurisé · Taramoney</span>
      <h1 className="headline">Votre don</h1>
      <p className="lede">Montant minimum : {MIN_DONATION.toLocaleString('fr-FR')} FCFA</p>

      <GoalThermometer />

      <div className="amount-box">
        <input
          type="number"
          value={amount}
          min={MIN_DONATION}
          step={1000}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <div className="amount-hint">Montant en FCFA</div>
      </div>
      <div className="amount-presets">
        {presets.map((p) => (
          <button key={p} className={amount === p ? 'active' : ''} onClick={() => setAmount(p)}>
            {p.toLocaleString('fr-FR')}
          </button>
        ))}
      </div>

      <div className="form-block form-block-minimal">
        <div className="form-field">
          <label>Numéro pour le paiement mobile</label>
          <input value={payPhone} onChange={(e) => setPayPhone(e.target.value)} placeholder="+237 6XX XXX XXX" />
        </div>
      </div>

      <div className="payment-methods" style={{ marginBottom: 22 }}>
        <div className={`method-pill ${payMethod === 'orange' ? 'active' : ''}`} onClick={() => setPayMethod('orange')}>
          🟠 Orange Money
        </div>
        <div className={`method-pill ${payMethod === 'mtn' ? 'active' : ''}`} onClick={() => setPayMethod('mtn')}>
          🟡 MTN MoMo
        </div>
      </div>

      {payError && <div className="field-error" style={{ marginBottom: 14 }}>{payError}</div>}

      <div className="btn-row">
        <button className="btn btn-gold" onClick={onPay} disabled={paying}>
          {paying ? 'Vérification…' : `Donner ${amount.toLocaleString('fr-FR')} FCFA`}
        </button>
      </div>
      {payStatus === 'PENDING' && (
        <p className="amount-hint" style={{ marginTop: 14 }}>
          Validez la demande reçue sur votre téléphone.
        </p>
      )}
    </>
  );
}

/* ---------------- Step 12 : confirmation ---------------- */

function Step12StudentSuccess({ completedAs }) {
  return (
    <>
      <div className="thanks-icon"><Stethoscope size={54} strokeWidth={1.6} color="var(--green-mid)" /></div>
      <h1 className="headline">
        {completedAs === 'cash' ? 'Preuve reçue !' : 'Inscription confirmée !'}
      </h1>
      <p className="lede">
        {completedAs === 'cash'
          ? 'Votre paiement en espèces sera validé sous 48 h par l\'équipe ASSERES. Vous recevrez une confirmation par email.'
          : 'Vous êtes officiellement inscrit à BOUAN\'O DOUMAINTANG. Merci de votre engagement !'}
      </p>
      <RegisteredStudentsList />
    </>
  );
}

function Step12DonorSuccess({ amount }) {
  return (
    <>
      <div className="thanks-icon"><HeartHandshake size={54} strokeWidth={1.6} color="var(--red)" /></div>
      <h1 className="headline">Merci pour votre don ❗</h1>
      <p className="lede">
        Votre contribution de <strong>{amount.toLocaleString('fr-FR')} FCFA</strong> fait la différence
        pour les populations de Doumaintang.
      </p>
    </>
  );
}
