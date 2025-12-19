/**
 * Dental Chart Module
 * Gestion du schéma dentaire interactif
 */

// Configuration des dents
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Mapping des types de traitement vers les classes CSS
const TREATMENT_CLASSES = {
    'avulsion': 'selected-avulsion',
    'restauration': 'selected-restauration',
    'endo': 'selected-endo',
    'implant': 'selected-implant',
    'parodonto': 'selected-parodonto',
    'transitoire': 'selected-transitoire',
    'definitive': 'selected-definitive'
};

/**
 * Bascule l'affichage d'un schéma dentaire pour une checkbox
 * @param {HTMLInputElement} checkbox - La checkbox qui déclenche l'action
 * @param {string} chartId - L'ID du conteneur du schéma dentaire
 */
function toggleDentalChart(checkbox, chartId) {
    const chart = document.getElementById(chartId);
    if (!chart) return;

    if (checkbox.checked) {
        chart.classList.remove('hidden');
        if (!chart.hasChildNodes()) {
            createDentalChart(chart);
        }
    } else {
        chart.classList.add('hidden');
        // Réinitialiser les sélections
        resetChartSelections(chart);
    }
}

/**
 * Bascule l'affichage d'un schéma dentaire pour un radio button
 * @param {string} chartId - L'ID du conteneur du schéma dentaire
 * @param {boolean} show - Afficher ou masquer le schéma
 */
function toggleDentalChartRadio(chartId, show) {
    const chart = document.getElementById(chartId);
    if (!chart) return;

    if (show) {
        chart.classList.remove('hidden');
        if (!chart.hasChildNodes()) {
            createDentalChart(chart);
        }
    } else {
        chart.classList.add('hidden');
        resetChartSelections(chart);
    }
}

/**
 * Crée un schéma dentaire dans le conteneur spécifié
 * @param {HTMLElement} container - Le conteneur pour le schéma dentaire
 */
function createDentalChart(container) {
    // Ligne supérieure
    const upperRow = document.createElement('div');
    upperRow.classList.add('dental-row');
    upperRow.setAttribute('data-row', 'upper');

    UPPER_TEETH.forEach(num => {
        upperRow.appendChild(createTooth(num, container));
    });

    // Ligne inférieure
    const lowerRow = document.createElement('div');
    lowerRow.classList.add('dental-row');
    lowerRow.setAttribute('data-row', 'lower');

    LOWER_TEETH.forEach(num => {
        lowerRow.appendChild(createTooth(num, container));
    });

    // Ajouter les lignes au conteneur
    container.appendChild(upperRow);
    container.appendChild(lowerRow);
}

/**
 * Crée un élément dent
 * @param {number} num - Le numéro de la dent
 * @param {HTMLElement} container - Le conteneur parent
 * @returns {HTMLElement} L'élément dent
 */
function createTooth(num, container) {
    const tooth = document.createElement('div');
    tooth.classList.add('tooth');
    tooth.textContent = num;
    tooth.setAttribute('data-tooth', num);

    // Récupérer le type de traitement depuis l'attribut data du conteneur
    const treatmentType = container.getAttribute('data-type') || '';
    const selectionClass = TREATMENT_CLASSES[treatmentType] || '';

    // Gestion du clic
    tooth.addEventListener('click', function(e) {
        e.stopPropagation();

        if (selectionClass) {
            this.classList.toggle(selectionClass);
        }

        // Déclencher un événement personnalisé pour signaler le changement
        const event = new CustomEvent('toothSelectionChange', {
            bubbles: true,
            detail: {
                tooth: num,
                selected: this.classList.contains(selectionClass),
                type: treatmentType
            }
        });
        this.dispatchEvent(event);
    });

    // Accessibilité
    tooth.setAttribute('role', 'button');
    tooth.setAttribute('tabindex', '0');
    tooth.setAttribute('aria-label', `Dent ${num}`);
    tooth.setAttribute('aria-pressed', 'false');

    // Support clavier
    tooth.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    return tooth;
}

/**
 * Réinitialise les sélections d'un schéma dentaire
 * @param {HTMLElement} chart - Le conteneur du schéma dentaire
 */
function resetChartSelections(chart) {
    const teeth = chart.querySelectorAll('.tooth');
    teeth.forEach(tooth => {
        // Retirer toutes les classes de sélection
        Object.values(TREATMENT_CLASSES).forEach(cls => {
            tooth.classList.remove(cls);
        });
        tooth.setAttribute('aria-pressed', 'false');
    });
}

/**
 * Récupère les dents sélectionnées pour un schéma donné
 * @param {string} chartId - L'ID du conteneur du schéma dentaire
 * @param {string} className - La classe CSS de sélection
 * @returns {Array<string>} Les numéros des dents sélectionnées
 */
function getSelectedTeeth(chartId, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return [];

    const selectedTeeth = chart.querySelectorAll(`.tooth.${className}`);
    return Array.from(selectedTeeth).map(tooth => tooth.textContent);
}

/**
 * Définit les dents sélectionnées pour un schéma donné
 * @param {string} chartId - L'ID du conteneur du schéma dentaire
 * @param {Array<string|number>} teethNumbers - Les numéros des dents à sélectionner
 * @param {string} className - La classe CSS de sélection
 */
function setSelectedTeeth(chartId, teethNumbers, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return;

    // S'assurer que le schéma existe
    if (!chart.hasChildNodes()) {
        createDentalChart(chart);
    }

    teethNumbers.forEach(num => {
        const tooth = chart.querySelector(`[data-tooth="${num}"]`);
        if (tooth) {
            tooth.classList.add(className);
            tooth.setAttribute('aria-pressed', 'true');
        }
    });
}

/**
 * Récupère toutes les sélections de tous les schémas dentaires
 * @returns {Object} Un objet contenant toutes les sélections
 */
function getAllDentalSelections() {
    return {
        avulsions: getSelectedTeeth('avulsion-chart', 'selected-avulsion'),
        restaurations: getSelectedTeeth('restauration-chart', 'selected-restauration'),
        endo: getSelectedTeeth('endo-chart', 'selected-endo'),
        implants: getSelectedTeeth('implant-chart', 'selected-implant'),
        parodonto: getSelectedTeeth('parodonto-chart', 'selected-parodonto'),
        protheses_transitoires: getSelectedTeeth('transitoire-chart', 'selected-transitoire'),
        protheses_definitives: {
            inlay_core: getSelectedTeeth('inlay-chart', 'selected-definitive'),
            couronnes: getSelectedTeeth('couronne-chart', 'selected-definitive'),
            onlay: getSelectedTeeth('onlay-chart', 'selected-definitive'),
            amovibles: getSelectedTeeth('prothese-chart', 'selected-definitive')
        }
    };
}

// Exposer les fonctions globalement
window.toggleDentalChart = toggleDentalChart;
window.toggleDentalChartRadio = toggleDentalChartRadio;
window.createDentalChart = createDentalChart;
window.getSelectedTeeth = getSelectedTeeth;
window.setSelectedTeeth = setSelectedTeeth;
window.getAllDentalSelections = getAllDentalSelections;
window.resetChartSelections = resetChartSelections;
