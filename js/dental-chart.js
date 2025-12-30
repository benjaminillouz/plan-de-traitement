/**
 * Dental Chart Module - Hello PdT
 * Schéma dentaire interactif moderne
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
        resetChartSelections(chart);
    }
}

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

function createDentalChart(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'bg-slate-50 rounded-xl p-4 mt-2 border border-slate-200';

    const upperLabel = document.createElement('div');
    upperLabel.className = 'text-xs text-slate-400 text-center mb-2 font-medium uppercase tracking-wide';
    upperLabel.textContent = 'Arcade supérieure';
    wrapper.appendChild(upperLabel);

    const upperRow = document.createElement('div');
    upperRow.className = 'flex justify-center gap-1 mb-3 flex-wrap';
    upperRow.setAttribute('data-row', 'upper');

    UPPER_TEETH.forEach((num, index) => {
        if (index === 8) {
            const separator = document.createElement('div');
            separator.className = 'w-1 mx-1 hidden sm:block';
            upperRow.appendChild(separator);
        }
        upperRow.appendChild(createTooth(num, container));
    });
    wrapper.appendChild(upperRow);

    const divider = document.createElement('div');
    divider.className = 'border-t border-dashed border-slate-300 my-3';
    wrapper.appendChild(divider);

    const lowerRow = document.createElement('div');
    lowerRow.className = 'flex justify-center gap-1 mt-3 flex-wrap';
    lowerRow.setAttribute('data-row', 'lower');

    LOWER_TEETH.forEach((num, index) => {
        if (index === 8) {
            const separator = document.createElement('div');
            separator.className = 'w-1 mx-1 hidden sm:block';
            lowerRow.appendChild(separator);
        }
        lowerRow.appendChild(createTooth(num, container));
    });
    wrapper.appendChild(lowerRow);

    const lowerLabel = document.createElement('div');
    lowerLabel.className = 'text-xs text-slate-400 text-center mt-2 font-medium uppercase tracking-wide';
    lowerLabel.textContent = 'Arcade inférieure';
    wrapper.appendChild(lowerLabel);

    container.appendChild(wrapper);
}

function createTooth(num, container) {
    const tooth = document.createElement('button');
    tooth.className = 'tooth w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 cursor-pointer select-none';
    tooth.textContent = num;
    tooth.setAttribute('data-tooth', num);
    tooth.type = 'button';

    const treatmentType = container.getAttribute('data-type') || '';
    const selectionClass = TREATMENT_CLASSES[treatmentType] || '';

    tooth.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (selectionClass) {
            this.classList.toggle(selectionClass);
        }

        const event = new CustomEvent('toothSelectionChange', {
            bubbles: true,
            detail: { tooth: num, selected: this.classList.contains(selectionClass), type: treatmentType }
        });
        this.dispatchEvent(event);
    });

    tooth.setAttribute('role', 'switch');
    tooth.setAttribute('aria-checked', 'false');
    tooth.setAttribute('aria-label', `Dent ${num}`);

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
        tooth.setAttribute('aria-checked', 'false');
    });
}

function getSelectedTeeth(chartId, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return [];
    return Array.from(chart.querySelectorAll(`.tooth.${className}`)).map(t => t.textContent);
}

function setSelectedTeeth(chartId, teethNumbers, className) {
    const chart = document.getElementById(chartId);
    if (!chart) return;
    if (!chart.hasChildNodes()) createDentalChart(chart);
    teethNumbers.forEach(num => {
        const tooth = chart.querySelector(`[data-tooth="${num}"]`);
        if (tooth) {
            tooth.classList.add(className);
            tooth.setAttribute('aria-checked', 'true');
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

window.toggleDentalChart = toggleDentalChart;
window.toggleDentalChartRadio = toggleDentalChartRadio;
window.createDentalChart = createDentalChart;
window.getSelectedTeeth = getSelectedTeeth;
window.setSelectedTeeth = setSelectedTeeth;
window.getAllDentalSelections = getAllDentalSelections;
window.resetChartSelections = resetChartSelections;
