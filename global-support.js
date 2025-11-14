// Global Support Component
// Provides floating support button accessible from any page

(function() {
    'use strict';
    
    // Create floating support button
    function createFloatingSupportButton() {
        // Check if button already exists
        if (document.getElementById('floatingSupportBtn')) {
            return;
        }
        
        const supportButton = document.createElement('button');
        supportButton.id = 'floatingSupportBtn';
        supportButton.className = 'floating-support-btn';
        supportButton.innerHTML = '<i class="fas fa-headset"></i><span class="support-btn-text">Support</span>';
        supportButton.setAttribute('aria-label', 'Contact Support');
        supportButton.title = 'Contact Support';
        
        // Add hover effect to expand button
        supportButton.addEventListener('mouseenter', function() {
            this.classList.add('expanded');
        });
        
        supportButton.addEventListener('mouseleave', function() {
            this.classList.remove('expanded');
        });
        
        // Add click handler
        supportButton.addEventListener('click', function(e) {
            e.preventDefault();
            openSupportModal();
        });
        
        document.body.appendChild(supportButton);
    }
    
    // Create support modal if it doesn't exist
    function createSupportModal() {
        if (document.getElementById('supportModal')) {
            return; // Modal already exists
        }
        
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'supportModal';
        modalOverlay.className = 'support-modal-overlay';
        
        modalOverlay.innerHTML = `
            <div class="support-modal">
                <div class="support-modal-header">
                    <h3><i class="fas fa-headset"></i> Contact Support</h3>
                    <button class="support-modal-close" id="closeSupportModal">&times;</button>
                </div>
                <form id="supportForm">
                    <div class="support-form-group">
                        <label for="supportMessage">Your Message</label>
                        <textarea id="supportMessage" placeholder="Please describe your issue or question. We'll get back to you as soon as possible." rows="6" required></textarea>
                    </div>
                    <div class="support-modal-actions">
                        <button type="button" class="btn-cancel-support" id="cancelSupportBtn">Cancel</button>
                        <button type="submit" class="btn-send-support">
                            <i class="fas fa-paper-plane"></i> Send Message
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        // Initialize modal handlers
        initializeSupportModal();
    }
    
    // Initialize support modal functionality
    function initializeSupportModal() {
        const supportModal = document.getElementById('supportModal');
        const closeSupportModalBtn = document.getElementById('closeSupportModal');
        const cancelSupportBtn = document.getElementById('cancelSupportBtn');
        const supportForm = document.getElementById('supportForm');
        
        // Close button handler
        if (closeSupportModalBtn) {
            closeSupportModalBtn.addEventListener('click', function() {
                closeSupportModal();
            });
        }
        
        // Cancel button handler
        if (cancelSupportBtn) {
            cancelSupportBtn.addEventListener('click', function() {
                closeSupportModal();
            });
        }
        
        // Close on overlay click
        if (supportModal) {
            supportModal.addEventListener('click', function(e) {
                if (e.target === supportModal) {
                    closeSupportModal();
                }
            });
        }
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && supportModal && supportModal.classList.contains('active')) {
                closeSupportModal();
            }
        });
        
        // Form submission handler
        if (supportForm) {
            supportForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const message = document.getElementById('supportMessage').value;
                
                if (!message.trim()) {
                    alert('Please enter your message.');
                    return;
                }
                
                // Get user data if logged in
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                const userEmail = userData.email || 'Unknown';
                const userName = userData.name || 'User';
                const userId = userData.uid || null;
                const userPhone = userData.phone || userData.mobile || null;
                
                // Store message data
                const contactMessage = {
                    name: userName,
                    email: userEmail,
                    userId: userId,
                    phone: userPhone,
                    message: message,
                    source: 'support'
                };
                
                // Show loading state
                const submitBtn = supportForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                }
                
                try {
                    // Save to Firebase if available
                    if (typeof window.firebaseDb !== 'undefined') {
                        const database = window.firebaseDb;
                        const messageRef = database.ref('contactMessages').push();
                        
                        await messageRef.set({
                            id: messageRef.key,
                            name: contactMessage.name,
                            email: contactMessage.email,
                            userId: contactMessage.userId,
                            phone: contactMessage.phone,
                            message: contactMessage.message,
                            source: contactMessage.source,
                            timestamp: firebase.database.ServerValue.TIMESTAMP,
                            read: false
                        });
                        
                        console.log('✅ Support message saved to Firebase');
                        alert('Thank you for contacting support! Your message has been sent to the admin. We will get back to you soon.');
                        
                        // Clear the form
                        document.getElementById('supportMessage').value = '';
                        closeSupportModal();
                    } else {
                        throw new Error('Firebase is not available. Please check your internet connection and try again.');
                    }
                } catch (error) {
                    console.error('❌ Error saving message:', error);
                    
                    // Show user-friendly error message
                    if (error.code === 'PERMISSION_DENIED' || (error.message && error.message.includes('PERMISSION_DENIED'))) {
                        alert('⚠️ CRITICAL: Message could not be saved!\n\n' +
                              'Your message was NOT saved because Firebase database rules are not configured.\n\n' +
                              'Please contact the website administrator immediately.\n\n' +
                              'Error: PERMISSION_DENIED');
                    } else {
                        alert('⚠️ An error occurred while sending your message.\n\n' +
                              'Please try again or contact support directly.\n\n' +
                              'Error: ' + (error.message || 'Unknown error'));
                    }
                } finally {
                    // Restore button state
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                }
            });
        }
    }
    
    // Open support modal
    function openSupportModal() {
        const supportModal = document.getElementById('supportModal');
        if (supportModal) {
            supportModal.classList.add('active');
            // Prevent body scroll when modal is open
            document.body.classList.add('modal-open');
            // Focus on textarea
            const textarea = document.getElementById('supportMessage');
            if (textarea) {
                setTimeout(() => textarea.focus(), 100);
            }
        } else {
            // Create modal if it doesn't exist
            createSupportModal();
            setTimeout(() => {
                const modal = document.getElementById('supportModal');
                if (modal) {
                    modal.classList.add('active');
                    document.body.classList.add('modal-open');
                    const textarea = document.getElementById('supportMessage');
                    if (textarea) {
                        setTimeout(() => textarea.focus(), 100);
                    }
                }
            }, 50);
        }
    }
    
    // Close support modal
    function closeSupportModal() {
        const supportModal = document.getElementById('supportModal');
        if (supportModal) {
            supportModal.classList.remove('active');
            // Re-enable body scroll
            document.body.classList.remove('modal-open');
        }
    }
    
    
    // Make functions globally available
    window.openSupportModal = openSupportModal;
    window.closeSupportModal = closeSupportModal;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createFloatingSupportButton();
            createSupportModal();
        });
    } else {
        // DOM already loaded
        createFloatingSupportButton();
        createSupportModal();
    }
    
    console.log('✅ Global Support Component loaded');
})();

