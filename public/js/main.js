// Main JavaScript for additional website functionality
class VitaStoreApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('vitastore_cart')) || [];
        this.user = JSON.parse(localStorage.getItem('vitastore_user')) || null;
        this.initialize();
    }
    
    initialize() {
        this.updateCartDisplay();
        this.setupProductHandlers();
        this.setupUserHandlers();
        
        // Initialize any other app features
        this.setupScrollEffects();
        this.setupMobileMenu();
    }
    
    // Cart Management
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }
    
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }
    
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    saveCart() {
        localStorage.setItem('vitastore_cart', JSON.stringify(this.cart));
    }
    
    updateCartDisplay() {
        const cartCountEl = document.querySelector('.cart-count');
        if (cartCountEl) {
            const count = this.getCartItemCount();
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Product Handlers
    setupProductHandlers() {
        // Product quick view
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('product-quick-view')) {
                const productId = e.target.dataset.productId;
                this.showProductQuickView(productId);
            }
            
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productData = JSON.parse(e.target.dataset.product);
                this.addToCart(productData);
            }
        });
    }
    
    async showProductQuickView(productId) {
        try {
            showLoading();
            
            // In a real app, this would fetch from your API
            const response = await fetch(`/api/chat/products/${productId}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderProductModal(data.product);
            }
            
        } catch (error) {
            console.error('Error loading product:', error);
            this.showNotification('Unable to load product details', 'error');
        } finally {
            hideLoading();
        }
    }
    
    renderProductModal(product) {
        const modal = document.createElement('div');
        modal.className = 'product-modal-overlay';
        modal.innerHTML = `
            <div class="product-modal">
                <div class="modal-header">
                    <h2>${product.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="product-image">
                        <img src="${product.images[0] || '/images/placeholder.jpg'}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <p class="product-description">${product.description}</p>
                        <div class="product-benefits">
                            <h4>Benefits:</h4>
                            <ul>
                                ${product.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="product-price">
                            <span class="price">$${product.pricing.basePrice}</span>
                        </div>
                        <button class="add-to-cart-btn primary" data-product='${JSON.stringify(product)}'>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
    
    // User Management
    setupUserHandlers() {
        // Login/Register forms
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = Object.fromEntries(formData);
        
        try {
            showLoading();
            
            // In a real app, this would authenticate with your backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.user = data.user;
                localStorage.setItem('vitastore_user', JSON.stringify(this.user));
                this.showNotification('Login successful!', 'success');
                // Redirect or update UI
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);
        
        try {
            showLoading();
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Registration successful! Please log in.', 'success');
                // Switch to login form or redirect
            } else {
                this.showNotification(data.message || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // UI Effects
    setupScrollEffects() {
        // Parallax effects, animations, etc.
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        });
        
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('open');
            });
        }
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        // Use the same notification system as the chatbot
        if (window.vitaBot) {
            window.vitaBot.showToast(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
    
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }
    
    // API Helpers
    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.user?.token && { 'Authorization': `Bearer ${this.user.token}` })
            }
        };
        
        const response = await fetch(endpoint, { ...defaultOptions, ...options });
        return response.json();
    }
}

// Health Assessment Quiz
class HealthAssessment {
    constructor() {
        this.questions = [
            {
                id: 'age',
                question: 'What is your age range?',
                type: 'select',
                options: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+']
            },
            {
                id: 'gender',
                question: 'What is your gender?',
                type: 'select',
                options: ['Male', 'Female', 'Other', 'Prefer not to say']
            },
            {
                id: 'activity_level',
                question: 'How would you describe your activity level?',
                type: 'select',
                options: ['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active']
            },
            {
                id: 'health_goals',
                question: 'What are your primary health goals? (Select all that apply)',
                type: 'checkbox',
                options: ['Increase energy', 'Improve immunity', 'Better sleep', 'Bone health', 'Heart health', 'Skin health', 'Weight management']
            },
            {
                id: 'dietary_restrictions',
                question: 'Do you have any dietary restrictions?',
                type: 'checkbox',
                options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergies', 'None']
            },
            {
                id: 'current_supplements',
                question: 'Are you currently taking any vitamins or supplements?',
                type: 'textarea',
                placeholder: 'List any vitamins, minerals, or supplements you currently take...'
            }
        ];
        
        this.responses = {};
        this.currentQuestion = 0;
    }
    
    start() {
        this.showAssessment();
    }
    
    showAssessment() {
        const modal = document.createElement('div');
        modal.className = 'assessment-modal-overlay';
        modal.innerHTML = `
            <div class="assessment-modal">
                <div class="assessment-header">
                    <h2>Health Assessment</h2>
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%"></div>
                    </div>
                </div>
                <div class="assessment-content">
                    <!-- Questions will be rendered here -->
                </div>
                <div class="assessment-actions">
                    <button class="btn-secondary" id="prev-question" disabled>Previous</button>
                    <button class="btn-primary" id="next-question">Next</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        this.setupAssessmentHandlers();
        this.renderQuestion();
    }
    
    setupAssessmentHandlers() {
        const prevBtn = this.modal.querySelector('#prev-question');
        const nextBtn = this.modal.querySelector('#next-question');
        
        prevBtn.onclick = () => this.previousQuestion();
        nextBtn.onclick = () => this.nextQuestion();
    }
    
    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        const content = this.modal.querySelector('.assessment-content');
        const progress = this.modal.querySelector('.progress');
        const nextBtn = this.modal.querySelector('#next-question');
        const prevBtn = this.modal.querySelector('#prev-question');
        
        // Update progress
        const progressPercent = ((this.currentQuestion + 1) / this.questions.length) * 100;
        progress.style.width = `${progressPercent}%`;
        
        // Update buttons
        prevBtn.disabled = this.currentQuestion === 0;
        nextBtn.textContent = this.currentQuestion === this.questions.length - 1 ? 'Get Recommendations' : 'Next';
        
        // Render question
        let inputHTML = '';
        
        switch (question.type) {
            case 'select':
                inputHTML = `
                    <select id="question-input" name="${question.id}">
                        <option value="">Select an option...</option>
                        ${question.options.map(option => `
                            <option value="${option}" ${this.responses[question.id] === option ? 'selected' : ''}>
                                ${option}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;
                
            case 'checkbox':
                inputHTML = `
                    <div class="checkbox-group">
                        ${question.options.map(option => `
                            <label class="checkbox-label">
                                <input type="checkbox" name="${question.id}" value="${option}"
                                    ${(this.responses[question.id] || []).includes(option) ? 'checked' : ''}>
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'textarea':
                inputHTML = `
                    <textarea id="question-input" name="${question.id}" 
                        placeholder="${question.placeholder || ''}" rows="4"
                    >${this.responses[question.id] || ''}</textarea>
                `;
                break;
        }
        
        content.innerHTML = `
            <div class="question">
                <h3>${question.question}</h3>
                <div class="question-input">
                    ${inputHTML}
                </div>
            </div>
        `;
    }
    
    collectCurrentResponse() {
        const question = this.questions[this.currentQuestion];
        
        if (question.type === 'checkbox') {
            const checked = Array.from(this.modal.querySelectorAll(`input[name="${question.id}"]:checked`))
                .map(input => input.value);
            this.responses[question.id] = checked;
        } else {
            const input = this.modal.querySelector('#question-input');
            if (input) {
                this.responses[question.id] = input.value;
            }
        }
    }
    
    nextQuestion() {
        this.collectCurrentResponse();
        
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.renderQuestion();
        } else {
            this.completeAssessment();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.collectCurrentResponse();
            this.currentQuestion--;
            this.renderQuestion();
        }
    }
    
    async completeAssessment() {
        try {
            showLoading();
            
            // Generate recommendations based on responses
            const recommendations = await this.generateRecommendations();
            
            // Show results
            this.showResults(recommendations);
            
        } catch (error) {
            console.error('Error completing assessment:', error);
            this.showNotification('Unable to generate recommendations. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
    
    async generateRecommendations() {
        // In a real app, this would call your API
        const response = await fetch('/api/chat/products/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assessmentResponses: this.responses
            })
        });
        
        return response.json();
    }
    
    showResults(recommendations) {
        const content = this.modal.querySelector('.assessment-content');
        
        content.innerHTML = `
            <div class="assessment-results">
                <h3>🎉 Your Personalized Vitamin Recommendations</h3>
                <p>Based on your assessment, here are our top recommendations:</p>
                
                <div class="recommendations-grid">
                    ${recommendations.products?.map(product => `
                        <div class="recommendation-card">
                            <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}">
                            <h4>${product.name}</h4>
                            <p>${product.description}</p>
                            <div class="price">${window.vitaStore?.formatPrice(product.price) || '$' + product.price}</div>
                            <button class="add-to-cart-btn" data-product='${JSON.stringify(product)}'>
                                Add to Cart
                            </button>
                        </div>
                    `).join('') || '<p>No recommendations available at this time.</p>'}
                </div>
                
                <div class="results-actions">
                    <button class="btn-primary" onclick="this.closest('.assessment-modal-overlay').remove()">
                        Close
                    </button>
                    <button class="btn-secondary" onclick="window.vitaBot?.sendQuickMessage('I completed the health assessment')">
                        Discuss with VitaBot
                    </button>
                </div>
            </div>
        `;
        
        // Hide navigation buttons
        this.modal.querySelector('.assessment-actions').style.display = 'none';
    }
    
    showNotification(message, type) {
        if (window.vitaStore) {
            window.vitaStore.showNotification(message, type);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.vitaStore = new VitaStoreApp();
    window.healthAssessment = new HealthAssessment();
    
    // Expose global functions
    window.startHealthAssessment = () => window.healthAssessment.start();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VitaStoreApp, HealthAssessment };
}