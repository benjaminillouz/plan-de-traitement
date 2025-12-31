/**
 * Dental Chart Module - Hello PdT
 * Schéma dentaire interactif visuel - Style professionnel
 */

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Types de dents pour les formes SVG
const TOOTH_TYPES = {
    // Molaires (3 racines en haut, 2 en bas)
    18: 'molar', 17: 'molar', 16: 'molar', 28: 'molar', 27: 'molar', 26: 'molar',
    48: 'molar', 47: 'molar', 46: 'molar', 38: 'molar', 37: 'molar', 36: 'molar',
    // Prémolaires
    15: 'premolar', 14: 'premolar', 25: 'premolar', 24: 'premolar',
    45: 'premolar', 44: 'premolar', 35: 'premolar', 34: 'premolar',
    // Canines
    13: 'canine', 23: 'canine', 43: 'canine', 33: 'canine',
    // Incisives latérales
    12: 'lateral', 22: 'lateral', 42: 'lateral', 32: 'lateral',
    // Incisives centrales
    11: 'central', 21: 'central', 41: 'central', 31: 'central'
};

const TREATMENT_CLASSES = {
    'avulsion': 'selected-avulsion',
    'restauration': 'selected-restauration',
    'endo': 'selected-endo',
    'implant': 'selected-implant',
    'parodonto': 'selected-parodonto',
    'transitoire': 'selected-transitoire',
    'definitive': 'selected-definitive'
};

const TREATMENT_COLORS = {
    'avulsion': { bg: '#ef4444', border: '#dc2626', light: '#fecaca' },
    'restauration': { bg: '#22c55e', border: '#16a34a', light: '#bbf7d0' },
    'endo': { bg: '#15803d', border: '#166534', light: '#86efac' },
    'implant': { bg: '#3b82f6', border: '#2563eb', light: '#bfdbfe' },
    'parodonto': { bg: '#8b5cf6', border: '#7c3aed', light: '#ddd6fe' },
    'transitoire': { bg: '#eab308', border: '#ca8a04', light: '#fef08a', text: '#1f2937' },
    'definitive': { bg: '#0f766e', border: '#0d9488', light: '#99f6e4' }
};

// SVG paths pour les différents types de dents
function getToothSVG(type, isUpper) {
    const flip = isUpper ? '' : 'transform="scale(1,-1) translate(0,-50)"';

    switch(type) {
        case 'molar':
            return `<svg viewBox="0 0 40 55" class="tooth-svg">
                <g ${flip}>
                    <path class="tooth-root" d="M8,28 L6,48 Q7,52 10,48 L12,35" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-root" d="M18,30 L18,50 Q20,54 22,50 L22,30" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-root" d="M28,28 L30,48 Q33,52 34,48 L32,35" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-crown" d="M4,8 Q4,2 12,2 L28,2 Q36,2 36,8 L36,28 Q36,32 20,32 Q4,32 4,28 Z" fill="#f5f0e6" stroke="#d4c4a8" stroke-width="1.5"/>
                    <ellipse class="tooth-surface" cx="20" cy="15" rx="12" ry="8" fill="#fffef8" stroke="#e8dcc8" stroke-width="1"/>
                </g>
            </svg>`;
        case 'premolar':
            return `<svg viewBox="0 0 32 50" class="tooth-svg">
                <g ${flip}>
                    <path class="tooth-root" d="M10,26 L8,44 Q10,48 14,44 L16,30" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-root" d="M16,26 L18,44 Q22,48 24,44 L22,30" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-crown" d="M4,6 Q4,1 10,1 L22,1 Q28,1 28,6 L28,26 Q28,30 16,30 Q4,30 4,26 Z" fill="#f5f0e6" stroke="#d4c4a8" stroke-width="1.5"/>
                    <ellipse class="tooth-surface" cx="16" cy="12" rx="9" ry="6" fill="#fffef8" stroke="#e8dcc8" stroke-width="1"/>
                </g>
            </svg>`;
        case 'canine':
            return `<svg viewBox="0 0 28 55" class="tooth-svg">
                <g ${flip}>
                    <path class="tooth-root" d="M10,28 L8,50 Q14,56 20,50 L18,28" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-crown" d="M4,8 Q4,1 14,1 Q24,1 24,8 L22,28 Q22,32 14,32 Q6,32 6,28 Z" fill="#f5f0e6" stroke="#d4c4a8" stroke-width="1.5"/>
                    <path class="tooth-surface" d="M8,10 Q14,4 20,10 L18,20 Q14,24 10,20 Z" fill="#fffef8" stroke="#e8dcc8" stroke-width="1"/>
                </g>
            </svg>`;
        case 'lateral':
            return `<svg viewBox="0 0 24 48" class="tooth-svg">
                <g ${flip}>
                    <path class="tooth-root" d="M8,24 L6,42 Q12,48 18,42 L16,24" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-crown" d="M3,6 Q3,1 12,1 Q21,1 21,6 L20,24 Q20,28 12,28 Q4,28 4,24 Z" fill="#f5f0e6" stroke="#d4c4a8" stroke-width="1.5"/>
                    <rect class="tooth-surface" x="6" y="6" width="12" height="14" rx="3" fill="#fffef8" stroke="#e8dcc8" stroke-width="1"/>
                </g>
            </svg>`;
        case 'central':
            return `<svg viewBox="0 0 26 48" class="tooth-svg">
                <g ${flip}>
                    <path class="tooth-root" d="M9,24 L7,42 Q13,48 19,42 L17,24" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-crown" d="M3,6 Q3,1 13,1 Q23,1 23,6 L22,24 Q22,28 13,28 Q4,28 4,24 Z" fill="#f5f0e6" stroke="#d4c4a8" stroke-width="1.5"/>
                    <rect class="tooth-surface" x="6" y="5" width="14" height="15" rx="3" fill="#fffef8" stroke="#e8dcc8" stroke-width="1"/>
                </g>
            </svg>`;
        default:
            return `<svg viewBox="0 0 28 45" class="tooth-svg">
                <g ${flip}>
                    <path class="tooth-root" d="M10,24 L8,40 Q14,45 20,40 L18,24" fill="#e8dcc8" stroke="#c9b896" stroke-width="1"/>
                    <path class="tooth-crown" d="M4,6 Q4,1 14,1 Q24,1 24,6 L23,24 Q23,28 14,28 Q5,28 5,24 Z" fill="#f5f0e6" stroke="#d4c4a8" stroke-width="1.5"/>
                </g>
            </svg>`;
    }
}

function toggleDentalChart(checkbox, chartId) {
    const chart = document.getElementById(chartId);
    if (!chart) return;

    if (checkbox.checked) {
        chart.classList.remove('hidden');
        chart.style.display = 'block';
        if (!chart.querySelector('.dental-wrapper')) {
            createVisualDentalChart(chart);
        }
    } else {
        chart.classList.add('hidden');
        chart.style.display = 'none';
        resetChartSelections(chart);
    }
}

function toggleDentalChartRadio(chartId, show) {
    const chart = document.getElementById(chartId);
    if (!chart) return;

    if (show) {
        chart.classList.remove('hidden');
        chart.style.display = 'block';
        if (!chart.querySelector('.dental-wrapper')) {
            createVisualDentalChart(chart);
        }
    } else {
        chart.classList.add('hidden');
        chart.style.display = 'none';
        resetChartSelections(chart);
    }
}

function createVisualDentalChart(container) {
    const treatmentType = container.getAttribute('data-type') || '';
    const color = TREATMENT_COLORS[treatmentType] || { bg: '#3b82f6', border: '#2563eb', light: '#bfdbfe' };

    const wrapper = document.createElement('div');
    wrapper.className = 'dental-wrapper';
    wrapper.style.cssText = `
        background: linear-gradient(180deg, #e8f4f8 0%, #f0f7fa 50%, #e8f4f8 100%);
        border-radius: 16px;
        padding: 20px;
        margin-top: 12px;
        border: 1px solid #d1e3e8;
        overflow-x: auto;
    `;

    const innerContainer = document.createElement('div');
    innerContainer.style.cssText = 'min-width: 600px; max-width: 800px; margin: 0 auto;';

    // Arcade supérieure
    innerContainer.appendChild(createArcade(UPPER_TEETH, true, treatmentType, color));

    // Ligne centrale de séparation
    const centerLine = document.createElement('div');
    centerLine.style.cssText = `
        height: 2px;
        background: linear-gradient(to right, transparent, #94d3e8 20%, #94d3e8 80%, transparent);
        margin: 15px 0;
    `;
    innerContainer.appendChild(centerLine);

    // Arcade inférieure
    innerContainer.appendChild(createArcade(LOWER_TEETH, false, treatmentType, color));

    wrapper.appendChild(innerContainer);
    container.appendChild(wrapper);

    // Ajouter les styles CSS pour les animations
    addToothStyles();
}

function createArcade(teeth, isUpper, treatmentType, color) {
    const arcade = document.createElement('div');
    arcade.style.cssText = 'display: flex; flex-direction: column; align-items: center;';

    // Numéros des dents (en haut pour arcade supérieure)
    if (isUpper) {
        arcade.appendChild(createNumberRow(teeth, treatmentType, color, true));
    }

    // Rangée des dents visuelles
    const teethRow = document.createElement('div');
    teethRow.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: ${isUpper ? 'flex-start' : 'flex-end'};
        gap: 2px;
        padding: ${isUpper ? '5px 0 0 0' : '0 0 5px 0'};
    `;

    teeth.forEach((num, index) => {
        // Séparateur central
        if (index === 8) {
            const separator = document.createElement('div');
            separator.style.cssText = `
                width: 4px;
                height: 60px;
                background: linear-gradient(to bottom, #94d3e8, transparent);
                margin: 0 8px;
                border-radius: 2px;
            `;
            teethRow.appendChild(separator);
        }
        teethRow.appendChild(createVisualTooth(num, isUpper, treatmentType, color));
    });

    arcade.appendChild(teethRow);

    // Numéros des dents (en bas pour arcade inférieure)
    if (!isUpper) {
        arcade.appendChild(createNumberRow(teeth, treatmentType, color, false));
    }

    return arcade;
}

function createNumberRow(teeth, treatmentType, color, isUpper) {
    const row = document.createElement('div');
    row.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 2px;
        margin-${isUpper ? 'bottom' : 'top'}: 5px;
    `;

    teeth.forEach((num, index) => {
        if (index === 8) {
            const spacer = document.createElement('div');
            spacer.style.cssText = 'width: 20px;';
            row.appendChild(spacer);
        }
        row.appendChild(createToothNumber(num, treatmentType, color));
    });

    return row;
}

function createToothNumber(num, treatmentType, color) {
    const numberBtn = document.createElement('button');
    numberBtn.type = 'button';
    numberBtn.setAttribute('data-tooth', num);
    numberBtn.textContent = num;
    numberBtn.className = 'tooth-number';

    numberBtn.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #4a90a4;
        background: linear-gradient(135deg, #5ba3b8 0%, #4a90a4 100%);
        font-size: 10px;
        font-weight: 700;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        outline: none;
        box-shadow: 0 2px 4px rgba(74, 144, 164, 0.3);
    `;

    const selectionClass = TREATMENT_CLASSES[treatmentType] || '';

    numberBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleToothClick(this, num, treatmentType, color, selectionClass);
    });

    numberBtn.addEventListener('mouseenter', function() {
        if (!this.classList.contains(selectionClass)) {
            this.style.transform = 'scale(1.15)';
            this.style.boxShadow = '0 4px 8px rgba(74, 144, 164, 0.4)';
        }
    });

    numberBtn.addEventListener('mouseleave', function() {
        if (!this.classList.contains(selectionClass)) {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 2px 4px rgba(74, 144, 164, 0.3)';
        }
    });

    return numberBtn;
}

function createVisualTooth(num, isUpper, treatmentType, color) {
    const toothContainer = document.createElement('div');
    toothContainer.setAttribute('data-tooth-visual', num);
    toothContainer.className = 'tooth-visual-container';

    const toothType = TOOTH_TYPES[num] || 'central';

    // Tailles selon le type de dent
    const sizes = {
        'molar': { width: 38, height: 55 },
        'premolar': { width: 30, height: 48 },
        'canine': { width: 26, height: 52 },
        'lateral': { width: 24, height: 45 },
        'central': { width: 26, height: 45 }
    };

    const size = sizes[toothType] || { width: 28, height: 45 };

    toothContainer.style.cssText = `
        width: ${size.width}px;
        height: ${size.height}px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
    `;

    toothContainer.innerHTML = getToothSVG(toothType, isUpper);

    // Click handler for visual tooth
    toothContainer.addEventListener('click', function() {
        // Find and click the corresponding number button
        const chart = this.closest('.dental-wrapper');
        const numberBtn = chart.querySelector(`.tooth-number[data-tooth="${num}"]`);
        if (numberBtn) {
            numberBtn.click();
        }
    });

    toothContainer.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.filter = 'brightness(1.05)';
    });

    toothContainer.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.filter = 'brightness(1)';
    });

    return toothContainer;
}

function handleToothClick(btn, num, treatmentType, color, selectionClass) {
    const chart = btn.closest('.dental-wrapper');
    const visualTooth = chart.querySelector(`[data-tooth-visual="${num}"]`);

    if (btn.classList.contains(selectionClass)) {
        // Deselect
        btn.classList.remove(selectionClass);
        btn.style.background = 'linear-gradient(135deg, #5ba3b8 0%, #4a90a4 100%)';
        btn.style.borderColor = '#4a90a4';
        btn.style.color = 'white';
        btn.style.transform = 'scale(1)';

        if (visualTooth) {
            visualTooth.querySelector('.tooth-crown').style.fill = '#f5f0e6';
            visualTooth.querySelector('.tooth-surface').style.fill = '#fffef8';
        }
    } else {
        // Select
        btn.classList.add(selectionClass);
        btn.style.background = color.bg;
        btn.style.borderColor = color.border;
        btn.style.color = color.text || 'white';
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = `0 4px 12px ${color.bg}80`;

        if (visualTooth) {
            visualTooth.querySelector('.tooth-crown').style.fill = color.light;
            visualTooth.querySelector('.tooth-surface').style.fill = color.bg;
        }

        // Bounce animation
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);
    }
}

function addToothStyles() {
    if (document.getElementById('tooth-styles')) return;

    const style = document.createElement('style');
    style.id = 'tooth-styles';
    style.textContent = `
        .tooth-svg {
            width: 100%;
            height: 100%;
        }
        .tooth-crown, .tooth-root, .tooth-surface {
            transition: all 0.2s ease;
        }
        .tooth-visual-container:hover .tooth-crown {
            filter: brightness(1.02);
        }
        .tooth-number:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
}

function resetChartSelections(chart) {
    const numbers = chart.querySelectorAll('.tooth-number');
    numbers.forEach(btn => {
        Object.values(TREATMENT_CLASSES).forEach(cls => btn.classList.remove(cls));
        btn.style.background = 'linear-gradient(135deg, #5ba3b8 0%, #4a90a4 100%)';
        btn.style.borderColor = '#4a90a4';
        btn.style.color = 'white';
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 2px 4px rgba(74, 144, 164, 0.3)';
    });

    const visuals = chart.querySelectorAll('.tooth-visual-container');
    visuals.forEach(tooth => {
        const crown = tooth.querySelector('.tooth-crown');
        const surface = tooth.querySelector('.tooth-surface');
        if (crown) crown.style.fill = '#f5f0e6';
        if (surface) surface.style.fill = '#fffef8';
    });
}

function getSelectedTeeth(chartId, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return [];
    return Array.from(chart.querySelectorAll(`.tooth-number.${className}`)).map(t => t.getAttribute('data-tooth'));
}

function getDentalSelection(chartId) {
    const chart = document.getElementById(chartId);
    if (!chart) return [];
    const treatmentType = chart.getAttribute('data-type') || '';
    const className = TREATMENT_CLASSES[treatmentType] || '';
    return Array.from(chart.querySelectorAll(`.tooth-number.${className}`)).map(t => parseInt(t.getAttribute('data-tooth')));
}

function setSelectedTeeth(chartId, teethNumbers, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return;
    if (!chart.querySelector('.dental-wrapper')) createVisualDentalChart(chart);

    const treatmentType = chart.getAttribute('data-type') || '';
    const color = TREATMENT_COLORS[treatmentType] || { bg: '#3b82f6', border: '#2563eb', light: '#bfdbfe' };

    teethNumbers.forEach(num => {
        const btn = chart.querySelector(`.tooth-number[data-tooth="${num}"]`);
        const visualTooth = chart.querySelector(`[data-tooth-visual="${num}"]`);

        if (btn) {
            btn.classList.add(className);
            btn.style.background = color.bg;
            btn.style.borderColor = color.border;
            btn.style.color = color.text || 'white';
        }

        if (visualTooth) {
            const crown = visualTooth.querySelector('.tooth-crown');
            const surface = visualTooth.querySelector('.tooth-surface');
            if (crown) crown.style.fill = color.light;
            if (surface) surface.style.fill = color.bg;
        }
    });
}

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

// Legacy function for createDentalChart
function createDentalChart(container) {
    createVisualDentalChart(container);
}

// Expose globally
window.toggleDentalChart = toggleDentalChart;
window.toggleDentalChartRadio = toggleDentalChartRadio;
window.createDentalChart = createDentalChart;
window.createVisualDentalChart = createVisualDentalChart;
window.getSelectedTeeth = getSelectedTeeth;
window.getDentalSelection = getDentalSelection;
window.setSelectedTeeth = setSelectedTeeth;
window.getAllDentalSelections = getAllDentalSelections;
window.resetChartSelections = resetChartSelections;
