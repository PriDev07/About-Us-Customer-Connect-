// Import Firebase services
import { 
    database, 
    auth, 
    ref, 
    push, 
    set, 
    get, 
    remove, 
    onValue, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from './firebase-config.js';

// Application Data - this will be replaced by Firebase data
let customers = [];
let currentUser = null;

// Firebase Database Functions
async function loadCustomersFromFirebase() {
    try {
        const customersRef = ref(database, 'customers');
        const snapshot = await get(customersRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            customers = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } else {
            customers = [];
            // Initialize with some sample data if database is empty
            await initializeSampleData();
        }
        
        console.log('Customers loaded from Firebase:', customers.length);
        return customers;
    } catch (error) {
        console.error('Error loading customers from Firebase:', error);
        customers = [];
        return customers;
    }
}

async function initializeSampleData() {
    const sampleCustomers = [
        {
            name: "Rajesh Kumar",
            mobile: "9876543210",
            age: 35,
            address: "123 Civil Lines",
            city: "Jabalpur",
            dateOfBirth: "1989-03-15",
            anniversary: "2015-02-14",
            rating: 5,
            notes: "",
            dateAdded: "2023-01-10"
        },
        {
            name: "Priya Sharma",
            mobile: "9876543211",
            age: 28,
            address: "456 Sadar Bazaar",
            city: "Mandla", 
            dateOfBirth: "1996-07-22",
            anniversary: "2020-12-05",
            rating: 4,
            notes: "",
            dateAdded: "2023-02-01"
        },
        {
            name: "Amit Patel",
            mobile: "9876543212",
            age: 42,
            address: "789 Station Road",
            city: "Katni",
            dateOfBirth: "1982-11-08",
            anniversary: "2010-06-20",
            rating: 3,
            notes: "",
            dateAdded: "2023-03-15"
        }
    ];

    for (const customer of sampleCustomers) {
        await addCustomerToFirebase(customer);
    }
}

async function addCustomerToFirebase(customerData) {
    try {
        const customersRef = ref(database, 'customers');
        const newCustomerRef = push(customersRef);
        await set(newCustomerRef, customerData);
        return newCustomerRef.key;
    } catch (error) {
        console.error('Error adding customer to Firebase:', error);
        throw error;
    }
}

async function updateCustomerInFirebase(customerId, customerData) {
    try {
        const customerRef = ref(database, `customers/${customerId}`);
        await set(customerRef, customerData);
    } catch (error) {
        console.error('Error updating customer in Firebase:', error);
        throw error;
    }
}

async function deleteCustomerFromFirebase(customerId) {
    try {
        const customerRef = ref(database, `customers/${customerId}`);
        await remove(customerRef);
    } catch (error) {
        console.error('Error deleting customer from Firebase:', error);
        throw error;
    }
}

// Listen for real-time updates to customers
function setupCustomersListener() {
    const customersRef = ref(database, 'customers');
    onValue(customersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            customers = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } else {
            customers = [];
        }
        
        // Update UI if we're on a screen that shows customers
        if (currentScreen === 'customer-list-screen') {
            displayCustomers();
        } else if (currentScreen === 'home-screen') {
            updateDashboardStats();
        }
    });
}

// Cities list
const cities = [
    "Jabalpur",
    "Mandla", 
    "Katni",
    "Gotegaon",
    "Narsinghpur",
    "Kareli",
    "Pipariya",
    "Gadarwara",
    "Shahpura",
    "Other"
];

// Application State
let currentScreen = 'login-screen';
let currentCustomerId = null;
let navigationHistory = [];
let customerToDelete = null;

// Make functions globally accessible
window.handleLogin = handleLogin;
window.logout = logout;
window.showHomeScreen = showHomeScreen;
window.showAddCustomerScreen = showAddCustomerScreen;
window.showCustomerListScreen = showCustomerListScreen;
window.showCustomerDetailScreen = showCustomerDetailScreen;
window.showEditCustomerScreen = showEditCustomerScreen;
window.showExportScreen = showExportScreen;
window.goBack = goBack;
window.editCurrentCustomer = editCurrentCustomer;
window.cancelEdit = cancelEdit;
window.toggleOtherCityInput = toggleOtherCityInput;
window.confirmDeleteCustomer = confirmDeleteCustomer;
window.closeDeleteModal = closeDeleteModal;
window.deleteCustomer = deleteCustomer;
window.exportToCSV = exportToCSV;
window.exportToExcel = exportToExcel;
window.sendSMSPromo = sendSMSPromo;
window.sendWhatsAppPromo = sendWhatsAppPromo;
window.showSmsSuggestionScreen = showSmsSuggestionScreen;
window.generateMarketingSMS = generateMarketingSMS;
window.copySmsToClipboard = copySmsToClipboard;
window.sendSuggestedSMS = sendSuggestedSMS;

// Login Functionality - Updated for Firebase Auth
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    console.log('Username:', username, 'Password:', password);
    
    // For demo purposes, we'll allow any username/password, but you can implement real auth
    if (username && password) {
        try {
            // Try Firebase authentication first (if you have users set up)
            // For now, we'll simulate successful login and load data
            currentUser = { email: username };
            
            // Load customers from Firebase
            await loadCustomersFromFirebase();
            
            // Setup real-time listener
            setupCustomersListener();
            
            console.log('Login successful');
            showHomeScreen();
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    } else {
        alert('Please enter both username and password');
    }
}

async function logout() {
    console.log('Logging out');
    try {
        // Sign out from Firebase if using authentication
        // await signOut(auth);
        currentUser = null;
        customers = [];
        
        showScreen('login-screen');
        document.getElementById('login-form').reset();
        navigationHistory = [];
        currentCustomerId = null;
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Utility Functions
function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
    }
}

function goBack() {
    console.log('Going back');
    if (navigationHistory.length > 0) {
        const previousScreen = navigationHistory.pop();
        showScreen(previousScreen);
    } else {
        showHomeScreen();
    }
}

function addToHistory(screenId) {
    if (currentScreen && currentScreen !== screenId) {
        navigationHistory.push(currentScreen);
    }
}

// Screen Navigation Functions
function showHomeScreen() {
    console.log('Showing home screen');
    showScreen('home-screen');
    updateDashboardStats();
    navigationHistory = [];
}

function showAddCustomerScreen() {
    console.log('Showing add customer screen');
    addToHistory(currentScreen);
    showScreen('add-customer-screen');
    resetAddForm();
}

function showCustomerListScreen() {
    console.log('Showing customer list screen');
    addToHistory(currentScreen);
    showScreen('customer-list-screen');
    populateFilterOptions();
    displayCustomers();
}

function showCustomerDetailScreen(customerId) {
    console.log('Showing customer detail screen for ID:', customerId);
    addToHistory(currentScreen);
    currentCustomerId = customerId;
    showScreen('customer-detail-screen');
    displayCustomerDetails(customerId);
}

function showEditCustomerScreen(customerId) {
    console.log('Showing edit customer screen for ID:', customerId);
    addToHistory(currentScreen);
    currentCustomerId = customerId;
    showScreen('edit-customer-screen');
    populateEditForm(customerId);
}

function showExportScreen() {
    console.log('Showing export screen');
    addToHistory(currentScreen);
    showScreen('export-screen');
}

function showSmsSuggestionScreen() {
    console.log('Showing SMS Suggestion screen');
    addToHistory(currentScreen);
    showScreen('sms-suggestion-screen');
    populateSmsCustomerSelect();
    document.getElementById('sms-suggestion-output').value = '';
}

function editCurrentCustomer() {
    if (currentCustomerId) {
        showEditCustomerScreen(currentCustomerId);
    }
}

function cancelEdit() {
    showCustomerDetailScreen(currentCustomerId);
}

// City Selection Functions
function toggleOtherCityInput(prefix) {
    console.log('Toggling other city input for:', prefix);
    const citySelect = document.getElementById(`${prefix}-city`);
    const otherCityContainer = document.getElementById(`${prefix}-other-city-container`);
    const otherCityInput = document.getElementById(`${prefix}-other-city`);
    
    if (citySelect && otherCityContainer && otherCityInput) {
        if (citySelect.value === 'Other') {
            otherCityContainer.style.display = 'block';
            otherCityInput.required = true;
            otherCityInput.focus();
        } else {
            otherCityContainer.style.display = 'none';
            otherCityInput.required = false;
            otherCityInput.value = '';
        }
    }
}

function getCityValue(prefix) {
    const citySelect = document.getElementById(`${prefix}-city`);
    const otherCityInput = document.getElementById(`${prefix}-other-city`);
    
    if (citySelect && citySelect.value === 'Other' && otherCityInput) {
        return otherCityInput.value.trim();
    }
    return citySelect ? citySelect.value : '';
}

function setCityValue(prefix, cityValue) {
    const citySelect = document.getElementById(`${prefix}-city`);
    const otherCityContainer = document.getElementById(`${prefix}-other-city-container`);
    const otherCityInput = document.getElementById(`${prefix}-other-city`);
    
    if (!citySelect || !otherCityContainer || !otherCityInput) return;
    
    if (cities.includes(cityValue)) {
        citySelect.value = cityValue;
        otherCityContainer.style.display = 'none';
        otherCityInput.required = false;
    } else if (cityValue) {
        citySelect.value = 'Other';
        otherCityInput.value = cityValue;
        otherCityContainer.style.display = 'block';
        otherCityInput.required = true;
    } else {
        citySelect.value = '';
        otherCityContainer.style.display = 'none';
        otherCityInput.required = false;
    }
}

// Delete Customer Functions
function confirmDeleteCustomer(customerId = null) {
    const targetCustomerId = customerId || currentCustomerId;
    const customer = customers.find(c => c.id === targetCustomerId);
    
    if (!customer) return;
    
    customerToDelete = targetCustomerId;
    const confirmationText = document.getElementById('delete-confirmation-text');
    if (confirmationText) {
        confirmationText.textContent = `Are you sure you want to delete "${customer.name}"?`;
    }
    
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    customerToDelete = null;
}

async function deleteCustomer() {
    if (!customerToDelete) return;
    
    try {
        const customer = customers.find(c => c.id === customerToDelete);
        if (customer) {
            await deleteCustomerFromFirebase(customerToDelete);
            showSuccessMessage(`${customer.name} has been deleted successfully!`);
            closeDeleteModal();
            
            // Navigate back to customer list
            setTimeout(() => {
                showCustomerListScreen();
                updateDashboardStats();
            }, 1500);
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. Please try again.');
        closeDeleteModal();
    }
}

// Dashboard Stats
function updateDashboardStats() {
    const totalCustomers = customers.length;
    const avgRating = customers.length > 0 ? 
        (customers.reduce((sum, customer) => sum + customer.rating, 0) / customers.length).toFixed(1) : 0;
    
    const currentMonth = new Date().getMonth();
    const birthdaysThisMonth = customers.filter(customer => {
        if (customer.dateOfBirth) {
            const birthMonth = new Date(customer.dateOfBirth).getMonth();
            return birthMonth === currentMonth;
        }
        return false;
    }).length;

    const today = new Date();
    const customersAddedToday = customers.filter(customer => {
        const customerDate = new Date(customer.dateAdded);
        return customerDate.getDate() === today.getDate() &&
               customerDate.getMonth() === today.getMonth() &&
               customerDate.getFullYear() === today.getFullYear();
    }).length;
    
    const totalElement = document.getElementById('total-customers');
    const avgElement = document.getElementById('avg-rating');
    const birthdaysElement = document.getElementById('birthdays-this-month');
    const customersAddedTodayElement = document.getElementById('customers-added-today');
    
    if (totalElement) totalElement.textContent = totalCustomers;
    if (avgElement) avgElement.textContent = avgRating;
    if (birthdaysElement) birthdaysElement.textContent = birthdaysThisMonth;
    if (customersAddedTodayElement) customersAddedTodayElement.textContent = customersAddedToday;
}

// Form Initialization
function initializeForms() {
    // Populate city dropdowns
    const citySelects = ['add-city', 'edit-city'];
    citySelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            // Clear existing options except the first one
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                select.appendChild(option);
            });
        }
    });
    
    // Initialize star ratings
    initializeStarRating('add-rating', 'add-rating-value');
    initializeStarRating('edit-rating', 'edit-rating-value');
    
    // Initialize add customer form
    const addForm = document.getElementById('add-customer-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddCustomer);
    }
    
    // Initialize edit customer form
    const editForm = document.getElementById('edit-customer-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditCustomer);
    }
}

function initializeStarRating(containerId, valueInputId) {
    const container = document.getElementById(containerId);
    const valueInput = document.getElementById(valueInputId);
    
    if (!container || !valueInput) return;
    
    const stars = container.querySelectorAll('.star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            valueInput.value = rating;
            updateStarDisplay(container, rating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            updateStarDisplay(container, rating);
        });
    });
    
    container.addEventListener('mouseleave', function() {
        const currentRating = parseInt(valueInput.value) || 0;
        updateStarDisplay(container, currentRating);
    });
}

function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Customer CRUD Operations
async function handleAddCustomer(e) {
    e.preventDefault();
    
    const formData = getCustomerFormData('add');
    if (validateCustomerForm(formData, 'add')) {
        try {
            const newCustomer = {
                ...formData,
                dateAdded: new Date().toISOString().slice(0, 10)
            };
            
            await addCustomerToFirebase(newCustomer);
            showSuccessMessage('Customer added successfully!');
            setTimeout(() => showCustomerListScreen(), 1500);
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Failed to add customer. Please try again.');
        }
    }
}

async function handleEditCustomer(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('edit-customer-id').value;
    const formData = getCustomerFormData('edit');
    
    if (validateCustomerForm(formData, 'edit', customerId)) {
        try {
            await updateCustomerInFirebase(customerId, formData);
            showSuccessMessage('Customer updated successfully!');
            setTimeout(() => showCustomerDetailScreen(customerId), 1500);
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('Failed to update customer. Please try again.');
        }
    }
}

function getCustomerFormData(prefix) {
    return {
        name: document.getElementById(`${prefix}-name`).value.trim(),
        mobile: document.getElementById(`${prefix}-mobile`).value.trim(),
        age: parseInt(document.getElementById(`${prefix}-age`).value) || null,
        address: document.getElementById(`${prefix}-address`).value.trim(),
        city: getCityValue(prefix),
        dateOfBirth: document.getElementById(`${prefix}-dob`).value || null,
        anniversary: document.getElementById(`${prefix}-anniversary`).value || null,
        rating: parseInt(document.getElementById(`${prefix}-rating-value`).value) || 0,
        notes: document.getElementById(`${prefix}-notes`).value.trim()
    };
}

function validateCustomerForm(data, prefix, excludeId = null) {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });
    
    // Name validation
    if (!data.name) {
        showFieldError(`${prefix}-name-error`, 'Name is required');
        isValid = false;
    }
    
    // Mobile validation
    if (!data.mobile) {
        showFieldError(`${prefix}-mobile-error`, 'Mobile number is required');
        isValid = false;
    } else if (!/^\d{10}$/.test(data.mobile)) {
        showFieldError(`${prefix}-mobile-error`, 'Mobile number must be 10 digits');
        isValid = false;
    } else {
        // Check for duplicate mobile (excluding current customer in edit mode)
        const duplicate = customers.find(c => c.mobile === data.mobile && c.id !== excludeId);
        if (duplicate) {
            showFieldError(`${prefix}-mobile-error`, 'Mobile number already exists');
            isValid = false;
        }
    }
    
    return isValid;
}

function showFieldError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function showSuccessMessage(message) {
    // Create success message if it doesn't exist
    let successMsg = document.querySelector('.success-message');
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(successMsg, container.firstChild);
        }
    }
    
    successMsg.textContent = message;
    successMsg.classList.add('show');
    
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

// Customer List Functions
function displayCustomers() {
    const customerList = document.getElementById('customer-list');
    if (!customerList) return;
    
    const searchInput = document.getElementById('search-input');
    const ratingFilter = document.getElementById('filter-rating');
    const cityFilter = document.getElementById('filter-city');
    const monthFilter = document.getElementById('filter-month');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const ratingFilterValue = ratingFilter ? ratingFilter.value : '';
    const cityFilterValue = cityFilter ? cityFilter.value : '';
    const monthFilterValue = monthFilter ? monthFilter.value : '';
    
    let filteredCustomers = customers.filter(customer => {
        // Search filter
        const matchesSearch = !searchTerm || 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.mobile.includes(searchTerm) ||
            (customer.city && customer.city.toLowerCase().includes(searchTerm));
        
        // Rating filter
        const matchesRating = !ratingFilterValue || customer.rating.toString() === ratingFilterValue;
        
        // City filter
        const matchesCity = !cityFilterValue || customer.city === cityFilterValue;
        
        // Month filter (birth month)
        const matchesMonth = !monthFilterValue || 
            (customer.dateOfBirth && new Date(customer.dateOfBirth).getMonth().toString() === monthFilterValue);
        
        return matchesSearch && matchesRating && matchesCity && matchesMonth;
    });
    
    if (filteredCustomers.length === 0) {
        customerList.innerHTML = `
            <div class="empty-state">
                <h3>No customers found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    customerList.innerHTML = filteredCustomers.map(customer => `
        <div class="customer-item" onclick="showCustomerDetailScreen(${customer.id})">
            <div class="customer-info">
                <p class="customer-name">${customer.name}</p>
                <p class="customer-mobile">${customer.mobile}</p>
                <p class="customer-city">${customer.city || 'N/A'}</p>
                <div class="customer-rating">
                    ${generateStarDisplay(customer.rating)}
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn btn--outline btn--sm edit-btn" onclick="event.stopPropagation(); showEditCustomerScreen(${customer.id})">
                    ✏️ Edit
                </button>
                <button class="btn btn--outline btn--sm delete-btn" onclick="event.stopPropagation(); confirmDeleteCustomer(${customer.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function generateStarDisplay(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'active' : ''}" style="cursor: default;">⭐</span>`;
    }
    return stars;
}

function populateFilterOptions() {
    // Populate city filter
    const cityFilter = document.getElementById('filter-city');
    if (!cityFilter) return;
    
    const availableCities = [...new Set(customers.map(c => c.city).filter(city => city))].sort();
    
    cityFilter.innerHTML = '<option value="">All Cities</option>';
    availableCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
}

function populateSmsCustomerSelect() {
    const selectElement = document.getElementById('sms-customer-select');
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="">Select a customer...</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        selectElement.appendChild(option);
    });
}

function generateMarketingSMS() {
    const customerId = document.getElementById('sms-customer-select').value;
    const outputElement = document.getElementById('sms-suggestion-output');
    if (!outputElement) return;

    if (!customerId) {
        outputElement.value = 'Please select a customer to generate a message.';
        return;
    }

    const customer = customers.find(c => c.id === parseInt(customerId));
    if (!customer) {
        outputElement.value = 'Customer not found.';
        return;
    }

    let message = `Hi ${customer.name}, exciting offers just for you!`;

    if (customer.rating >= 4) {
        message += ` As a valued ${customer.rating}-star customer, enjoy exclusive benefits on your next purchase.`;
    } else if (customer.rating > 0) {
        message += ` We appreciate your business! Check out our new arrivals and special discounts.`;
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    if (customer.dateOfBirth) {
        const dob = new Date(customer.dateOfBirth);
        if (dob.getMonth() === currentMonth && dob.getDate() === currentDay) {
            message += ` Happy Birthday! Get a special gift from us.`;
        }
    }

    if (customer.anniversary) {
        const anniversary = new Date(customer.anniversary);
        if (anniversary.getMonth() === currentMonth && anniversary.getDate() === currentDay) {
            message += ` Happy Anniversary! Celebrate with a discount on your favorite products.`;
        }
    }

    message += ` Visit us or call ${customer.mobile} for more details.`;

    outputElement.value = message;
}

function copySmsToClipboard() {
    const outputElement = document.getElementById('sms-suggestion-output');
    if (outputElement && outputElement.value) {
        navigator.clipboard.writeText(outputElement.value)
            .then(() => {
                showSuccessMessage('Message copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy message: ', err);
                alert('Failed to copy message. Please copy manually.');
            });
    } else {
        alert('No message to copy.');
    }
}

function sendSuggestedSMS() {
    const customerId = document.getElementById('sms-customer-select').value;
    const message = document.getElementById('sms-suggestion-output').value;

    if (!customerId || !message) {
        alert('Please select a customer and generate a message first.');
        return;
    }

    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
        // In a real application, this would send an actual SMS
        console.log(`Sending SMS to ${customer.mobile}: ${message}`);
        const smsLink = `sms:${customer.mobile}?body=${encodeURIComponent(message)}`;
        window.open(smsLink, '_system'); // '_system' is often used for opening native apps
        showSuccessMessage(`SMS initiated for ${customer.name} (${customer.mobile})!`);
    } else {
        alert('Selected customer not found.');
    }
}

// Customer Detail Functions
function displayCustomerDetails(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const detailInfo = document.getElementById('customer-detail-info');
    if (!detailInfo) return;
    
    detailInfo.innerHTML = `
        <div class="detail-grid">
            <div class="detail-row">
                <div class="detail-item">
                    <div class="detail-label">Name</div>
                    <p class="detail-value">${customer.name}</p>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Mobile Number</div>
                    <p class="detail-value">${customer.mobile}</p>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-item">
                    <div class="detail-label">Age</div>
                    <p class="detail-value">${customer.age || 'Not specified'}</p>
                </div>
                <div class="detail-item">
                    <div class="detail-label">City</div>
                    <p class="detail-value">${customer.city || 'Not specified'}</p>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Address</div>
                <p class="detail-value">${customer.address || 'Not specified'}</p>
            </div>
            
            <div class="detail-row">
                <div class="detail-item">
                    <div class="detail-label">Date of Birth</div>
                    <p class="detail-value">${customer.dateOfBirth ? formatDate(customer.dateOfBirth) : 'Not specified'}</p>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Anniversary</div>
                    <p class="detail-value">${customer.anniversary ? formatDate(customer.anniversary) : 'Not specified'}</p>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Rating</div>
                <div class="rating-display">
                    ${generateStarDisplay(customer.rating)}
                </div>
            </div>
        </div>
        ${customer.notes ? `<div class="detail-item">
            <div class="detail-label">Notes</div>
            <p class="detail-value">${customer.notes}</p>
        </div>` : ''}
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Form Reset Functions
function resetAddForm() {
    const form = document.getElementById('add-customer-form');
    if (form) {
        form.reset();
    }
    
    const ratingValue = document.getElementById('add-rating-value');
    if (ratingValue) {
        ratingValue.value = 0;
    }
    
    const ratingContainer = document.getElementById('add-rating');
    if (ratingContainer) {
        updateStarDisplay(ratingContainer, 0);
    }
    
    // Reset city selection
    const otherCityContainer = document.getElementById('add-other-city-container');
    if (otherCityContainer) {
        otherCityContainer.style.display = 'none';
    }
    
    const otherCityInput = document.getElementById('add-other-city');
    if (otherCityInput) {
        otherCityInput.required = false;
    }
    
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });
}

function populateEditForm(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const elements = {
        'edit-customer-id': customer.id,
        'edit-name': customer.name,
        'edit-mobile': customer.mobile,
        'edit-age': customer.age || '',
        'edit-address': customer.address || '',
        'edit-dob': customer.dateOfBirth || '',
        'edit-anniversary': customer.anniversary || '',
        'edit-rating-value': customer.rating,
        'edit-notes': customer.notes || ''
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
    
    // Set city value
    setCityValue('edit', customer.city || '');
    
    const ratingContainer = document.getElementById('edit-rating');
    if (ratingContainer) {
        updateStarDisplay(ratingContainer, customer.rating);
    }
    
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });
}

// Export Functions
function exportToCSV() {
    const csvContent = convertToCSV(customers);
    downloadFile(csvContent, 'customers.csv', 'text/csv');
    showSuccessMessage('Customer data exported to CSV!');
}

function exportToExcel() {
    // For demo purposes, we'll export as CSV with Excel-friendly format
    const csvContent = convertToCSV(customers);
    downloadFile(csvContent, 'customers.xlsx', 'application/vnd.ms-excel');
    showSuccessMessage('Customer data exported to Excel!');
}

function convertToCSV(data) {
    const headers = ['Name', 'Mobile', 'Age', 'Address', 'City', 'Date of Birth', 'Anniversary', 'Rating', 'Notes'];
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    data.forEach(customer => {
        const row = [
            customer.name,
            customer.mobile,
            customer.age || '',
            customer.address || '',
            customer.city || '',
            customer.dateOfBirth || '',
            customer.anniversary || '',
            customer.rating,
            customer.notes || ''
        ];
        csvRows.push(row.map(field => `"${field}"`).join(','));
    });
    
    return csvRows.join('\n');
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Marketing Functions
function sendSMSPromo() {
    const selectedCount = customers.length;
    showSuccessMessage(`SMS promotion sent to ${selectedCount} customers!`);
}

function sendWhatsAppPromo() {
    const selectedCount = customers.length;
    showSuccessMessage(`WhatsApp promotion sent to ${selectedCount} customers!`);
}

// Search and Filter Event Listeners
function initializeSearchAndFilters() {
    const elements = ['search-input', 'filter-rating', 'filter-city', 'filter-month'];
    
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', displayCustomers);
            element.addEventListener('keyup', displayCustomers);
        }
    });
}

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('CustomerConnect Application loaded');
    
    try {
        // Initialize all components
        initializeForms();
        initializeSearchAndFilters();
        
        // Set up Firebase authentication state listener
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User is signed in:', user.email);
                currentUser = user;
                // Load customers if user is authenticated
                loadCustomersFromFirebase().then(() => {
                    setupCustomersListener();
                    if (currentScreen === 'login-screen') {
                        showHomeScreen();
                    }
                });
            } else {
                console.log('User is signed out');
                currentUser = null;
                customers = [];
                if (currentScreen !== 'login-screen') {
                    showScreen('login-screen');
                }
            }
        });
        
        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) {
                closeDeleteModal();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDeleteModal();
            }
        });
        
        console.log('Application initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
    
    // Ensure login screen is active initially
    showScreen('login-screen');
});