/**
 * PDF Generator Module
 * Génération, aperçu et partage du plan de traitement en PDF
 */

// Store generated PDF blob
let currentPdfBlob = null;
let currentPdfDataUrl = null;

/**
 * Initialize PDF functionality
 */
function initPdfGenerator() {
    const openPdfBtn = document.getElementById('openPdfPreview');
    const closePdfModalBtn = document.getElementById('closePdfModal');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const printPdfBtn = document.getElementById('printPdfBtn');
    const sharePdfBtn = document.getElementById('sharePdfBtn');
    const shareDropdown = document.getElementById('shareDropdown');
    const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
    const shareEmailBtn = document.getElementById('shareEmailBtn');
    const pdfModal = document.getElementById('pdfModal');

    // Open PDF preview
    if (openPdfBtn) {
        openPdfBtn.addEventListener('click', generatePdfPreview);
    }

    // Close modal
    if (closePdfModalBtn) {
        closePdfModalBtn.addEventListener('click', closePdfModal);
    }

    // Close on backdrop click
    if (pdfModal) {
        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) closePdfModal();
        });
    }

    // Download PDF
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadPdf);
    }

    // Print PDF
    if (printPdfBtn) {
        printPdfBtn.addEventListener('click', printPdf);
    }

    // Share dropdown toggle
    if (sharePdfBtn && shareDropdown) {
        sharePdfBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            shareDropdown.classList.toggle('hidden');
        });

        // Close dropdown on outside click
        document.addEventListener('click', () => {
            shareDropdown.classList.add('hidden');
        });
    }

    // Share via WhatsApp
    if (shareWhatsappBtn) {
        shareWhatsappBtn.addEventListener('click', shareViaWhatsApp);
    }

    // Share via Email
    if (shareEmailBtn) {
        shareEmailBtn.addEventListener('click', shareViaEmail);
    }

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pdfModal && !pdfModal.classList.contains('hidden')) {
            closePdfModal();
        }
    });
}

/**
 * Get patient info from form
 */
function getPatientInfo() {
    return {
        nom: document.getElementById('patient-nom')?.value || '',
        prenom: document.getElementById('patient-prenom')?.value || '',
        date: document.getElementById('date-traitement')?.value || new Date().toISOString().split('T')[0],
        praticien: document.getElementById('praticien-nom')?.value || ''
    };
}

/**
 * Collect treatment data from form
 */
function collectTreatmentData() {
    const data = {
        assainissement: {
            detartrage: document.getElementById('detartrage')?.checked || false,
            avulsions: window.getDentalSelection ? window.getDentalSelection('avulsion-chart') : []
        },
        conservateurs: {
            restaurations: window.getDentalSelection ? window.getDentalSelection('restauration-chart') : [],
            endo: window.getDentalSelection ? window.getDentalSelection('endo-chart') : []
        },
        complementaires: {
            implants: window.getDentalSelection ? window.getDentalSelection('implant-chart') : [],
            parodonto: window.getDentalSelection ? window.getDentalSelection('parodonto-chart') : []
        },
        transitoires: {
            active: document.querySelector('input[name="transitoires"]:checked')?.value === 'oui',
            dents: window.getDentalSelection ? window.getDentalSelection('transitoire-chart') : []
        },
        definitives: {
            inlayCore: {
                active: document.getElementById('inlay-core')?.checked || false,
                dents: window.getDentalSelection ? window.getDentalSelection('inlay-chart') : []
            },
            couronnes: {
                active: document.getElementById('couronne')?.checked || false,
                dents: window.getDentalSelection ? window.getDentalSelection('couronne-chart') : []
            },
            onlay: {
                active: document.getElementById('onlay')?.checked || false,
                dents: window.getDentalSelection ? window.getDentalSelection('onlay-chart') : []
            },
            amovibles: {
                active: document.getElementById('prothese-amovible')?.checked || false,
                dents: window.getDentalSelection ? window.getDentalSelection('prothese-chart') : []
            }
        },
        notes: document.getElementById('notes')?.value || '',
        radiographies: window.getRadiographs ? window.getRadiographs() : [],
        photos: window.getPhotos ? window.getPhotos() : [],
        dentalSelections: window.getDentalSelectionsForPDF ? window.getDentalSelectionsForPDF() : null
    };
    return data;
}

/**
 * Generate PDF preview HTML
 */
function generatePdfPreview() {
    const pdfModal = document.getElementById('pdfModal');
    const pdfGenerating = document.getElementById('pdfGenerating');
    const previewContainer = document.getElementById('pdfPreviewContainer');

    if (!pdfModal || !previewContainer) return;

    // Show modal with loading
    pdfModal.classList.remove('hidden');
    if (pdfGenerating) pdfGenerating.classList.remove('hidden');

    const patient = getPatientInfo();
    const treatment = collectTreatmentData();

    // Generate preview HTML
    setTimeout(() => {
        previewContainer.innerHTML = generatePdfHtml(patient, treatment);
        if (pdfGenerating) pdfGenerating.classList.add('hidden');
    }, 300);
}

/**
 * Generate PDF HTML content
 */
function generatePdfHtml(patient, treatment) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTeethList = (teeth) => {
        if (!teeth || teeth.length === 0) return '-';
        return teeth.join(', ');
    };

    let sectionsHtml = '';

    // 1. Assainissement
    if (treatment.assainissement.detartrage || treatment.assainissement.avulsions.length > 0) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">1. Assainissement</h3>
                <div class="section-content">
                    ${treatment.assainissement.detartrage ? '<p>✓ Détartrage</p>' : ''}
                    ${treatment.assainissement.avulsions.length > 0 ? `<p>✓ Avulsions dentaires : <strong>${formatTeethList(treatment.assainissement.avulsions)}</strong></p>` : ''}
                </div>
            </div>
        `;
    }

    // 2. Soins conservateurs
    if (treatment.conservateurs.restaurations.length > 0 || treatment.conservateurs.endo.length > 0) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">2. Soins conservateurs</h3>
                <div class="section-content">
                    ${treatment.conservateurs.restaurations.length > 0 ? `<p>✓ Restaurations : <strong>${formatTeethList(treatment.conservateurs.restaurations)}</strong></p>` : ''}
                    ${treatment.conservateurs.endo.length > 0 ? `<p>✓ Traitements endodontiques : <strong>${formatTeethList(treatment.conservateurs.endo)}</strong></p>` : ''}
                </div>
            </div>
        `;
    }

    // 3. Soins complémentaires
    if (treatment.complementaires.implants.length > 0 || treatment.complementaires.parodonto.length > 0) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">3. Soins complémentaires</h3>
                <div class="section-content">
                    ${treatment.complementaires.implants.length > 0 ? `<p>✓ Pose d'implants : <strong>${formatTeethList(treatment.complementaires.implants)}</strong></p>` : ''}
                    ${treatment.complementaires.parodonto.length > 0 ? `<p>✓ Parodontologie : <strong>${formatTeethList(treatment.complementaires.parodonto)}</strong></p>` : ''}
                </div>
            </div>
        `;
    }

    // 4. Prothèses transitoires
    if (treatment.transitoires.active) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">4. Prothèses transitoires</h3>
                <div class="section-content">
                    <p>✓ Oui${treatment.transitoires.dents.length > 0 ? ` : <strong>${formatTeethList(treatment.transitoires.dents)}</strong>` : ''}</p>
                </div>
            </div>
        `;
    }

    // 5. Prothèses définitives
    const defItems = [];
    if (treatment.definitives.inlayCore.active) defItems.push(`Inlay Core${treatment.definitives.inlayCore.dents.length > 0 ? ` : ${formatTeethList(treatment.definitives.inlayCore.dents)}` : ''}`);
    if (treatment.definitives.couronnes.active) defItems.push(`Couronnes${treatment.definitives.couronnes.dents.length > 0 ? ` : ${formatTeethList(treatment.definitives.couronnes.dents)}` : ''}`);
    if (treatment.definitives.onlay.active) defItems.push(`Inlay/Onlay${treatment.definitives.onlay.dents.length > 0 ? ` : ${formatTeethList(treatment.definitives.onlay.dents)}` : ''}`);
    if (treatment.definitives.amovibles.active) defItems.push(`Prothèses amovibles${treatment.definitives.amovibles.dents.length > 0 ? ` : ${formatTeethList(treatment.definitives.amovibles.dents)}` : ''}`);

    if (defItems.length > 0) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">5. Prothèses définitives</h3>
                <div class="section-content">
                    ${defItems.map(item => `<p>✓ ${item}</p>`).join('')}
                </div>
            </div>
        `;
    }

    // 6. Radiographies
    if (treatment.radiographies && treatment.radiographies.length > 0) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">6. Radiographies</h3>
                <div class="section-content">
                    <div class="images-grid">
                        ${treatment.radiographies.map(radio => `
                            <div class="image-item">
                                <img src="${radio.data}" alt="${radio.name}" class="image-thumb">
                                <p class="image-caption">${radio.name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // 7. Photographies
    if (treatment.photos && treatment.photos.length > 0) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">7. Photographies</h3>
                <div class="section-content">
                    <div class="images-grid">
                        ${treatment.photos.map(photo => `
                            <div class="image-item">
                                <img src="${photo.data}" alt="${photo.name}" class="image-thumb">
                                <p class="image-caption">${photo.name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Notes
    if (treatment.notes) {
        sectionsHtml += `
            <div class="section">
                <h3 class="section-title">Notes complémentaires</h3>
                <div class="section-content">
                    <p>${treatment.notes.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
    }

    // If no treatment selected
    if (!sectionsHtml) {
        sectionsHtml = '<div class="empty-message">Aucun traitement sélectionné</div>';
    }

    return `
        <style>
            .pdf-content {
                font-family: 'Inter', Arial, sans-serif;
                padding: 40px;
                color: #1e293b;
            }
            .pdf-header {
                background: linear-gradient(135deg, #004B63, #003d51);
                color: white;
                padding: 30px;
                margin: -40px -40px 30px -40px;
                border-radius: 0;
            }
            .pdf-logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 5px;
            }
            .pdf-logo span { opacity: 0.8; }
            .pdf-subtitle {
                font-size: 14px;
                opacity: 0.9;
            }
            .pdf-date {
                font-size: 13px;
                opacity: 0.8;
                margin-top: 10px;
            }
            .patient-info {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
            }
            .patient-info h4 {
                color: #004B63;
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 15px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .patient-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .patient-item label {
                font-size: 11px;
                color: #64748b;
                display: block;
                margin-bottom: 3px;
            }
            .patient-item p {
                font-size: 15px;
                font-weight: 500;
                color: #1e293b;
                margin: 0;
            }
            .section {
                margin-bottom: 20px;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                overflow: hidden;
            }
            .section-title {
                background: #f1f5f9;
                color: #334155;
                font-size: 14px;
                font-weight: 600;
                padding: 12px 20px;
                margin: 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .section-content {
                padding: 15px 20px;
            }
            .section-content p {
                margin: 8px 0;
                font-size: 14px;
                color: #475569;
            }
            .section-content strong {
                color: #004B63;
            }
            .empty-message {
                text-align: center;
                color: #94a3b8;
                font-style: italic;
                padding: 40px;
            }
            .dental-chart-section {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
            }
            .images-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
            .image-item {
                text-align: center;
            }
            .image-thumb {
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            .image-caption {
                font-size: 11px;
                color: #64748b;
                margin: 5px 0 0 0;
            }
            .pdf-footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                font-size: 11px;
                color: #94a3b8;
            }
        </style>
        <div class="pdf-content">
            <div class="pdf-header">
                <div class="pdf-logo">Hello <span>PdT</span></div>
                <div class="pdf-subtitle">Plan de Traitement Dentaire</div>
                <div class="pdf-date">Date : ${formatDate(patient.date)}</div>
            </div>

            <div class="patient-info">
                <h4>Informations Patient</h4>
                <div class="patient-grid">
                    <div class="patient-item">
                        <label>Patient</label>
                        <p>${patient.prenom || '-'} ${patient.nom || '-'}</p>
                    </div>
                    <div class="patient-item">
                        <label>Praticien</label>
                        <p>${patient.praticien || '-'}</p>
                    </div>
                </div>
            </div>

            ${treatment.dentalSelections && window.generateDentalChartForPDF ? `
                <div class="dental-chart-section">
                    <h4 style="color: #004B63; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Schéma Dentaire</h4>
                    ${window.generateDentalChartForPDF(treatment.dentalSelections)}
                    <div class="legend" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; justify-content: center;">
                        <span style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444;"></span> Avulsion
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #22c55e;"></span> Restauration
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #15803d;"></span> Endo
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #3b82f6;"></span> Implant
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #8b5cf6;"></span> Parodonto
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #eab308;"></span> Transitoire
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #0f766e;"></span> Définitive
                        </span>
                    </div>
                </div>
            ` : ''}

            ${sectionsHtml}

            <div class="pdf-footer">
                Hello PdT - Plan de Traitement Dentaire<br>
                Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    `;
}

/**
 * Close PDF modal
 */
function closePdfModal() {
    const pdfModal = document.getElementById('pdfModal');
    const shareDropdown = document.getElementById('shareDropdown');
    if (pdfModal) pdfModal.classList.add('hidden');
    if (shareDropdown) shareDropdown.classList.add('hidden');
}

/**
 * Generate actual PDF file
 */
async function generatePdfFile() {
    const { jsPDF } = window.jspdf;
    const previewContainer = document.getElementById('pdfPreviewContainer');

    if (!previewContainer) return null;

    try {
        const canvas = await html2canvas(previewContainer, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        return pdf;
    } catch (error) {
        console.error('PDF generation error:', error);
        return null;
    }
}

/**
 * Download PDF
 */
async function downloadPdf() {
    const patient = getPatientInfo();
    const fileName = `Plan_Traitement_${patient.nom || 'Patient'}_${patient.prenom || ''}_${patient.date || 'date'}.pdf`.replace(/\s+/g, '_');

    const pdf = await generatePdfFile();
    if (pdf) {
        pdf.save(fileName);
        if (typeof showToast === 'function') {
            showToast('PDF téléchargé !', 'success');
        }
    }
}

/**
 * Print PDF
 */
async function printPdf() {
    const pdf = await generatePdfFile();
    if (pdf) {
        const blobUrl = pdf.output('bloburl');
        const printWindow = window.open(blobUrl);
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    }
}

/**
 * Share via WhatsApp - Save plan and show QR code for mobile access
 */
async function shareViaWhatsApp() {
    const patient = getPatientInfo();

    // Show loading toast
    if (typeof showToast === 'function') {
        showToast('Préparation du partage...', 'info');
    }

    // Save the plan and get the share URL
    if (window.saveAndGetShareUrl) {
        const result = await window.saveAndGetShareUrl();
        if (result.success) {
            // Show QR code modal with the view URL
            showShareQrModal('whatsapp', patient, result.url);
        } else {
            if (typeof showToast === 'function') {
                showToast('Erreur lors de la sauvegarde', 'error');
            }
        }
    } else {
        // Fallback if save function not available
        const currentUrl = window.location.href.split('?')[0];
        showShareQrModal('whatsapp', patient, currentUrl);
    }
}

/**
 * Share via Email - Launch native mail client
 */
async function shareViaEmail() {
    const patient = getPatientInfo();
    const subject = `Plan de Traitement - ${patient.prenom} ${patient.nom}`;
    const body = `Bonjour,

Veuillez trouver ci-joint le plan de traitement dentaire.

Patient: ${patient.prenom} ${patient.nom}
Date: ${patient.date}
Praticien: ${patient.praticien}

Cordialement,
${patient.praticien}`;

    // Download PDF first
    await downloadPdf();

    // Open native mail client with mailto
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    if (typeof showToast === 'function') {
        showToast('Client mail ouvert - Joignez le PDF téléchargé', 'info');
    }
}

/**
 * Show QR code modal for sharing
 * @param {string} shareType - Type of share (whatsapp)
 * @param {Object} patient - Patient info
 * @param {string} shareUrl - URL to share (view.html with document ID)
 */
function showShareQrModal(shareType, patient, shareUrl) {
    // Remove existing modal if any
    const existingModal = document.getElementById('shareQrModal');
    if (existingModal) existingModal.remove();

    const patientName = `${patient.prenom || ''} ${patient.nom || ''}`.trim() || 'Patient';
    const message = `Plan de Traitement Dentaire - ${patientName}\n\nConsultez le document :`;

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'shareQrModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-fadeIn';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <h3 class="text-xl font-bold text-white">Partager via WhatsApp</h3>
                    </div>
                    <button id="closeShareQrModal" class="text-white/80 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div class="text-center mb-4">
                    <p class="text-slate-600 mb-2">Scannez ce QR code avec votre téléphone pour accéder au plan de traitement</p>
                    <p class="text-xs text-slate-500 bg-slate-100 rounded-lg px-3 py-2 font-mono break-all">${shareUrl}</p>
                </div>
                <div class="flex justify-center mb-4">
                    <div id="shareQrCodeContainer" class="bg-white p-4 rounded-xl shadow-md border border-slate-200"></div>
                </div>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p class="text-sm text-green-800 font-medium mb-2">Instructions :</p>
                    <ol class="text-sm text-green-700 space-y-1 list-decimal list-inside">
                        <li>Scannez le QR code avec votre téléphone</li>
                        <li>Le plan de traitement s'ouvrira sur votre mobile</li>
                        <li>Partagez-le via WhatsApp depuis votre téléphone</li>
                    </ol>
                </div>
                <div class="flex gap-3">
                    <button id="copyShareLink" class="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copier le lien
                    </button>
                    <button id="openWhatsAppDirect" class="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Generate QR code with the share URL
    const qrContainer = document.getElementById('shareQrCodeContainer');

    if (qrContainer && window.QRCode) {
        new window.QRCode(qrContainer, {
            text: shareUrl,
            width: 200,
            height: 200,
            colorDark: '#25D366',
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel.M
        });
    }

    // Close modal handler
    document.getElementById('closeShareQrModal').addEventListener('click', () => {
        modal.remove();
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Copy link to clipboard
    document.getElementById('copyShareLink').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            if (typeof showToast === 'function') {
                showToast('Lien copié !', 'success');
            }
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            if (typeof showToast === 'function') {
                showToast('Lien copié !', 'success');
            }
        }
    });

    // Open WhatsApp with the share URL
    document.getElementById('openWhatsAppDirect').addEventListener('click', () => {
        const whatsappMessage = `${message}\n${shareUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
    });

    // ESC to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPdfGenerator);
