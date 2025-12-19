/**
 * Screenshot Module
 * Gestion de la capture d'écran
 */

// Variable pour stocker les données de la capture
let screenshotData = null;

/**
 * Initialise le gestionnaire de capture d'écran
 */
function initScreenshot() {
    const captureBtn = document.getElementById('captureScreen');
    const removeBtn = document.getElementById('removeScreenshot');

    if (captureBtn) {
        captureBtn.addEventListener('click', captureScreen);
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', removeScreenshot);
    }
}

/**
 * Capture l'écran de l'utilisateur
 */
async function captureScreen() {
    try {
        // Demander le partage d'écran
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always',
                displaySurface: 'monitor'
            }
        });

        // Créer un élément vidéo pour capturer l'image
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        // Attendre que la vidéo soit chargée
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        // Petit délai pour s'assurer que la vidéo est prête
        await new Promise(resolve => setTimeout(resolve, 100));

        // Créer un canvas pour la capture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dessiner l'image de la vidéo sur le canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir en base64
        const imageData = canvas.toDataURL('image/png');

        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());

        // Compresser l'image
        const compressedData = await compressScreenshot(imageData, 1200, 0.7);

        // Stocker et afficher
        screenshotData = compressedData;
        displayScreenshot(compressedData);

        // Afficher une notification de succès
        showToast('Capture d\'écran réussie', 'success');

    } catch (error) {
        console.error('Erreur lors de la capture d\'écran:', error);

        if (error.name === 'NotAllowedError') {
            showToast('Capture annulée ou non autorisée', 'warning');
        } else {
            showToast('Erreur lors de la capture d\'écran', 'error');
        }
    }
}

/**
 * Compresse une image en base64
 * @param {string} imageDataUrl - L'image en base64
 * @param {number} maxWidth - La largeur maximale
 * @param {number} quality - La qualité (0-1)
 * @returns {Promise<string>} L'image compressée en base64
 */
function compressScreenshot(imageDataUrl, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculer les nouvelles dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Dessiner l'image redimensionnée
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en JPEG pour une meilleure compression
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = reject;
        img.src = imageDataUrl;
    });
}

/**
 * Affiche la capture d'écran dans le preview
 * @param {string} imageData - L'image en base64
 */
function displayScreenshot(imageData) {
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('screenshotPreview');
    const hiddenInput = document.getElementById('screenshotData');

    if (previewContainer) {
        previewContainer.classList.remove('hidden');
    }

    if (previewImage) {
        previewImage.src = imageData;
    }

    if (hiddenInput) {
        hiddenInput.value = imageData;
    }
}

/**
 * Supprime la capture d'écran
 */
function removeScreenshot() {
    screenshotData = null;

    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('screenshotPreview');
    const hiddenInput = document.getElementById('screenshotData');

    if (previewContainer) {
        previewContainer.classList.add('hidden');
    }

    if (previewImage) {
        previewImage.src = '';
    }

    if (hiddenInput) {
        hiddenInput.value = '';
    }

    showToast('Capture d\'écran supprimée', 'info');
}

/**
 * Récupère les données de la capture d'écran
 * @returns {string|null} L'image en base64 ou null
 */
function getScreenshotData() {
    return screenshotData;
}

/**
 * Vérifie si une capture d'écran existe
 * @returns {boolean}
 */
function hasScreenshot() {
    return screenshotData !== null && screenshotData.length > 0;
}

/**
 * Affiche un toast de notification
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    const icon = getToastIcon(type);
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    // Supprimer après 3 secondes
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Retourne l'icône appropriée pour un type de toast
 * @param {string} type - Le type de toast
 * @returns {string} L'icône
 */
function getToastIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return 'ℹ️';
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initScreenshot);

// Exposer les fonctions globalement
window.captureScreen = captureScreen;
window.getScreenshotData = getScreenshotData;
window.hasScreenshot = hasScreenshot;
window.removeScreenshot = removeScreenshot;
window.showToast = showToast;
window.compressScreenshot = compressScreenshot;
