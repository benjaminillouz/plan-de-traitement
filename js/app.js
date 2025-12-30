/**
 * Main Application Module
 * Gestion principale de l'application Plan de Traitement
 */

import {
    uploadFilesToFirebase,
    saveTreatmentPlan,
    callPodioWebhook
} from './firebase-config.js';

// ========================================
// Gestion des paramètres URL (Veasy)
// ========================================

/**
 * Récupère un paramètre de l'URL
 * @param {string} name - Le nom du paramètre
 * @returns {string} La valeur du paramètre ou chaîne vide
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || '';
}

/**
 * Récupère tous les paramètres Veasy
 * @returns {Object} Les paramètres Veasy
 */
function getVeasyParams() {
    return {
        // Anciens paramètres (compatibilité)
        idPatient: getUrlParameter('idPatient') || getUrlParameter('Patient_id'),
        idPraticien: getUrlParameter('idPraticien') || getUrlParameter('ID_praticien'),
        idCentre: getUrlParameter('idCentre') || getUrlParameter('ID_centre'),

        // Nouveaux paramètres Veasy
        patientId: getUrlParameter('Patient_id'),
        patientNom: getUrlParameter('Patient_nom'),
        patientPrenom: getUrlParameter('Patient_prenom'),
        praticienId: getUrlParameter('ID_praticien'),
        praticienNom: getUrlParameter('Praticien_nom'),
        centreId: getUrlParameter('ID_centre'),
        centreNom: getUrlParameter('Centre_nom')
    };
}

/**
 * Pré-remplit les champs du formulaire avec les données Veasy
 */
function prefillFormFields() {
    const params = getVeasyParams();

    // Pré-remplir le nom du patient
    const patientNomInput = document.getElementById('patient-nom');
    if (patientNomInput && params.patientNom) {
        patientNomInput.value = params.patientNom;
    }

    // Pré-remplir le prénom du patient
    const patientPrenomInput = document.getElementById('patient-prenom');
    if (patientPrenomInput && params.patientPrenom) {
        patientPrenomInput.value = params.patientPrenom;
    }

    // Pré-remplir le nom du praticien
    const praticienNomInput = document.getElementById('praticien-nom');
    if (praticienNomInput && params.praticienNom) {
        praticienNomInput.value = params.praticienNom;
    }

    // Afficher le badge praticien si on a un praticien depuis Veasy
    if (params.praticienNom) {
        const practitionerBadge = document.getElementById('practitioner-badge');
        const practitionerName = document.getElementById('practitioner-name');
        if (practitionerBadge && practitionerName) {
            practitionerBadge.classList.remove('hidden');
            practitionerBadge.classList.add('flex');
            practitionerName.textContent = params.praticienNom;
        }
    }

    // Afficher le contexte du header si on a un centre
    if (params.centreNom) {
        const headerContext = document.getElementById('header-context');
        const headerCenter = document.getElementById('header-center');
        if (headerContext && headerCenter) {
            headerContext.classList.remove('hidden');
            headerCenter.textContent = params.centreNom;
        }
    }
}

// ========================================
// Collecte des données du formulaire
// ========================================

/**
 * Récupère la valeur d'une checkbox
 * @param {string} id - L'ID de la checkbox
 * @returns {boolean}
 */
function getCheckboxValue(id) {
    const checkbox = document.getElementById(id);
    return checkbox ? checkbox.checked : false;
}

/**
 * Récupère la valeur d'un groupe radio
 * @param {string} name - Le nom du groupe radio
 * @returns {string|null}
 */
function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
}

/**
 * Récupère la valeur des notes
 * @returns {string}
 */
function getNotesValue() {
    const notes = document.getElementById('notes');
    return notes ? notes.value.trim() : '';
}

/**
 * Récupère la valeur d'un champ input
 * @param {string} id - L'ID du champ
 * @returns {string}
 */
function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

/**
 * Collecte toutes les données du formulaire
 * @returns {Object}
 */
function collectFormData() {
    const params = getVeasyParams();
    const dentalSelections = window.getAllDentalSelections ? window.getAllDentalSelections() : {};

    // Récupérer les valeurs des champs du header
    const patientNom = getInputValue('patient-nom') || params.patientNom;
    const patientPrenom = getInputValue('patient-prenom') || params.patientPrenom;
    const praticienNom = getInputValue('praticien-nom') || params.praticienNom;
    const dateTraitement = getInputValue('date-traitement');

    return {
        // Identifiants
        idPatient: params.idPatient || params.patientId,
        idPraticien: params.idPraticien || params.praticienId,
        idCentre: params.idCentre || params.centreId,

        // Informations patient
        patient: {
            id: params.patientId || params.idPatient,
            nom: patientNom,
            prenom: patientPrenom
        },

        // Informations praticien
        praticien: {
            id: params.praticienId || params.idPraticien,
            nom: praticienNom
        },

        // Informations centre
        centre: {
            id: params.centreId || params.idCentre,
            nom: params.centreNom
        },

        // Date du traitement
        dateTraitement: dateTraitement,

        // 1. Assainissement
        detartrage: getCheckboxValue('detartrage'),
        avulsions: dentalSelections.avulsions || [],

        // 2. Soins conservateurs
        restaurations: dentalSelections.restaurations || [],
        endo: dentalSelections.endo || [],

        // 3. Soins complémentaires
        implants: dentalSelections.implants || [],
        parodonto: dentalSelections.parodonto || [],

        // 4. Prothèses transitoires
        transitoires: getRadioValue('transitoires'),
        protheses_transitoires: dentalSelections.protheses_transitoires || [],

        // 5. Prothèses définitives
        protheses_definitives: {
            inlay_core: getCheckboxValue('inlay-core'),
            inlay_core_dents: dentalSelections.protheses_definitives?.inlay_core || [],
            couronne: getCheckboxValue('couronne'),
            couronne_dents: dentalSelections.protheses_definitives?.couronnes || [],
            onlay: getCheckboxValue('onlay'),
            onlay_dents: dentalSelections.protheses_definitives?.onlay || [],
            prothese_amovible: getCheckboxValue('prothese-amovible'),
            prothese_amovible_dents: dentalSelections.protheses_definitives?.amovibles || []
        },

        // Notes complémentaires
        notes: getNotesValue(),

        // Métadonnées
        date: new Date().toISOString()
    };
}

// ========================================
// Gestion des photos
// ========================================

let photos = [];

/**
 * Initialise la gestion des photos
 */
function initPhotoUpload() {
    const photoInput = document.getElementById('photoUpload');
    const photosGrid = document.getElementById('photos-grid');
    const photosEmpty = document.getElementById('photos-empty');

    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const photo = {
                            id: Date.now() + Math.random(),
                            data: event.target.result,
                            name: `Photo ${photos.length + 1}`,
                            date: new Date().toLocaleDateString('fr-FR'),
                            file: file
                        };
                        photos.push(photo);
                        renderPhotos();
                    };
                    reader.readAsDataURL(file);
                }
            });
            // Reset input
            photoInput.value = '';
        });
    }

    function renderPhotos() {
        if (!photosGrid) return;

        if (photos.length === 0) {
            photosGrid.innerHTML = '';
            if (photosEmpty) photosEmpty.classList.remove('hidden');
        } else {
            if (photosEmpty) photosEmpty.classList.add('hidden');
            photosGrid.innerHTML = photos.map((photo, index) => `
                <div class="relative group">
                    <div class="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src="${photo.data}" alt="${photo.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="mt-2">
                        <input type="text" value="${photo.name}" onchange="updatePhotoName(${index}, this.value)"
                            class="w-full text-sm font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1">
                        <p class="text-xs text-slate-500 px-1">${photo.date}</p>
                    </div>
                    <button onclick="deletePhoto(${index})"
                        class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            `).join('');
        }
    }

    // Expose functions globally
    window.updatePhotoName = (index, name) => {
        if (photos[index]) {
            photos[index].name = name;
        }
    };

    window.deletePhoto = (index) => {
        if (confirm('Supprimer cette photo ?')) {
            photos.splice(index, 1);
            renderPhotos();
        }
    };

    window.getPhotos = () => photos;
}

// ========================================
// Gestion des radiographies
// ========================================

let radiographs = [];

/**
 * Initialise la gestion des radiographies (capture d'écran)
 */
function initRadiographCapture() {
    const captureBtn = document.getElementById('captureScreen');
    const radiographsGrid = document.getElementById('radiographs-grid');
    const radiographsEmpty = document.getElementById('radiographs-empty');

    if (captureBtn) {
        captureBtn.addEventListener('click', async () => {
            try {
                // Utiliser l'API Screen Capture
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' },
                    audio: false
                });

                // Créer une vidéo temporaire pour capturer un frame
                const video = document.createElement('video');
                video.srcObject = stream;
                await video.play();

                // Créer un canvas pour capturer l'image
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);

                // Arrêter le stream
                stream.getTracks().forEach(track => track.stop());

                // Convertir en base64
                const imageData = canvas.toDataURL('image/png');

                // Ajouter à la liste
                const radiograph = {
                    id: Date.now(),
                    data: imageData,
                    name: `Radiographie ${radiographs.length + 1}`,
                    date: new Date().toLocaleDateString('fr-FR')
                };
                radiographs.push(radiograph);
                renderRadiographs();

            } catch (error) {
                console.error('Erreur capture:', error);
                showToast('Capture annulée ou non supportée', 'warning');
            }
        });
    }

    function renderRadiographs() {
        if (!radiographsGrid) return;

        if (radiographs.length === 0) {
            radiographsGrid.innerHTML = '';
            if (radiographsEmpty) radiographsEmpty.classList.remove('hidden');
        } else {
            if (radiographsEmpty) radiographsEmpty.classList.add('hidden');
            radiographsGrid.innerHTML = radiographs.map((radio, index) => `
                <div class="relative group">
                    <div class="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src="${radio.data}" alt="${radio.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="mt-2">
                        <input type="text" value="${radio.name}" onchange="updateRadioName(${index}, this.value)"
                            class="w-full text-sm font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none px-1">
                        <p class="text-xs text-slate-500 px-1">${radio.date}</p>
                    </div>
                    <button onclick="deleteRadiograph(${index})"
                        class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            `).join('');
        }
    }

    // Expose functions globally
    window.updateRadioName = (index, name) => {
        if (radiographs[index]) {
            radiographs[index].name = name;
        }
    };

    window.deleteRadiograph = (index) => {
        if (confirm('Supprimer cette radiographie ?')) {
            radiographs.splice(index, 1);
            renderRadiographs();
        }
    };

    window.getRadiographs = () => radiographs;
}

// ========================================
// Sauvegarde du plan de traitement
// ========================================

/**
 * Affiche le modal de chargement
 * @param {boolean} show - Afficher ou masquer
 */
function showLoadingModal(show) {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.toggle('hidden', !show);
    }
}

/**
 * Sauvegarde le plan de traitement
 */
async function saveTreatmentPlanHandler() {
    try {
        showLoadingModal(true);

        // Collecter les données du formulaire
        const formData = collectFormData();

        // Générer l'ID du document
        const documentId = `${formData.idPatient || 'unknown'}_${formData.idCentre || 'unknown'}`;

        // Upload des fichiers si présents
        const files = window.getSelectedFiles ? window.getSelectedFiles() : [];
        if (files.length > 0) {
            try {
                const uploadedFiles = await uploadFilesToFirebase(files, formData.idPatient);
                formData.uploadedFiles = uploadedFiles;
            } catch (error) {
                console.error('Erreur upload fichiers:', error);
                showToast('Erreur lors de l\'upload des fichiers', 'error');
            }
        }

        // Ajouter les photos
        const photosList = window.getPhotos ? window.getPhotos() : [];
        if (photosList.length > 0) {
            formData.photos = photosList.map(p => ({
                name: p.name,
                date: p.date,
                data: p.data
            }));
        }

        // Ajouter les radiographies
        const radiosList = window.getRadiographs ? window.getRadiographs() : [];
        if (radiosList.length > 0) {
            formData.radiographies = radiosList.map(r => ({
                name: r.name,
                date: r.date,
                data: r.data
            }));
        }

        // Sauvegarder dans Firestore
        await saveTreatmentPlan(documentId, formData);

        // Appeler le webhook Podio
        const webhookParams = {
            idPraticien: formData.idPraticien || '',
            idCentre: formData.idCentre || '',
            linkVeasy: `https://patient.visiodent.com/patient/Navigation/SetCurrentPatient/${formData.idPatient || ''}`,
            plandetraitement: `https://pdt.cemedis.app/view.html?id=${documentId}`
        };
        await callPodioWebhook(webhookParams);

        showLoadingModal(false);
        showToast('Plan de traitement enregistré avec succès !', 'success');

        // Redirection vers la page de succès
        setTimeout(() => {
            window.location.href = `success.html?id=${documentId}`;
        }, 1500);

    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showLoadingModal(false);
        showToast('Erreur lors de l\'enregistrement', 'error');
    }
}

// ========================================
// Initialisation
// ========================================

/**
 * Initialise l'application
 */
function initApp() {
    console.log('🦷 Plan de Traitement - Initialisation...');

    // Pré-remplir les champs du formulaire
    prefillFormFields();

    // Initialiser la gestion des photos
    initPhotoUpload();

    // Initialiser la gestion des radiographies
    initRadiographCapture();

    // Attacher l'événement de sauvegarde
    const saveButton = document.getElementById('savePlanButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveTreatmentPlanHandler);
    }

    // Log des paramètres pour debug
    const params = getVeasyParams();
    console.log('📋 Paramètres Veasy:', params);

    console.log('✅ Application initialisée');
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initApp);

// Exposer certaines fonctions globalement pour le debug
window.collectFormData = collectFormData;
window.getVeasyParams = getVeasyParams;
