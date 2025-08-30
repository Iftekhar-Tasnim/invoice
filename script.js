// Initialize the invoice system
document.addEventListener('DOMContentLoaded', function() {
    console.log('Invoice system initializing...');
    
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
        // Initialize all amount fields to 0.00
        const services = document.querySelectorAll('.service-item');
        const currency = document.getElementById('currency').value;
        services.forEach(service => {
            const amountInput = service.querySelector('.service-amount');
            if (amountInput) {
                amountInput.value = `${currency}0.00`;
            }
        });
        
        calculateTotals();
        console.log('Invoice system initialized successfully!');
        
        // Debug: Check form field visibility
        const inputs = document.querySelectorAll('input, textarea, select');
        console.log('Total form fields found:', inputs.length);
        inputs.forEach((input, index) => {
            const computedStyle = window.getComputedStyle(input);
            console.log(`Field ${index + 1} (${input.id || input.className}):`, {
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                borderColor: computedStyle.borderColor,
                visible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden'
            });
        });
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
        
        // Set initial amount display
        const currency = document.getElementById('currency').value;
        firstService.querySelector('.service-amount').value = `${currency}0.00`;
        
        // Calculate initial amount if both values are present
        if (quantityInput.value && rateInput.value) {
            calculateServiceAmount(quantityInput);
        }
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
    
    // Initialize amount fields on page load
    document.addEventListener('DOMContentLoaded', function() {
        const services = document.querySelectorAll('.service-item');
        const currency = document.getElementById('currency').value;
        services.forEach(service => {
            const amountInput = service.querySelector('.service-amount');
            if (amountInput) {
                amountInput.value = `${currency}0.00`;
            }
        });
    });
}

// Add a new service item
function addService() {
    const servicesContainer = document.getElementById('servicesContainer');
    const newService = document.createElement('div');
    newService.className = 'service-item';
    newService.innerHTML = `
        <div class="card bg-white shadow-lg mb-6 relative border border-gray-100">
            <div class="card-body p-6">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-semibold text-gray-700">Description</span>
                        </label>
                        <input type="text" class="service-description input input-bordered w-full h-12 text-base bg-white text-gray-800 border-gray-300 focus:border-purple-500 focus:ring-purple-500" placeholder="Service description" required />
                    </div>
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-semibold text-gray-700">Quantity</span>
                        </label>
                        <input type="number" class="service-quantity input input-bordered w-full h-12 text-base bg-white text-gray-800 border-gray-300 focus:border-purple-500 focus:ring-purple-500" value="1" min="1" required />
                    </div>
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-semibold text-gray-700">Rate</span>
                        </label>
                        <input type="number" class="service-rate input input-bordered w-full h-12 text-base bg-white text-gray-800 border-gray-300 focus:border-purple-500 focus:ring-purple-500" step="0.01" min="0" placeholder="0.00" required />
                    </div>
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-semibold text-gray-700">Amount</span>
                        </label>
                        <input type="text" class="service-amount input input-bordered w-full bg-gray-100 text-gray-600 h-12 border-gray-300" readonly />
                    </div>
                </div>
                <button type="button" class="remove-service-btn btn btn-circle btn-error btn-sm absolute top-2 right-2" onclick="removeService(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    servicesContainer.appendChild(newService);
    
    // Add event listeners to new inputs
    const quantityInput = newService.querySelector('.service-quantity');
    const rateInput = newService.querySelector('.service-rate');
    const amountInput = newService.querySelector('.service-amount');
    
    // Set initial amount to 0.00
    const currency = document.getElementById('currency').value;
    amountInput.value = `${currency}0.00`;
    
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
    const quantityInput = serviceItem.querySelector('.service-quantity');
    const rateInput = serviceItem.querySelector('.service-rate');
    const amountInput = serviceItem.querySelector('.service-amount');
    
    // Get values and validate them
    const quantity = parseFloat(quantityInput.value);
    const rate = parseFloat(rateInput.value);
    
    // Check if both values are valid numbers
    if (isNaN(quantity) || isNaN(rate) || quantity < 0 || rate < 0) {
        // If invalid, set amount to 0.00
        const currency = document.getElementById('currency').value;
        amountInput.value = `${currency}0.00`;
        return;
    }
    
    // Calculate amount
    const amount = quantity * rate;
    
    // Update amount field
    const currency = document.getElementById('currency').value;
    amountInput.value = `${currency}${amount.toFixed(2)}`;
}

// Calculate all totals
function calculateTotals() {
    const services = document.querySelectorAll('.service-item');
    let subtotal = 0;
    
    console.log('Calculating totals for', services.length, 'services');
    
    services.forEach(service => {
        const quantity = parseFloat(service.querySelector('.service-quantity').value);
        const rate = parseFloat(service.querySelector('.service-rate').value);
        
        // Only add to subtotal if both values are valid numbers
        if (!isNaN(quantity) && !isNaN(rate) && quantity >= 0 && rate >= 0) {
            subtotal += quantity * rate;
            console.log('Service:', quantity, 'x', rate, '=', quantity * rate);
        } else {
            console.log('Service: Invalid values - quantity:', quantity, 'rate:', rate);
        }
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    const currency = document.getElementById('currency').value;
    document.getElementById('subtotal').textContent = `${currency}${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `${currency}${taxAmount.toFixed(2)}`;
    document.getElementById('total').textContent = `${currency}${total.toFixed(2)}`;
    
    console.log('Totals calculated:', { subtotal, taxRate, taxAmount, total, currency });
}

// Update currency display
function updateCurrencyDisplay() {
    const currency = document.getElementById('currency').value;
    const services = document.querySelectorAll('.service-item');
    
    services.forEach(service => {
        const amount = service.querySelector('.service-amount').value;
        if (amount && amount !== '0.00') {
            const numericAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
            if (!isNaN(numericAmount)) {
                service.querySelector('.service-amount').value = `${currency}${numericAmount.toFixed(2)}`;
            } else {
                service.querySelector('.service-amount').value = `${currency}0.00`;
            }
        } else {
            service.querySelector('.service-amount').value = `${currency}0.00`;
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
        
        // Set default status
        document.getElementById('invoiceStatus').value = 'unpaid';
        
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
    const invoiceStatus = document.getElementById('invoiceStatus').value;
    
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
        <div class="flex justify-between items-start mb-10 pb-8 border-b-2 border-gray-200">
            <div class="company-info">
                <div class="mb-4 text-left">
                    <img src="asset/Astronyvia removebg.png" alt="${companyName}" class="w-20 h-20 object-contain rounded-lg shadow-lg">
                </div>
                <h2 class="text-4xl font-bold text-primary-600 mb-3 relative">
                    ${companyName}
                    <div class="absolute bottom-0 left-0 w-15 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                </h2>
                ${companyAddress ? `<p class="text-gray-600 mb-2"><i class="fas fa-map-marker-alt text-primary-500 mr-2"></i>${companyAddress}</p>` : ''}
                ${companyPhone ? `<p class="text-gray-600 mb-2"><i class="fas fa-phone text-primary-500 mr-2"></i>${companyPhone}</p>` : ''}
                ${companyEmail ? `<p class="text-gray-600 mb-2"><i class="fas fa-envelope text-primary-500 mr-2"></i>${companyEmail}</p>` : ''}
                ${companyEmail2 ? `<p class="text-gray-600 mb-2"><i class="fas fa-envelope text-primary-500 mr-2"></i>${companyEmail2}</p>` : ''}
                <p class="text-gray-600"><i class="fas fa-globe text-primary-500 mr-2"></i>${companyWebsite}</p>
            </div>
            <div class="text-right">
                <h3 class="text-2xl font-bold text-center p-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg mb-5">INVOICE</h3>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p class="mb-2 text-gray-700"><strong>Invoice #:</strong> ${invoiceNumber}</p>
                    <p class="mb-2 text-gray-700"><strong>Date:</strong> ${formattedInvoiceDate}</p>
                    <p class="mb-2 text-gray-700"><strong>Due Date:</strong> ${formattedDueDate}</p>
                    <p class="mb-0 text-gray-700"><strong>Status:</strong> <span class="${invoiceStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-3 py-1 rounded-full text-xs font-semibold uppercase">${invoiceStatus === 'paid' ? 'PAID' : 'UNPAID'}</span></p>
                </div>
            </div>
        </div>
        
        <div class="mb-10 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 border-l-4 border-primary-500">
            <h3 class="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <i class="fas fa-user text-primary-500"></i> Bill To:
            </h3>
            <p class="text-xl text-gray-800 mb-4 font-semibold"><strong>${clientName}</strong></p>
            ${clientAddress ? `<p class="text-gray-600 mb-2"><i class="fas fa-map-marker-alt text-primary-500 mr-2"></i>${clientAddress}</p>` : ''}
            ${clientPhone ? `<p class="text-gray-600 mb-2"><i class="fas fa-phone text-primary-500 mr-2"></i>${clientPhone}</p>` : ''}
            ${clientEmail ? `<p class="text-gray-600 mb-2"><i class="fas fa-envelope text-primary-500 mr-2"></i>${clientEmail}</p>` : ''}
        </div>
        
        <table class="w-full border-collapse mb-8 border border-gray-300">
            <thead>
                <tr>
                    <th class="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-800 text-sm p-4 border-b-2 border-primary-500 text-left w-12">#</th>
                    <th class="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-800 text-sm p-4 border-b-2 border-primary-500 text-left w-2/5">Description</th>
                    <th class="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-800 text-sm p-4 border-b-2 border-primary-500 text-left w-1/6">Quantity</th>
                    <th class="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-800 text-sm p-4 border-b-2 border-primary-500 text-left w-1/6">Rate</th>
                    <th class="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-800 text-sm p-4 border-b-2 border-primary-500 text-right w-1/5">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${services.map((service, index) => `
                    <tr class="border-b border-gray-200">
                        <td class="p-4 text-gray-700 text-center">${index + 1}</td>
                        <td class="p-4 text-gray-700">${service.description}</td>
                        <td class="p-4 text-gray-700">${service.quantity}</td>
                        <td class="p-4 text-gray-700">${currency}${parseFloat(service.rate).toFixed(2)}</td>
                        <td class="p-4 text-gray-700 text-right font-semibold">${currency}${parseFloat(service.amount).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="text-right mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div class="flex justify-between items-center py-2 border-b border-gray-200 text-lg">
                <span>Subtotal:</span>
                <span class="font-semibold">${currency}${subtotal.toFixed(2)}</span>
            </div>
            ${taxAmount > 0 ? `
                <div class="flex justify-between items-center py-2 border-b border-gray-200 text-lg">
                    <span>Tax (${document.getElementById('taxRate').value}%):</span>
                    <span class="font-semibold">${currency}${taxAmount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="flex justify-between items-center py-4 text-2xl font-bold text-primary-600 border-t-2 border-primary-500 pt-4 mt-2">
                <span>Total Amount:</span>
                <span class="font-bold">${currency}${total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="mt-10 pt-8 border-t-2 border-gray-200">
            ${notes ? `
                <div class="mb-8 pt-6 border-t border-gray-200">
                    <h3 class="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <i class="fas fa-comment text-primary-500"></i> Notes & Terms:
                    </h3>
                    <p class="text-gray-600 leading-relaxed">${notes}</p>
                </div>
            ` : ''}
            
            <div class="mb-8 p-6 bg-gray-50 rounded-2xl border-l-4 border-green-500">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <i class="fas fa-credit-card text-green-500"></i> Payment Information:
                </h3>
                <p class="text-gray-600 mb-2"><strong>Payment Terms:</strong> Net 30 days</p>
                <p class="text-gray-600 mb-2"><strong>Payment Method:</strong> Bank Transfer / Online Payment</p>
                <p class="text-gray-600 mb-0"><strong>Due Date:</strong> ${formattedDueDate}</p>
            </div>
            
            <div class="text-center p-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl">
                <p class="text-lg mb-2">Thank you for your business!</p>
                <p class="text-2xl font-bold mt-4">${companyName}</p>
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
            field.style.borderColor = '#d1d5db';
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
        invoiceStatus: document.getElementById('invoiceStatus').value,
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

// Validate and format numeric inputs
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('service-quantity') || e.target.classList.contains('service-rate')) {
        const value = e.target.value;
        
        // Remove any non-numeric characters except decimal point
        const cleanValue = value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            e.target.value = parts[0] + '.' + parts.slice(1).join('');
        } else {
            e.target.value = cleanValue;
        }
        
        // Prevent negative values
        if (parseFloat(e.target.value) < 0) {
            e.target.value = '0';
        }
        
        // If input is empty or invalid, set amount to 0.00
        if (!e.target.value || isNaN(parseFloat(e.target.value))) {
            const serviceItem = e.target.closest('.service-item');
            const amountInput = serviceItem.querySelector('.service-amount');
            const currency = document.getElementById('currency').value;
            amountInput.value = `${currency}0.00`;
        }
    }
});



// Test form styling function
function testFormStyling() {
    console.log('Testing form styling...');
    const inputs = document.querySelectorAll('input, textarea, select');
    let issues = 0;
    
    inputs.forEach((input, index) => {
        const computedStyle = window.getComputedStyle(input);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        
        // Check if fields are visible and properly styled
        if (bgColor.includes('rgb(0, 0, 0)') || bgColor.includes('rgba(0, 0, 0)')) {
            console.warn(`Field ${index + 1} has black background:`, input.id || input.className);
            issues++;
        }
        
        if (textColor.includes('rgb(255, 255, 255)') || textColor.includes('rgba(255, 255, 255)')) {
            console.warn(`Field ${index + 1} has white text:`, input.id || input.className);
            issues++;
        }
    });
    
    if (issues === 0) {
        console.log('✅ All form fields are properly styled!');
    } else {
        console.warn(`⚠️ Found ${issues} styling issues`);
    }
}

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
    
    // Ctrl/Cmd + T to test styling
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        testFormStyling();
    }
});
