// Database setup
const db = new Dexie("ContactsApp");
db.version(1).stores({ 
    contacts: "++id, name, phone, email" 
});

// Global variables
let allContacts = [];
let currentContactId = null;

// DOM elements
const contactsList = document.getElementById('contactsList');
const searchInput = document.getElementById('searchInput');
const contactForm = document.getElementById('contactForm');
const emptyState = document.getElementById('emptyState');

// Bootstrap modal instances
let contactModal;
let contactDetailModal;

// Initialize modals when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    contactDetailModal = new bootstrap.Modal(document.getElementById('contactDetailModal'));
    loadContacts();
});

// Save contact function
async function saveContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    
    if (name && phone && email) {
        try {
            await db.contacts.add({ name, phone, email });
            await loadContacts();
            contactModal.hide();
            contactForm.reset();
            
            // Show success toast (optional)
            showToast('Contacto agregado exitosamente', 'success');
        } catch (error) {
            console.error('Error saving contact:', error);
            showToast('Error al guardar el contacto', 'error');
        }
    }
}

// Load all contacts
async function loadContacts() {
    try {
        allContacts = await db.contacts.orderBy('name').toArray();
        displayContacts(allContacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Display contacts
function displayContacts(contacts) {
    if (contacts.length === 0) {
        contactsList.innerHTML = `
            <div class="text-center p-5" id="emptyState">
                <i class="bi bi-person-plus-fill display-1 text-muted mb-3"></i>
                <h4 class="text-muted mb-2">No hay contactos aún</h4>
                <p class="text-muted">Haz clic en "Añadir" para agregar tu primer contacto</p>
            </div>
        `;
        return;
    }

    const contactsHTML = contacts.map(contact => `
        <div class="contact-item border-bottom" onclick="showContactDetails(${contact.id})" style="cursor: pointer;">
            <!-- Desktop View -->
            <div class="d-none d-md-block">
                <div class="row g-0 p-3 align-items-center hover-bg">
                    <div class="col-4">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle me-3">
                                <i class="bi bi-person-fill text-white"></i>
                            </div>
                            <div>
                                <div class="fw-semibold text-dark">${contact.name}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="text-muted">
                            <i class="bi bi-telephone me-1"></i>
                            ${contact.phone}
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="text-primary">
                            <i class="bi bi-envelope me-1"></i>
                            ${contact.email}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mobile View -->
            <div class="d-md-none">
                <div class="p-3 hover-bg">
                    <div class="d-flex align-items-start">
                        <div class="avatar-circle me-3 flex-shrink-0">
                            <i class="bi bi-person-fill text-white"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-semibold text-dark mb-1">${contact.name}</div>
                            <div class="text-muted small mb-1">
                                <i class="bi bi-telephone me-1"></i>
                                ${contact.phone}
                            </div>
                            <div class="text-primary small">
                                <i class="bi bi-envelope me-1"></i>
                                ${contact.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    contactsList.innerHTML = contactsHTML;
}

// Search contacts
function searchContacts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayContacts(allContacts);
        return;
    }

    const filteredContacts = allContacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm)
    );

    displayContacts(filteredContacts);
}

// Show contact details
function showContactDetails(contactId) {
    const contact = allContacts.find(c => c.id === contactId);
    if (!contact) return;

    currentContactId = contactId;
    
    const detailsHTML = `
        <div class="text-center mb-4">
            <div class="avatar-circle-lg mx-auto mb-3">
                <i class="bi bi-person-fill text-white"></i>
            </div>
            <h4 class="mb-0">${contact.name}</h4>
        </div>
        
        <div class="contact-info">
            <div class="info-item mb-3 p-3 bg-light rounded">
                <div class="d-flex align-items-center">
                    <i class="bi bi-telephone-fill text-primary me-3"></i>
                    <div>
                        <div class="small text-muted">Teléfono</div>
                        <div class="fw-semibold">${contact.phone}</div>
                    </div>
                </div>
            </div>
            
            <div class="info-item mb-3 p-3 bg-light rounded">
                <div class="d-flex align-items-center">
                    <i class="bi bi-envelope-fill text-primary me-3"></i>
                    <div>
                        <div class="small text-muted">Correo electrónico</div>
                        <div class="fw-semibold">${contact.email}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('contactDetails').innerHTML = detailsHTML;
    contactDetailModal.show();
}

// Delete contact
async function deleteContact() {
    if (!currentContactId) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
        try {
            await db.contacts.delete(currentContactId);
            await loadContacts();
            contactDetailModal.hide();
            currentContactId = null;
            
            showToast('Contacto eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error deleting contact:', error);
            showToast('Error al eliminar el contacto', 'error');
        }
    }
}

// Show toast notification (optional enhancement)
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary';
    
    const toastHTML = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-body d-flex align-items-center">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Clear form when modal is hidden
document.getElementById('contactModal').addEventListener('hidden.bs.modal', function () {
    contactForm.reset();
});

// Reset current contact when detail modal is hidden
document.getElementById('contactDetailModal').addEventListener('hidden.bs.modal', function () {
    currentContactId = null;
});