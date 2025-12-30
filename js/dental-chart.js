/**
 * Dental Chart Module - Hello PdT
 * Schéma dentaire interactif - Style HelloParo
 */

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

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
    'avulsion': { bg: '#ef4444', border: '#dc2626' },
    'restauration': { bg: '#22c55e', border: '#16a34a' },
    'endo': { bg: '#15803d', border: '#166534' },
    'implant': { bg: '#3b82f6', border: '#2563eb' },
    'parodonto': { bg: '#8b5cf6', border: '#7c3aed' },
    'transitoire': { bg: '#eab308', border: '#ca8a04', text: '#1f2937' },
    'definitive': { bg: '#0f766e', border: '#0d9488' }
};

function toggleDentalChart(checkbox, chartId) {
    const chart = document.getElementById(chartId);
    if (!chart) return;

    if (checkbox.checked) {
        chart.classList.remove('hidden');
        chart.style.display = 'block';
        if (!chart.querySelector('.dental-wrapper')) {
            createDentalChart(chart);
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
            createDentalChart(chart);
        }
    } else {
        chart.classList.add('hidden');
        chart.style.display = 'none';
        resetChartSelections(chart);
    }
}

function createDentalChart(container) {
    const treatmentType = container.getAttribute('data-type') || '';
    const color = TREATMENT_COLORS[treatmentType] || { bg: '#3b82f6', border: '#2563eb' };

    const wrapper = document.createElement('div');
    wrapper.className = 'dental-wrapper';
    wrapper.style.cssText = 'background: linear-gradient(to bottom, #f8fafc, #f1f5f9); border-radius: 12px; padding: 16px; margin-top: 12px; border: 1px solid #e2e8f0; overflow-x: auto;';

    const innerContainer = document.createElement('div');
    innerContainer.style.cssText = 'min-width: 500px;';

    // Arcade supérieure
    const upperSection = document.createElement('div');
    upperSection.style.cssText = 'margin-bottom: 8px;';

    const upperLabel = document.createElement('div');
    upperLabel.style.cssText = 'font-size: 10px; color: #64748b; text-align: center; margin-bottom: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;';
    upperLabel.textContent = 'Maxillaire';
    upperSection.appendChild(upperLabel);

    const upperRow = document.createElement('div');
    upperRow.style.cssText = 'display: flex; justify-content: center; gap: 2px;';

    UPPER_TEETH.forEach((num, index) => {
        if (index === 8) {
            const separator = document.createElement('div');
            separator.style.cssText = 'width: 8px; display: flex; align-items: center; justify-content: center;';
            separator.innerHTML = '<div style="width: 1px; height: 24px; background: #cbd5e1;"></div>';
            upperRow.appendChild(separator);
        }
        upperRow.appendChild(createTooth(num, treatmentType, color));
    });
    upperSection.appendChild(upperRow);
    innerContainer.appendChild(upperSection);

    // Ligne de séparation
    const divider = document.createElement('div');
    divider.style.cssText = 'height: 1px; background: linear-gradient(to right, transparent, #cbd5e1 20%, #cbd5e1 80%, transparent); margin: 10px 0;';
    innerContainer.appendChild(divider);

    // Arcade inférieure
    const lowerSection = document.createElement('div');

    const lowerRow = document.createElement('div');
    lowerRow.style.cssText = 'display: flex; justify-content: center; gap: 2px;';

    LOWER_TEETH.forEach((num, index) => {
        if (index === 8) {
            const separator = document.createElement('div');
            separator.style.cssText = 'width: 8px; display: flex; align-items: center; justify-content: center;';
            separator.innerHTML = '<div style="width: 1px; height: 24px; background: #cbd5e1;"></div>';
            lowerRow.appendChild(separator);
        }
        lowerRow.appendChild(createTooth(num, treatmentType, color));
    });
    lowerSection.appendChild(lowerRow);

    const lowerLabel = document.createElement('div');
    lowerLabel.style.cssText = 'font-size: 10px; color: #64748b; text-align: center; margin-top: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;';
    lowerLabel.textContent = 'Mandibulaire';
    lowerSection.appendChild(lowerLabel);
    innerContainer.appendChild(lowerSection);

    wrapper.appendChild(innerContainer);
    container.appendChild(wrapper);
}

function createTooth(num, treatmentType, color) {
    const tooth = document.createElement('button');
    tooth.type = 'button';
    tooth.setAttribute('data-tooth', num);
    tooth.textContent = num;

    const baseStyle = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 2px solid #d1d5db;
        background: white;
        font-size: 11px;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        outline: none;
    `;
    tooth.style.cssText = baseStyle;
    tooth.className = 'tooth';

    const selectionClass = TREATMENT_CLASSES[treatmentType] || '';

    // Hover effect
    tooth.addEventListener('mouseenter', function() {
        if (!this.classList.contains(selectionClass)) {
            this.style.borderColor = color.border;
            this.style.background = '#f8fafc';
            this.style.transform = 'scale(1.1)';
        }
    });

    tooth.addEventListener('mouseleave', function() {
        if (!this.classList.contains(selectionClass)) {
            this.style.borderColor = '#d1d5db';
            this.style.background = 'white';
            this.style.transform = 'scale(1)';
        }
    });

    // Click handler
    tooth.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.classList.contains(selectionClass)) {
            // Deselect
            this.classList.remove(selectionClass);
            this.style.background = 'white';
            this.style.borderColor = '#d1d5db';
            this.style.color = '#374151';
            this.style.transform = 'scale(1)';
        } else {
            // Select
            this.classList.add(selectionClass);
            this.style.background = color.bg;
            this.style.borderColor = color.border;
            this.style.color = color.text || 'white';
            this.style.transform = 'scale(1.05)';

            // Bounce animation
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        }
    });

    // Keyboard support
    tooth.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    return tooth;
}

function resetChartSelections(chart) {
    const teeth = chart.querySelectorAll('.tooth');
    teeth.forEach(tooth => {
        Object.values(TREATMENT_CLASSES).forEach(cls => tooth.classList.remove(cls));
        tooth.style.background = 'white';
        tooth.style.borderColor = '#d1d5db';
        tooth.style.color = '#374151';
    });
}

function getSelectedTeeth(chartId, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return [];
    return Array.from(chart.querySelectorAll(`.tooth.${className}`)).map(t => t.getAttribute('data-tooth'));
}

function setSelectedTeeth(chartId, teethNumbers, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return;
    if (!chart.querySelector('.dental-wrapper')) createDentalChart(chart);

    const treatmentType = chart.getAttribute('data-type') || '';
    const color = TREATMENT_COLORS[treatmentType] || { bg: '#3b82f6', border: '#2563eb' };

    teethNumbers.forEach(num => {
        const tooth = chart.querySelector(`[data-tooth="${num}"]`);
        if (tooth) {
            tooth.classList.add(className);
            tooth.style.background = color.bg;
            tooth.style.borderColor = color.border;
            tooth.style.color = color.text || 'white';
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

// Expose globally
window.toggleDentalChart = toggleDentalChart;
window.toggleDentalChartRadio = toggleDentalChartRadio;
window.createDentalChart = createDentalChart;
window.getSelectedTeeth = getSelectedTeeth;
window.setSelectedTeeth = setSelectedTeeth;
window.getAllDentalSelections = getAllDentalSelections;
window.resetChartSelections = resetChartSelections;
