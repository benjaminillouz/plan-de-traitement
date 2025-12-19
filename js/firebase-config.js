/**
 * Firebase Configuration Module
 * Configuration et initialisation de Firebase
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB4oIBIm0pWfs56hU3_R8qye2I_xbT-n9I",
    authDomain: "plan-de-traitement.firebaseapp.com",
    projectId: "plan-de-traitement",
    storageBucket: "plan-de-traitement.firebasestorage.app",
    messagingSenderId: "444243668402",
    appId: "1:444243668402:web:8e19c59ea965c4e84a08ab"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Authentification anonyme
signInAnonymously(auth)
    .then(() => {
        console.log('✅ Authentification Firebase réussie');
    })
    .catch((error) => {
        console.error('❌ Erreur d\'authentification Firebase:', error);
    });

// Écoute des changements d'état d'authentification
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('✅ Utilisateur connecté:', user.uid);
    } else {
        console.log('⚠️ Aucun utilisateur connecté');
    }
});

/**
 * Upload des fichiers vers Firebase Storage
 * @param {Array<File>} files - Les fichiers à uploader
 * @param {string} patientId - L'ID du patient (pour le chemin de stockage)
 * @returns {Promise<Array>} Les URLs des fichiers uploadés
 */
async function uploadFilesToFirebase(files, patientId = 'default') {
    const uploadedFiles = [];
    const timestamp = Date.now();

    for (const file of files) {
        try {
            // Créer un nom de fichier unique
            const safeFileName = encodeURIComponent(file.name);
            const storagePath = `uploads/${patientId}/${timestamp}_${safeFileName}`;
            const storageRef = ref(storage, storagePath);

            // Définir les métadonnées
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    originalName: file.name,
                    uploadDate: new Date().toISOString()
                }
            };

            // Upload du fichier
            const snapshot = await uploadBytes(storageRef, file, metadata);

            // Récupérer l'URL de téléchargement
            const downloadURL = await getDownloadURL(snapshot.ref);

            uploadedFiles.push({
                name: file.name,
                url: downloadURL,
                type: file.type,
                size: file.size,
                path: storagePath
            });

            console.log('✅ Fichier uploadé:', file.name);
        } catch (error) {
            console.error('❌ Erreur d\'upload pour', file.name, error);
            throw error;
        }
    }

    return uploadedFiles;
}

/**
 * Sauvegarde un plan de traitement dans Firestore
 * @param {string} documentId - L'ID du document
 * @param {Object} data - Les données du plan de traitement
 * @returns {Promise<void>}
 */
async function saveTreatmentPlan(documentId, data) {
    try {
        await setDoc(doc(db, "plansTraitement", documentId), {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        console.log('✅ Plan de traitement sauvegardé:', documentId);
    } catch (error) {
        console.error('❌ Erreur de sauvegarde Firestore:', error);
        throw error;
    }
}

/**
 * Récupère un plan de traitement depuis Firestore
 * @param {string} documentId - L'ID du document
 * @returns {Promise<Object|null>} Les données du plan ou null
 */
async function getTreatmentPlan(documentId) {
    try {
        const docRef = doc(db, "plansTraitement", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log('✅ Plan de traitement récupéré:', documentId);
            return docSnap.data();
        } else {
            console.log('⚠️ Aucun plan trouvé pour:', documentId);
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur de récupération Firestore:', error);
        throw error;
    }
}

/**
 * Appelle le webhook Podio
 * @param {Object} params - Les paramètres du webhook
 * @returns {Promise<boolean>} Succès ou échec
 */
async function callPodioWebhook(params) {
    try {
        const queryParams = new URLSearchParams(params);
        const webhookUrl = `https://workflow-automation.podio.com/catch/jv551cn4bd2d5n1?${queryParams.toString()}`;

        console.log('📤 Appel du webhook Podio...');

        const response = await fetch(webhookUrl, {
            method: "GET",
            mode: 'no-cors' // Le webhook Podio peut avoir des restrictions CORS
        });

        console.log('✅ Webhook appelé avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'appel du webhook:', error);
        return false;
    }
}

// Exposer les fonctions
export {
    app,
    db,
    auth,
    storage,
    uploadFilesToFirebase,
    saveTreatmentPlan,
    getTreatmentPlan,
    callPodioWebhook
};
