/**
 * Fake Account Detector Frontend JavaScript
 * Handles form interactions, API calls, and UI animations
 */

// API Configuration - Auto-detect if we're accessing via network IP
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : `http://${window.location.hostname}:5000`;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const detectionForm = document.getElementById('detection-form');
const resultsSection = document.getElementById('results-section');
const resultContent = document.getElementById('result-content');
const loadingSpinner = document.getElementById('loading-spinner');
const demoBtn = document.getElementById('demo-btn');
const csvFileInput = document.getElementById('csv-file');
const uploadArea = document.getElementById('upload-area');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    setupTabSwitching();
    setupFormSubmission();
    setupDemoButton();
    setupCSVUpload();
    setupFormValidation();
    setupEngagementRatioCalculator();
    checkAPIHealth();
}

/**
 * Check if the API is running
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            console.log('API is running and healthy');
        }
    } catch (error) {
        console.warn('API is not running. Please start the backend server.');
        showNotification('Please start the backend server (python api.py)', 'warning');
    }
}

/**
 * Setup tab switching functionality
 */
function setupTabSwitching() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            switchTab(targetTab);
        });
    });
}

/**
 * Switch between tabs
 */
function switchTab(targetTab) {
    // Remove active class from all tabs and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    document.getElementById(`${targetTab}-tab`).classList.add('active');
    
    // Hide results when switching tabs
    hideResults();
}

/**
 * Setup form submission
 */
function setupFormSubmission() {
    detectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = getFormData();
        if (validateFormData(formData)) {
            await analyzeAccount(formData);
        }
    });
}

/**
 * Get form data from the manual input form
 */
function getFormData() {
    const formData = new FormData(detectionForm);
    const data = {};
    
    // Convert form data to object
    for (let [key, value] of formData.entries()) {
        if (key === 'has_profile_picture' || key === 'has_bio' || key === 'is_verified') {
            data[key] = 1; // Checkbox is checked
        } else {
            data[key] = parseFloat(value) || 0;
        }
    }
    
    // Set unchecked checkboxes to 0
    const checkboxes = ['has_profile_picture', 'has_bio', 'is_verified'];
    checkboxes.forEach(checkbox => {
        if (!(checkbox in data)) {
            data[checkbox] = 0;
        }
    });
    
    return data;
}

/**
 * Validate form data
 */
function validateFormData(data) {
    const errors = [];
    
    // Check required fields
    const requiredFields = [
        'username_length', 'num_posts', 'num_followers', 
        'num_following', 'account_age_days', 'engagement_ratio'
    ];
    
    requiredFields.forEach(field => {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            errors.push(`${field.replace('_', ' ')} is required`);
        }
    });
    
    // Validate ranges
    if (data.username_length <= 0) {
        errors.push('Username length must be positive');
    }
    
    if (data.num_posts < 0) {
        errors.push('Number of posts cannot be negative');
    }
    
    if (data.num_followers < 0) {
        errors.push('Number of followers cannot be negative');
    }
    
    if (data.num_following < 0) {
        errors.push('Number of following cannot be negative');
    }
    
    if (data.account_age_days <= 0) {
        errors.push('Account age must be positive');
    }
    
    if (data.engagement_ratio < 0) {
        errors.push('Engagement ratio cannot be negative');
    }
    
    if (errors.length > 0) {
        showNotification(`Validation errors: ${errors.join(', ')}`, 'error');
        return false;
    }
    
    return true;
}

/**
 * Analyze account using the API
 */
async function analyzeAccount(data) {
    showLoading();
    hideResults();
    
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResults(result);
        
    } catch (error) {
        console.error('Error analyzing account:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Display analysis results
 */
function displayResults(result) {
    const isFake = result.is_fake;
    const confidence = result.confidence;
    const probabilityFake = result.probability_fake;
    
    // Create result HTML
    const resultHTML = `
        <div class="result-status ${isFake ? 'fake' : 'real'}">
            <i class="fas fa-${isFake ? 'times-circle' : 'check-circle'}"></i>
            <div>
                <h3>${isFake ? 'Fake Account Detected' : 'Real Account Detected'}</h3>
                <p>Confidence: ${(isFake ? probabilityFake * 100 : (1 - probabilityFake) * 100).toFixed(1)}%</p>
            </div>
        </div>
        
        <div class="confidence-bars">
            <div class="confidence-bar">
                <div class="confidence-label">Real Account</div>
                <div class="confidence-value real">${(confidence.real_account * 100).toFixed(1)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill real" style="width: ${confidence.real_account * 100}%"></div>
                </div>
            </div>
            
            <div class="confidence-bar">
                <div class="confidence-label">Fake Account</div>
                <div class="confidence-value fake">${(confidence.fake_account * 100).toFixed(1)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill fake" style="width: ${confidence.fake_account * 100}%"></div>
                </div>
            </div>
        </div>
        
        <div class="result-details" style="margin-top: 1.5rem;">
            <h4 style="color: rgba(255, 255, 255, 0.9); margin-bottom: 1rem;">
                <i class="fas fa-info-circle"></i> Analysis Details
            </h4>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 10px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                    <div><strong>Username Length:</strong> ${result.input_data.username_length}</div>
                    <div><strong>Posts:</strong> ${result.input_data.num_posts}</div>
                    <div><strong>Followers:</strong> ${result.input_data.num_followers}</div>
                    <div><strong>Following:</strong> ${result.input_data.num_following}</div>
                    <div><strong>Account Age:</strong> ${result.input_data.account_age_days} days</div>
                    <div><strong>Engagement Ratio:</strong> ${result.input_data.engagement_ratio}</div>
                    <div><strong>Profile Picture:</strong> ${result.input_data.has_profile_picture ? 'Yes' : 'No'}</div>
                    <div><strong>Bio:</strong> ${result.input_data.has_bio ? 'Yes' : 'No'}</div>
                    <div><strong>Verified:</strong> ${result.input_data.is_verified ? 'Yes' : 'No'}</div>
                </div>
            </div>
        </div>
    `;
    
    resultContent.innerHTML = resultHTML;
    showResults();
    
    // Add animation to progress bars
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            bar.style.width = bar.style.width; // Trigger animation
        });
    }, 100);
}

/**
 * Setup demo button functionality
 */
function setupDemoButton() {
    demoBtn.addEventListener('click', () => {
        fillDemoData();
        switchTab('manual');
    });
}

/**
 * Fill form with demo data
 */
function fillDemoData() {
    // Generate random demo data
    const demoData = generateDemoData();
    
    // Fill form fields
    Object.keys(demoData).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = demoData[key] === 1;
            } else {
                element.value = demoData[key];
            }
        }
    });
    
    showNotification('Demo data loaded! Click "Analyze Account" to test.', 'success');
}

/**
 * Generate random demo data
 */
function generateDemoData() {
    const scenarios = [
        // Fake account scenario
        {
            username_length: Math.floor(Math.random() * 10) + 20, // Long username
            num_posts: Math.floor(Math.random() * 5) + 1, // Few posts
            num_followers: Math.floor(Math.random() * 50) + 10, // Few followers
            num_following: Math.floor(Math.random() * 2000) + 500, // Many following
            account_age_days: Math.floor(Math.random() * 20) + 1, // New account
            has_profile_picture: Math.random() > 0.6 ? 1 : 0, // Less likely to have picture
            has_bio: Math.random() > 0.7 ? 1 : 0, // Less likely to have bio
            engagement_ratio: parseFloat((Math.random() * 0.1).toFixed(4)), // Low engagement
            is_verified: 0 // Not verified
        },
        // Real account scenario
        {
            username_length: Math.floor(Math.random() * 10) + 8, // Normal username
            num_posts: Math.floor(Math.random() * 500) + 50, // More posts
            num_followers: Math.floor(Math.random() * 2000) + 100, // More followers
            num_following: Math.floor(Math.random() * 500) + 50, // Normal following
            account_age_days: Math.floor(Math.random() * 1000) + 100, // Older account
            has_profile_picture: Math.random() > 0.3 ? 1 : 0, // More likely to have picture
            has_bio: Math.random() > 0.4 ? 1 : 0, // More likely to have bio
            engagement_ratio: parseFloat((Math.random() * 0.5 + 0.1).toFixed(4)), // Higher engagement
            is_verified: Math.random() > 0.95 ? 1 : 0 // Rarely verified
        }
    ];
    
    return scenarios[Math.floor(Math.random() * scenarios.length)];
}

/**
 * Setup CSV upload functionality
 */
function setupCSVUpload() {
    // File input change handler
    csvFileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    uploadArea.addEventListener('click', () => csvFileInput.click());
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processCSVFile(file);
    }
}

/**
 * Handle drag over
 */
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

/**
 * Handle drag leave
 */
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleFileDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            processCSVFile(file);
        } else {
            showNotification('Please upload a CSV file.', 'error');
        }
    }
}

/**
 * Process CSV file
 */
function processCSVFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const csvData = event.target.result;
            const rows = parseCSV(csvData);
            
            if (rows.length > 0) {
                processBatchPredictions(rows);
            } else {
                showNotification('CSV file appears to be empty.', 'error');
            }
        } catch (error) {
            showNotification(`Error reading CSV: ${error.message}`, 'error');
        }
    };
    
    reader.readAsText(file);
}

/**
 * Parse CSV data
 */
function parseCSV(csvData) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];
    
    // Required headers
    const requiredHeaders = [
        'username_length', 'num_posts', 'num_followers', 'num_following',
        'account_age_days', 'has_profile_picture', 'has_bio', 
        'engagement_ratio', 'is_verified'
    ];
    
    // Check if all required headers are present
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index].trim();
                if (requiredHeaders.includes(header)) {
                    row[header] = parseFloat(value) || 0;
                }
            });
            rows.push(row);
        }
    }
    
    return rows;
}

/**
 * Process batch predictions from CSV
 */
async function processBatchPredictions(rows) {
    showLoading();
    hideResults();
    
    const results = [];
    const batchSize = 10; // Process in batches to avoid overwhelming the API
    
    try {
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const batchPromises = batch.map(row => 
                fetch(`${API_BASE_URL}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(row)
                }).then(response => response.json())
            );
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Show progress
            showNotification(`Processed ${Math.min(i + batchSize, rows.length)} of ${rows.length} accounts...`, 'info');
        }
        
        displayBatchResults(results);
        
    } catch (error) {
        console.error('Error processing batch predictions:', error);
        showNotification(`Error processing CSV: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Display batch results
 */
function displayBatchResults(results) {
    const totalCount = results.length;
    const fakeCount = results.filter(r => r.is_fake).length;
    const realCount = totalCount - fakeCount;
    
    const resultHTML = `
        <div class="batch-summary">
            <h3><i class="fas fa-chart-bar"></i> Batch Analysis Summary</h3>
            <div class="summary-stats">
                <div class="stat-card">
                    <div class="stat-number">${totalCount}</div>
                    <div class="stat-label">Total Accounts</div>
                </div>
                <div class="stat-card real">
                    <div class="stat-number">${realCount}</div>
                    <div class="stat-label">Real Accounts</div>
                    <div class="stat-percentage">${((realCount / totalCount) * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-card fake">
                    <div class="stat-number">${fakeCount}</div>
                    <div class="stat-label">Fake Accounts</div>
                    <div class="stat-percentage">${((fakeCount / totalCount) * 100).toFixed(1)}%</div>
                </div>
            </div>
        </div>
        
        <div class="download-section">
            <button class="download-btn" onclick="downloadResults(${JSON.stringify(results).replace(/"/g, '&quot;')})">
                <i class="fas fa-download"></i>
                Download Results CSV
            </button>
        </div>
    `;
    
    resultContent.innerHTML = resultHTML;
    showResults();
    
    // Add styles for batch results
    addBatchResultStyles();
}

/**
 * Add styles for batch results
 */
function addBatchResultStyles() {
    if (!document.getElementById('batch-styles')) {
        const style = document.createElement('style');
        style.id = 'batch-styles';
        style.innerHTML = `
            .batch-summary {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .batch-summary h3 {
                color: rgba(255, 255, 255, 0.9);
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .stat-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .stat-card.real {
                border-color: #4ecdc4;
                background: rgba(78, 205, 196, 0.1);
            }
            
            .stat-card.fake {
                border-color: #ff6b6b;
                background: rgba(255, 107, 107, 0.1);
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: 700;
                color: white;
                margin-bottom: 0.5rem;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 0.25rem;
            }
            
            .stat-percentage {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.6);
            }
            
            .download-section {
                text-align: center;
                margin-top: 2rem;
            }
            
            .download-btn {
                padding: 1rem 2rem;
                background: linear-gradient(45deg, #4ecdc4, #44a08d);
                color: white;
                border: none;
                border-radius: 10px;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .download-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Download results as CSV
 */
function downloadResults(results) {
    const csvContent = [
        // Headers
        'username_length,num_posts,num_followers,num_following,account_age_days,has_profile_picture,has_bio,engagement_ratio,is_verified,prediction,probability_fake,confidence_real,confidence_fake',
        // Data rows
        ...results.map(result => [
            result.input_data.username_length,
            result.input_data.num_posts,
            result.input_data.num_followers,
            result.input_data.num_following,
            result.input_data.account_age_days,
            result.input_data.has_profile_picture,
            result.input_data.has_bio,
            result.input_data.engagement_ratio,
            result.input_data.is_verified,
            result.prediction,
            result.probability_fake,
            result.confidence.real_account,
            result.confidence.fake_account
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fake_account_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Results downloaded successfully!', 'success');
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const inputs = detectionForm.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', validateInput);
    });
}

/**
 * Validate individual input
 */
function validateInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    
    // Remove previous validation styles
    input.classList.remove('invalid');
    
    // Validate based on input name
    let isValid = true;
    
    switch (input.name) {
        case 'username_length':
            isValid = value > 0 && value <= 50;
            break;
        case 'num_posts':
        case 'num_followers':
        case 'num_following':
            isValid = value >= 0;
            break;
        case 'account_age_days':
            isValid = value > 0;
            break;
        case 'engagement_ratio':
            isValid = value >= 0;
            break;
    }
    
    if (!isValid && input.value !== '') {
        input.classList.add('invalid');
    }
}

/**
 * Setup engagement ratio calculator
 */
function setupEngagementRatioCalculator() {
    const postsInput = document.getElementById('num_posts');
    const followersInput = document.getElementById('num_followers');
    const engagementInput = document.getElementById('engagement_ratio');
    
    function calculateEngagementRatio() {
        const posts = parseFloat(postsInput.value) || 0;
        const followers = parseFloat(followersInput.value) || 0;
        
        if (followers > 0) {
            const ratio = posts / followers;
            if (engagementInput.value === '' || engagementInput.value === '0') {
                engagementInput.value = ratio.toFixed(4);
            }
        }
    }
    
    postsInput.addEventListener('input', calculateEngagementRatio);
    followersInput.addEventListener('input', calculateEngagementRatio);
}

/**
 * Show loading spinner
 */
function showLoading() {
    loadingSpinner.classList.add('show');
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    loadingSpinner.classList.remove('show');
}

/**
 * Show results section
 */
function showResults() {
    resultsSection.classList.add('show');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hide results section
 */
function hideResults() {
    resultsSection.classList.remove('show');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const colors = {
        success: '#4ecdc4',
        error: '#ff6b6b',
        warning: '#feca57',
        info: '#48cae4'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        max-width: 300px;
        animation: slideInFromRight 0.3s ease-out;
        cursor: pointer;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOutToRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutToRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.innerHTML = `
    .notification.invalid {
        border: 2px solid #ff6b6b !important;
        box-shadow: 0 0 10px rgba(255, 107, 107, 0.3) !important;
    }
    
    @keyframes slideInFromRight {
        0% {
            transform: translateX(100%);
            opacity: 0;
        }
        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutToRight {
        0% {
            transform: translateX(0);
            opacity: 1;
        }
        100% {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);
