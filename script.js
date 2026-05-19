document.addEventListener('DOMContentLoaded', () => {
    // Robust HTML escaping utility to prevent DOM-based XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // DOM Elements - Form Inputs
    const inputs = {
        fullName: document.getElementById('fullName'),
        jobTitle: document.getElementById('jobTitle'),
        email: document.getElementById('email'),
        mobile: document.getElementById('mobile'),
        website: document.getElementById('website'),
        linkedin: document.getElementById('linkedin'),
        address: document.getElementById('address'),
        secondaryDescription: document.getElementById('secondaryDescription'),
        primaryLogoUrl: document.getElementById('primaryLogoUrl'),
        secondaryLogoUrl: document.getElementById('secondaryLogoUrl')
    };

    // DOM Elements - Preview Targets (All matching elements across templates)
    const preview = {
        fullName: document.querySelectorAll('.preview-full-name'),
        jobTitle: document.querySelectorAll('.preview-job-title'),
        email: document.querySelectorAll('.preview-email'),
        mobile: document.querySelectorAll('.preview-mobile'),
        website: document.querySelectorAll('.preview-website'),
        linkedin: document.querySelectorAll('.preview-linkedin'),
        address: document.querySelectorAll('.preview-address'),
        emailRow: document.querySelectorAll('.preview-email-row'),
        mobileRow: document.querySelectorAll('.preview-mobile-row'),
        websiteRow: document.querySelectorAll('.preview-website-row'),
        linkedinRow: document.querySelectorAll('.preview-linkedin-row'),
        addressRow: document.querySelectorAll('.preview-address-row'),
        secondaryDesc: document.querySelectorAll('.preview-secondary-desc'),
        secondaryDescRow: document.querySelectorAll('.preview-secondary-desc-row')
    };

    // DOM Elements - File Uploads Configurations
    const primaryLogo = {
        input: document.getElementById('primaryLogo'),
        container: document.getElementById('primaryLogoUpload'),
        preview: document.getElementById('primaryLogoPreview'),
        removeBtn: document.getElementById('removePrimaryLogo'),
        imgClass: 'preview-primary-logo-img',
        rowClass: 'preview-primary-logo-row'
    };

    const secondaryLogo = {
        input: document.getElementById('secondaryLogo'),
        container: document.getElementById('secondaryLogoUpload'),
        preview: document.getElementById('secondaryLogoPreview'),
        removeBtn: document.getElementById('removeSecondaryLogo'),
        imgClass: 'preview-secondary-logo-img',
        rowClass: 'preview-secondary-logo-row'
    };

    // DOM Elements - Action Buttons & Switcher
    const btnCopy = document.getElementById('btnCopy');
    const toastMessage = document.getElementById('toastMessage');
    const signatureWrapper = document.getElementById('signatureWrapper');
    const templateCards = document.querySelectorAll('.template-card');
    const signatureTemplates = document.querySelectorAll('.signature-template');

    // Sidebar sections and groups for dynamic layout-aware fading collapse
    const formSections = {
        personal: document.querySelector('.form-section:nth-of-type(1)'),
        contact: document.querySelector('.form-section:nth-of-type(2)'),
        branding: document.querySelector('.form-section:nth-of-type(3)'),
        primaryBrandingGroup: document.querySelector('.primary-branding-group'),
        secondaryBrandingGroup: document.querySelector('.secondary-branding-group')
    };

    let activeTemplate = '1';

    // Default Values (for initialization)
    const defaults = {
        fullName: 'John Doe',
        jobTitle: 'Software Engineer',
        email: 'john.doe@example.com',
        mobile: '+1 234 567 890',
        website: 'https://www.ayatacommerce.com/',
        linkedin: 'https://www.linkedin.com/company/ayatacommerce/',
        address: '123 Tech Street, City',
        secondaryDescription: 'This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed.',
        primaryLogoUrl: 'https://www.ayatacommerce.com',
        secondaryLogoUrl: 'https://ayatacommerce.com/press-release/ayatacommerce-receives-the-kings-award-for-enterprise-in-international-trade/'
    };

    // --- Live Update Logic ---

    // Generic function to update text fields across all dynamic preview classes
    function updateField(inputElement, previewElements, parentRowElements, prefix = '', suffix = '', isLink = false, linkPrefix = '') {
        const val = inputElement.value.trim();
        previewElements.forEach((previewElement, idx) => {
            const parentRowElement = parentRowElements ? parentRowElements[idx] : null;
            if (val) {
                if (isLink) {
                    previewElement.textContent = val;
                    previewElement.href = linkPrefix + val;
                } else {
                    previewElement.textContent = prefix + val + suffix;
                }
                if (parentRowElement) parentRowElement.style.display = ''; // show row
            } else {
                if (parentRowElement) parentRowElement.style.display = 'none'; // hide row
                previewElement.textContent = '';
            }
        });
    }

    // Attach listeners to all form controls
    function setupInputListeners() {
        inputs.fullName.addEventListener('input', () => updateField(inputs.fullName, preview.fullName, null));
        inputs.jobTitle.addEventListener('input', () => updateField(inputs.jobTitle, preview.jobTitle, null));

        inputs.email.addEventListener('input', () => {
            updateField(inputs.email, preview.email, preview.emailRow, '', '', true, 'mailto:');
        });

        inputs.mobile.addEventListener('input', () => updateField(inputs.mobile, preview.mobile, preview.mobileRow));

        inputs.website.addEventListener('input', () => {
            let val = inputs.website.value.trim();
            let href = val;
            if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                href = 'https://' + val;
            }
            const displayVal = val.replace(/^https?:\/\//, '').replace(/\/$/, '');
            preview.website.forEach((el, idx) => {
                const row = preview.websiteRow[idx];
                if (val) {
                    el.textContent = displayVal;
                    el.href = href;
                    if (row) row.style.display = '';
                } else {
                    if (row) row.style.display = 'none';
                }
            });
        });

        inputs.linkedin.addEventListener('input', () => {
            let val = inputs.linkedin.value.trim();
            let href = val;
            if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                href = 'https://' + val;
            }
            preview.linkedin.forEach((el, idx) => {
                const row = preview.linkedinRow[idx];
                if (val) {
                    el.textContent = 'Follow us on LinkedIn';
                    el.href = href;
                    if (row) row.style.display = '';
                } else {
                    if (row) row.style.display = 'none';
                }
            });
        });

        inputs.address.addEventListener('input', () => updateField(inputs.address, preview.address, preview.addressRow));

        inputs.secondaryDescription.addEventListener('input', () => {
            const val = inputs.secondaryDescription.value;
            preview.secondaryDesc.forEach((el, idx) => {
                const row = preview.secondaryDescRow[idx];
                if (val.trim()) {
                    el.innerHTML = escapeHTML(val).replace(/\n/g, '<br>');
                    if (row) row.style.display = '';
                } else {
                    if (row) row.style.display = 'none';
                    el.innerHTML = '';
                }
            });
        });

        inputs.primaryLogoUrl.addEventListener('input', () => {
            let val = inputs.primaryLogoUrl.value.trim();
            if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                val = 'https://' + val;
            }
            const links = document.querySelectorAll('.preview-primary-logo-link');
            links.forEach(link => {
                link.href = val || 'https://www.example.com';
            });
        });

        inputs.secondaryLogoUrl.addEventListener('input', () => {
            let val = inputs.secondaryLogoUrl.value.trim();
            if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                val = 'https://' + val;
            }
            const links = document.querySelectorAll('.preview-secondary-logo-link');
            links.forEach(link => {
                link.href = val || 'https://www.example.com';
            });
        });
    }

    // --- Image Upload Logic ---

    function compressAndResizeImage(file, maxDimension, callback) {
        if (!file || !file.type.match('image.*')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale proportionally if width/height exceed maxDimension
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Use PNG to preserve transparency
                const compressedBase64 = canvas.toDataURL('image/png');
                callback(compressedBase64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function handleImageUpload(file, configObject) {
        if (!file || !file.type.match('image.*')) return;

        // Downscale to max 300px for high-dpi email client retina displays
        compressAndResizeImage(file, 300, (compressedBase64) => {
            // Update UI in Editor
            configObject.preview.src = compressedBase64;
            configObject.container.classList.add('has-image');

            // Update UI in Live Preview Signature (all tables)
            const targetImgs = document.querySelectorAll('.' + configObject.imgClass);
            const targetRows = document.querySelectorAll('.' + configObject.rowClass);

            targetImgs.forEach(img => img.src = compressedBase64);
            targetRows.forEach(row => row.style.display = '');
        });
    }

    function removeImage(configObject) {
        configObject.input.value = ''; // clear input
        configObject.preview.src = '';
        configObject.container.classList.remove('has-image');

        const targetImgs = document.querySelectorAll('.' + configObject.imgClass);
        const targetRows = document.querySelectorAll('.' + configObject.rowClass);

        targetImgs.forEach(img => img.src = '');
        targetRows.forEach(row => row.style.display = 'none');
    }

    function setupDragAndDrop(configObject) {
        const dropZone = configObject.container;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                configObject.input.files = files; // Assign files to input
                handleImageUpload(files[0], configObject);
            }
        }, false);

        // Click to upload
        configObject.input.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                handleImageUpload(this.files[0], configObject);
            }
        });

        // Remove button
        configObject.removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // prevent clicking the upload zone
            removeImage(configObject);
        });
    }

    // --- Template Switching Controller ---

    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const templateId = card.getAttribute('data-template');
            activeTemplate = templateId;

            // 1. Update Switcher active cards styling
            templateCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // 2. Toggle active table in live rendering panel
            signatureTemplates.forEach(template => {
                if (template.id === `signatureTemplate${templateId}`) {
                    template.style.display = '';
                } else {
                    template.style.display = 'none';
                }
            });

            // 3. Dynamic layout-aware sidebar section fading collapse
            if (templateId === '1') {
                formSections.contact.classList.remove('disabled-section');
                formSections.branding.classList.remove('disabled-section');
                formSections.primaryBrandingGroup.classList.remove('disabled-section');
                formSections.secondaryBrandingGroup.classList.remove('disabled-section');
            } else if (templateId === '2') {
                formSections.contact.classList.remove('disabled-section');
                formSections.branding.classList.remove('disabled-section');
                formSections.primaryBrandingGroup.classList.remove('disabled-section');
                formSections.secondaryBrandingGroup.classList.add('disabled-section');
            } else if (templateId === '3') {
                formSections.contact.classList.add('disabled-section');
                formSections.branding.classList.add('disabled-section');
            }
        });
    });

    // --- Action Buttons ---

    function showToast(message) {
        toastMessage.textContent = message;
        toastMessage.classList.add('show');
        setTimeout(() => {
            toastMessage.classList.remove('show');
        }, 3000);
    }

    // Clean active signature table template layout for clip packaging
    function getCleanActiveSignatureHTML() {
        const activeTable = document.getElementById(`signatureTemplate${activeTemplate}`);
        let signatureHTML = activeTable.outerHTML;

        // Strip template-specific wrapper classes/IDs and hidden style rules
        signatureHTML = signatureHTML.replace(/style="[^"]*display:\s*none;?[^"]*"/gi, '');
        signatureHTML = signatureHTML.replace(/id="signatureTemplate\d"/gi, '');
        signatureHTML = signatureHTML.replace(/class="signature-template"/gi, '');

        return signatureHTML;
    }

    btnCopy.addEventListener('click', () => {
        const signatureHTML = getCleanActiveSignatureHTML();
        const activeTable = document.getElementById(`signatureTemplate${activeTemplate}`);

        if (navigator.clipboard && window.ClipboardItem) {
            const blobHtml = new Blob([signatureHTML], { type: 'text/html' });
            const blobText = new Blob([activeTable.innerText], { type: 'text/plain' });

            const data = [new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            })];

            navigator.clipboard.write(data).then(() => {
                showToast('Signature copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                fallbackCopy(signatureHTML);
            });
        } else {
            fallbackCopy(signatureHTML);
        }
    });

    function fallbackCopy(htmlStr) {
        const el = document.createElement('div');
        el.innerHTML = htmlStr;
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            document.execCommand('copy');
            showToast('Signature copied to clipboard!');
        } catch (err) {
            console.error('Fallback copy failed', err);
            alert('Failed to copy signature. Please try downloading instead.');
        }

        selection.removeAllRanges();
        document.body.removeChild(el);
    }



    async function preloadLogo(url, configObject) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], url.split('/').pop(), { type: blob.type });
            handleImageUpload(file, configObject);
        } catch (e) {
            console.warn('Could not preload logo:', url, e);
        }
    }

    // --- Initialize ---
    setupInputListeners();
    setupDragAndDrop(primaryLogo);
    setupDragAndDrop(secondaryLogo);

    // Trigger initial update to render default values correctly
    for (let key in inputs) {
        inputs[key].dispatchEvent(new Event('input'));
    }

    // Trigger logo URL inputs so pre-filled hrefs are applied
    inputs.primaryLogoUrl.dispatchEvent(new Event('input'));
    inputs.secondaryLogoUrl.dispatchEvent(new Event('input'));

    // Pre-load default logos
    preloadLogo('public/ayata-logo-2color.png', primaryLogo);
    preloadLogo('public/KingsAward-logo.jpg', secondaryLogo);
});
