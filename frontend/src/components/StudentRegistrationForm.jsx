import React, { useState } from 'react';
import { createStudentRegistration } from '../api/client.js';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function StudentRegistrationForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    niveau_academique: '',
    ecole: '',
    filiere: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Valider le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image (JPG, PNG, etc.)');
        return;
      }
      
      // Valider la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image doit faire moins de 5MB');
        return;
      }

      setPhotoFile(file);
      // Prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await createStudentRegistration(formData, photoFile);
      setSuccess(`Inscription réussie! ID: ${result.id}`);
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        niveau_academique: '',
        ecole: '',
        filiere: '',
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setError(`Erreur lors de l'inscription: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form-container">
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Formulaire d'Inscription Étudiant</h2>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <p>{success}</p>
          </div>
        )}

        {/* Champs texte */}
        <div className="form-group">
          <label htmlFor="nom">Nom *</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone *</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="niveau_academique">Niveau Académique</label>
          <select
            id="niveau_academique"
            name="niveau_academique"
            value={formData.niveau_academique}
            onChange={handleInputChange}
          >
            <option value="">Sélectionner...</option>
            <option value="licence1">Licence 1</option>
            <option value="licence2">Licence 2</option>
            <option value="licence3">Licence 3</option>
            <option value="master1">Master 1</option>
            <option value="master2">Master 2</option>
            <option value="doctorat">Doctorat</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ecole">École/Université</label>
          <input
            type="text"
            id="ecole"
            name="ecole"
            value={formData.ecole}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="filiere">Filière</label>
          <input
            type="text"
            id="filiere"
            name="filiere"
            value={formData.filiere}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Upload d'image */}
        <div className="form-group photo-upload">
          <label htmlFor="photo">Photo de Profil (JPG, PNG - Max 5MB)</label>
          <div className="upload-box">
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={loading}
            />
            <Upload size={32} />
            <p>Cliquez pour sélectionner une photo</p>
          </div>

          {photoPreview && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Aperçu" />
              <p>{photoFile?.name}</p>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Envoi en cours...' : 'Envoyer Inscription'}
        </button>
      </form>
    </div>
  );
}
