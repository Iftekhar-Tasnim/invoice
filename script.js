// Initialize the invoice system
document.addEventListener('DOMContentLoaded', function() {
    // Set default dates
    const today = new Date();
    const dueDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
    document.getElementById('invoiceDate').value = today.toISOString().split('T')[0];
    document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    
    // Generate default invoice number
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    document.getElementById('invoiceNumber').value = `INV-${year}${month}${day}-001`;
    
    // Set default currency to BDT
    document.getElementById('currency').value = '৳';
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Calculate initial totals
    calculateTotals();
    
    // Initialize first service item
    initializeFirstService();
    
    // Load saved data
    loadSavedFormData();
    
    // Trigger initial calculation after a short delay
    setTimeout(() => {
        calculateTotals();
    }, 100);
});

// Initialize first service item
function initializeFirstService() {
    const firstService = document.querySelector('.service-item');
    if (firstService) {
        const quantityInput = firstService.querySelector('.service-quantity');
        const rateInput = firstService.querySelector('.service-rate');
        
        quantityInput.addEventListener('input', function() {
            calculateServiceAmount(this);
            calculateTotals();
        });
        
        rateInput.addEventListener('input', function() {
            calculateServiceAmount(this);
            calculateTotals();
        });
        
        // Set initial amount
        if (quantityInput.value && rateInput.value) {
            calculateServiceAmount(quantityInput);
        }
        
        // Set initial amount display
        const currency = document.getElementById('currency').value;
        firstService.querySelector('.service-amount').value = `${currency}0.00`;
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Add service button
    document.getElementById('addServiceBtn').addEventListener('click', addService);
    
    // Preview button
    document.getElementById('previewBtn').addEventListener('click', previewInvoice);
    
    // Generate PDF button
    document.getElementById('generateBtn').addEventListener('click', generatePDF);
    
    // Print button
    document.getElementById('printBtn').addEventListener('click', printInvoice);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    
    // Close preview button
    document.getElementById('closePreview').addEventListener('click', closePreview);
    
    // Auto-calculate totals when service inputs change
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('service-quantity') || 
            e.target.classList.contains('service-rate')) {
            calculateServiceAmount(e.target);
            calculateTotals();
        }
    });
    
    // Tax rate change
    document.getElementById('taxRate').addEventListener('input', calculateTotals);
    
    // Currency change
    document.getElementById('currency').addEventListener('change', function() {
        updateCurrencyDisplay();
        calculateTotals();
    });
}

// Add a new service item
function addService() {
    const servicesContainer = document.getElementById('servicesContainer');
    const newService = document.createElement('div');
    newService.className = 'service-item';
    newService.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="service-description" placeholder="Service description" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="service-quantity" value="1" min="1" required>
            </div>
            <div class="form-group">
                <label>Rate ($)</label>
                <input type="number" class="service-rate" step="0.01" min="0" placeholder="0.00" required>
            </div>
            <div class="form-group">
                <label>Amount ($)</label>
                <input type="text" class="service-amount" readonly>
            </div>
            <button type="button" class="remove-service-btn" onclick="removeService(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    servicesContainer.appendChild(newService);
    
    // Add event listeners to new inputs
    const quantityInput = newService.querySelector('.service-quantity');
    const rateInput = newService.querySelector('.service-rate');
    
    quantityInput.addEventListener('input', function() {
        calculateServiceAmount(this);
        calculateTotals();
    });
    
    rateInput.addEventListener('input', function() {
        calculateServiceAmount(this);
        calculateTotals();
    });
}

// Remove a service item
function removeService(button) {
    const serviceItem = button.closest('.service-item');
    serviceItem.remove();
    calculateTotals();
}

// Calculate amount for a specific service
function calculateServiceAmount(input) {
    const serviceItem = input.closest('.service-item');
    const quantity = parseFloat(serviceItem.querySelector('.service-quantity').value) || 0;
    const rate = parseFloat(serviceItem.querySelector('.service-rate').value) || 0;
    const amount = quantity * rate;
    
    const currency = document.getElementById('currency').value;
    serviceItem.querySelector('.service-amount').value = `${currency}${amount.toFixed(2)}`;
}

// Calculate all totals
function calculateTotals() {
    const services = document.querySelectorAll('.service-item');
    let subtotal = 0;
    
    services.forEach(service => {
        const quantity = parseFloat(service.querySelector('.service-quantity').value) || 0;
        const rate = parseFloat(service.querySelector('.service-rate').value) || 0;
        subtotal += quantity * rate;
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    const currency = document.getElementById('currency').value;
    document.getElementById('subtotal').textContent = `${currency}${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `${currency}${taxAmount.toFixed(2)}`;
    document.getElementById('total').textContent = `${currency}${total.toFixed(2)}`;
}

// Update currency display
function updateCurrencyDisplay() {
    const currency = document.getElementById('currency').value;
    const services = document.querySelectorAll('.service-item');
    
    services.forEach(service => {
        const amount = service.querySelector('.service-amount').value;
        if (amount && amount !== '0.00') {
            const numericAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
            service.querySelector('.service-amount').value = `${currency}${numericAmount.toFixed(2)}`;
        }
    });
    
    calculateTotals();
}

// Preview the invoice
function previewInvoice() {
    const invoiceContent = generateInvoiceHTML();
    document.getElementById('invoiceContent').innerHTML = invoiceContent;
    document.getElementById('invoicePreview').style.display = 'block';
    
    // Scroll to preview
    document.getElementById('invoicePreview').scrollIntoView({ behavior: 'smooth' });
}

// Close the preview
function closePreview() {
    document.getElementById('invoicePreview').style.display = 'none';
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        // Reset form fields
        document.getElementById('invoiceForm').reset();
        
        // Reset company information to defaults
        document.getElementById('companyName').value = 'Astronyvia';
        document.getElementById('companyWebsite').value = 'astronyvia.com';
        document.getElementById('companyAddress').value = 'ECB Chattar, Dhaka, Bangladesh';
        document.getElementById('companyPhone').value = '+880 1521104415';
        document.getElementById('companyEmail').value = 'contactus@astronyvia.com';
        document.getElementById('companyEmail2').value = 'info@astronyvia.com';
        
        // Set default dates
        const today = new Date();
        const dueDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.getElementById('invoiceDate').value = today.toISOString().split('T')[0];
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
        
        // Generate new invoice number
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        document.getElementById('invoiceNumber').value = `INV-${year}${month}${day}-001`;
        
        // Set default currency
        document.getElementById('currency').value = '৳';
        
        // Remove all service items except the first one
        const servicesContainer = document.getElementById('servicesContainer');
        const firstService = servicesContainer.querySelector('.service-item');
        servicesContainer.innerHTML = '';
        servicesContainer.appendChild(firstService);
        
        // Reset first service item
        firstService.querySelector('.service-description').value = '';
        firstService.querySelector('.service-quantity').value = '1';
        firstService.querySelector('.service-rate').value = '';
        firstService.querySelector('.service-amount').value = '';
        
        // Re-initialize first service item
        initializeFirstService();
        
        // Reset tax rate
        document.getElementById('taxRate').value = '0';
        
        // Reset notes
        document.getElementById('notes').value = '';
        
        // Clear client information
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('clientPhone').value = '';
        
        // Calculate totals
        calculateTotals();
        
        // Clear saved data
        localStorage.removeItem('invoiceFormData');
        
        showNotification('Form reset successfully!', 'success');
    }
}

// Generate invoice HTML
function generateInvoiceHTML() {
    const companyName = document.getElementById('companyName').value;
    const companyWebsite = document.getElementById('companyWebsite').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyEmail2 = document.getElementById('companyEmail2').value;
    
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('dueDate').value;
    
    const clientName = document.getElementById('clientName').value;
    const clientEmail = document.getElementById('clientEmail').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientPhone = document.getElementById('clientPhone').value;
    
    const notes = document.getElementById('notes').value;
    
    // Get services
    const services = [];
    document.querySelectorAll('.service-item').forEach(service => {
        const description = service.querySelector('.service-description').value;
        const quantity = service.querySelector('.service-quantity').value;
        const rate = service.querySelector('.service-rate').value;
        const amount = service.querySelector('.service-amount').value;
        
        if (description && quantity && rate) {
            services.push({ description, quantity, rate, amount });
        }
    });
    
    // Calculate totals
    const currency = document.getElementById('currency').value;
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace(/[^\d.-]/g, ''));
    const taxAmount = parseFloat(document.getElementById('taxAmount').textContent.replace(/[^\d.-]/g, ''));
    const total = parseFloat(document.getElementById('total').textContent.replace(/[^\d.-]/g, ''));
    
    // Format dates
    const formattedInvoiceDate = new Date(invoiceDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div class="invoice-header">
            <div class="company-info">
                <div class="company-logo">
                    <img src="asset/Astronyvia removebg.png" alt="${companyName}" class="invoice-logo">
                </div>
                <h2>${companyName}</h2>
                ${companyAddress ? `<p><i class="fas fa-map-marker-alt"></i> ${companyAddress}</p>` : ''}
                ${companyPhone ? `<p><i class="fas fa-phone"></i> ${companyPhone}</p>` : ''}
                ${companyEmail ? `<p><i class="fas fa-envelope"></i> ${companyEmail}</p>` : ''}
                ${companyEmail2 ? `<p><i class="fas fa-envelope"></i> ${companyEmail2}</p>` : ''}
                <p><i class="fas fa-globe"></i> ${companyWebsite}</p>
            </div>
            <div class="invoice-details">
                <h3>INVOICE</h3>
                <div class="invoice-meta">
                    <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                    <p><strong>Date:</strong> ${formattedInvoiceDate}</p>
                    <p><strong>Due Date:</strong> ${formattedDueDate}</p>
                    <p><strong>Status:</strong> <span class="status-pending">Pending</span></p>
                </div>
            </div>
        </div>
        
        <div class="client-info">
            <h3><i class="fas fa-user"></i> Bill To:</h3>
            <p class="client-name"><strong>${clientName}</strong></p>
            ${clientAddress ? `<p><i class="fas fa-map-marker-alt"></i> ${clientAddress}</p>` : ''}
            ${clientPhone ? `<p><i class="fas fa-phone"></i> ${clientPhone}</p>` : ''}
            ${clientEmail ? `<p><i class="fas fa-envelope"></i> ${clientEmail}</p>` : ''}
        </div>
        
        <table class="services-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th class="amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${services.map((service, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${service.description}</td>
                        <td>${service.quantity}</td>
                        <td>${currency}${parseFloat(service.rate).toFixed(2)}</td>
                        <td class="amount">${currency}${parseFloat(service.amount).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="invoice-summary">
            <div class="summary-item">
                <span>Subtotal:</span>
                <span>${currency}${subtotal.toFixed(2)}</span>
            </div>
            ${taxAmount > 0 ? `
                <div class="summary-item">
                    <span>Tax (${document.getElementById('taxRate').value}%):</span>
                    <span>${currency}${taxAmount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="summary-item total">
                <span>Total Amount:</span>
                <span>${currency}${total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="invoice-footer">
            ${notes ? `
                <div class="notes-section">
                    <h3><i class="fas fa-comment"></i> Notes & Terms:</h3>
                    <p>${notes}</p>
                </div>
            ` : ''}
            
            <div class="payment-info">
                <h3><i class="fas fa-credit-card"></i> Payment Information:</h3>
                <p><strong>Payment Terms:</strong> Net 30 days</p>
                <p><strong>Payment Method:</strong> Bank Transfer / Online Payment</p>
                <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            </div>
            
            <div class="thank-you">
                <p>Thank you for your business!</p>
                <p class="company-signature">${companyName}</p>
            </div>
        </div>
    `;
}

// Generate PDF
async function generatePDF() {
    try {
        // Show loading state
        const generateBtn = document.getElementById('generateBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        generateBtn.disabled = true;
        
        // Generate invoice HTML if preview is not visible
        if (document.getElementById('invoicePreview').style.display === 'none') {
            const invoiceContent = generateInvoiceHTML();
            document.getElementById('invoiceContent').innerHTML = invoiceContent;
        }
        
        // Wait a bit for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const element = document.getElementById('invoiceContent');
        
        // Use html2canvas to capture the invoice
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        
        // Convert to PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Generate filename
        const invoiceNumber = document.getElementById('invoiceNumber').value;
        const clientName = document.getElementById('clientName').value;
        const filename = `${invoiceNumber}_${clientName.replace(/\s+/g, '_')}.pdf`;
        
        // Download the PDF
        pdf.save(filename);
        
        // Reset button state
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
        // Show success message
        showNotification('PDF generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        
        // Reset button state
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

// Print invoice
function printInvoice() {
    // Generate invoice HTML if preview is not visible
    if (document.getElementById('invoicePreview').style.display === 'none') {
        const invoiceContent = generateInvoiceHTML();
        document.getElementById('invoiceContent').innerHTML = invoiceContent;
    }
    
    // Show preview for printing
    document.getElementById('invoicePreview').style.display = 'block';
    
    // Wait a bit for the DOM to update
    setTimeout(() => {
        window.print();
    }, 100);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Form validation
function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#e1e5e9';
        }
    });
    
    // Check if at least one service is added
    const services = document.querySelectorAll('.service-description');
    let hasService = false;
    
    services.forEach(service => {
        if (service.value.trim()) {
            hasService = true;
        }
    });
    
    if (!hasService) {
        showNotification('Please add at least one service item.', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Enhanced form validation for preview
document.getElementById('previewBtn').addEventListener('click', function(e) {
    if (!validateForm()) {
        e.preventDefault();
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    previewInvoice();
});

// Auto-save form data to localStorage
function autoSaveForm() {
    const formData = {
        companyName: document.getElementById('companyName').value,
        companyWebsite: document.getElementById('companyWebsite').value,
        companyAddress: document.getElementById('companyAddress').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyEmail: document.getElementById('companyEmail').value,
        companyEmail2: document.getElementById('companyEmail2').value,
        currency: document.getElementById('currency').value,
        clientName: document.getElementById('clientName').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientAddress: document.getElementById('clientAddress').value,
        clientPhone: document.getElementById('clientPhone').value,
        notes: document.getElementById('notes').value
    };
    
    localStorage.setItem('invoiceFormData', JSON.stringify(formData));
}

// Load saved form data
function loadSavedFormData() {
    const savedData = localStorage.getItem('invoiceFormData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = data[key];
                }
            });
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Add auto-save to form inputs
document.addEventListener('input', function(e) {
    if (e.target.id && !e.target.classList.contains('service-description') && 
        !e.target.classList.contains('service-quantity') && 
        !e.target.classList.contains('service-rate')) {
        autoSaveForm();
    }
});



// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (validateForm()) {
            previewInvoice();
        }
    }
    
    // Ctrl/Cmd + P to print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (validateForm()) {
            printInvoice();
        }
    }
    
    // Ctrl/Cmd + S to save (auto-save is already implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        autoSaveForm();
        showNotification('Form data saved!', 'success');
    }
});
