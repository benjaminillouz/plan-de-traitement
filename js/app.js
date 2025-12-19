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
 * Affiche les informations patient dans le header
 */
function displayPatientInfo() {
    const params = getVeasyParams();
    const patientInfo = document.getElementById('patient-info');
    const patientName = document.getElementById('display-patient-name');
    const practitionerName = document.getElementById('display-practitioner-name');
    const centerName = document.getElementById('display-center-name');

    // Vérifier si on a des infos à afficher
    const hasPatientInfo = params.patientNom || params.patientPrenom || params.idPatient;

    if (hasPatientInfo && patientInfo) {
        patientInfo.classList.remove('hidden');

        // Nom du patient
        if (patientName) {
            if (params.patientNom || params.patientPrenom) {
                patientName.textContent = `${params.patientPrenom || ''} ${params.patientNom || ''}`.trim();
            } else if (params.idPatient) {
                patientName.textContent = `Patient #${params.idPatient}`;
            }
        }

        // Nom du praticien
        if (practitionerName && params.praticienNom) {
            practitionerName.textContent = params.praticienNom;
        } else if (practitionerName) {
            practitionerName.style.display = 'none';
        }

        // Nom du centre
        if (centerName && params.centreNom) {
            centerName.textContent = params.centreNom;
        } else if (centerName) {
            centerName.style.display = 'none';
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
 * Collecte toutes les données du formulaire
 * @returns {Object}
 */
function collectFormData() {
    const params = getVeasyParams();
    const dentalSelections = window.getAllDentalSelections ? window.getAllDentalSelections() : {};

    return {
        // Identifiants
        idPatient: params.idPatient || params.patientId,
        idPraticien: params.idPraticien || params.praticienId,
        idCentre: params.idCentre || params.centreId,

        // Informations patient
        patient: {
            id: params.patientId || params.idPatient,
            nom: params.patientNom,
            prenom: params.patientPrenom
        },

        // Informations praticien
        praticien: {
            id: params.praticienId || params.idPraticien,
            nom: params.praticienNom
        },

        // Informations centre
        centre: {
            id: params.centreId || params.idCentre,
            nom: params.centreNom
        },

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

        // Récupérer la capture d'écran
        const screenshot = window.getScreenshotData ? window.getScreenshotData() : null;
        if (screenshot) {
            // Vérifier la taille
            if (screenshot.length > 1048487) {
                showToast('La capture d\'écran est trop volumineuse', 'warning');
            } else {
                formData.screenshot = screenshot;
            }
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

    // Afficher les informations patient
    displayPatientInfo();

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
