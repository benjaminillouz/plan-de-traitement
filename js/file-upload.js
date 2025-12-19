/**
 * File Upload Module
 * Gestion de l'upload des pièces jointes
 */

// Store pour les fichiers sélectionnés
let selectedFiles = [];

/**
 * Initialise le gestionnaire d'upload de fichiers
 */
function initFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');

    if (!fileInput || !fileList) return;

    fileInput.addEventListener('change', handleFileSelection);
}

/**
 * Gère la sélection de fichiers
 * @param {Event} event - L'événement change
 */
function handleFileSelection(event) {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        // Vérifier si le fichier n'est pas déjà dans la liste
        const exists = selectedFiles.some(f =>
            f.name === file.name && f.size === file.size
        );

        if (!exists) {
            selectedFiles.push(file);
        }
    });

    updateFileList();

    // Réinitialiser l'input pour permettre la resélection du même fichier
    event.target.value = '';
}

/**
 * Met à jour l'affichage de la liste des fichiers
 */
function updateFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    fileList.innerHTML = '';

    if (selectedFiles.length === 0) {
        return;
    }

    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        fileList.appendChild(fileItem);
    });
}

/**
 * Crée un élément d'affichage pour un fichier
 * @param {File} file - Le fichier
 * @param {number} index - L'index du fichier
 * @returns {HTMLElement} L'élément créé
 */
function createFileItem(file, index) {
    const item = document.createElement('div');
    item.classList.add('file-item');
    item.setAttribute('data-index', index);

    const nameContainer = document.createElement('div');
    nameContainer.classList.add('file-item-name');

    const icon = document.createElement('span');
    icon.textContent = getFileIcon(file.type);

    const name = document.createElement('span');
    name.textContent = truncateFileName(file.name, 30);
    name.title = file.name;

    const size = document.createElement('span');
    size.classList.add('file-size');
    size.textContent = formatFileSize(file.size);
    size.style.color = '#8898aa';
    size.style.marginLeft = '8px';
    size.style.fontSize = '0.85em';

    nameContainer.appendChild(icon);
    nameContainer.appendChild(name);
    nameContainer.appendChild(size);

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('file-item-remove');
    removeBtn.innerHTML = '✕';
    removeBtn.title = 'Supprimer';
    removeBtn.setAttribute('aria-label', `Supprimer ${file.name}`);
    removeBtn.addEventListener('click', () => removeFile(index));

    item.appendChild(nameContainer);
    item.appendChild(removeBtn);

    return item;
}

/**
 * Supprime un fichier de la liste
 * @param {number} index - L'index du fichier à supprimer
 */
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
}

/**
 * Retourne l'icône appropriée pour un type de fichier
 * @param {string} mimeType - Le type MIME du fichier
 * @returns {string} L'emoji correspondant
 */
function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
}

/**
 * Tronque un nom de fichier
 * @param {string} name - Le nom du fichier
 * @param {number} maxLength - La longueur maximale
 * @returns {string} Le nom tronqué
 */
function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;

    const extension = name.split('.').pop();
    const baseName = name.slice(0, name.lastIndexOf('.'));
    const truncatedBase = baseName.slice(0, maxLength - extension.length - 4);

    return `${truncatedBase}...${extension}`;
}

/**
 * Formate la taille d'un fichier
 * @param {number} bytes - La taille en octets
 * @returns {string} La taille formatée
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Récupère les fichiers sélectionnés
 * @returns {Array<File>} Les fichiers sélectionnés
 */
function getSelectedFiles() {
    return selectedFiles;
}

/**
 * Réinitialise la liste des fichiers
 */
function clearSelectedFiles() {
    selectedFiles = [];
    updateFileList();

    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
        fileInput.value = '';
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initFileUpload);

// Exposer les fonctions globalement
window.getSelectedFiles = getSelectedFiles;
window.clearSelectedFiles = clearSelectedFiles;
