// Product Reviews Helper Functions
// Handles ratings and reviews for products

const productReviewsHelper = {
    // Get product ID from page URL or product name
    getProductId: function() {
        // Try to get from URL path
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        
        // Map filenames to product IDs
        const productIdMap = {
            'bajaj card': 'bajaj-card',
            'lazypay': 'lazypay',
            'credit-card': 'credit-card',
            'home-credit': 'home-credit',
            'axio': 'axio',
            'idfc-buy-emi': 'idfc-buy-emi',
            'hdfc-easyemi': 'hdfc-easyemi',
            'zest-money': 'zest-money',
            'mobikwik-zip': 'mobikwik-zip',
            'amazon-pay-later': 'amazon-pay-later'
        };
        
        return productIdMap[filename] || filename.replace(/\s+/g, '-').toLowerCase();
    },

    // Get all reviews for a product
    getProductReviews: async function(productId) {
        try {
            const database = window.firebaseDb;
            if (!database) {
                console.error('Firebase database not initialized');
                return [];
            }

            const reviewsSnapshot = await database.ref(`productReviews/${productId}/reviews`).once('value');
            const reviews = reviewsSnapshot.val();

            if (!reviews) {
                return [];
            }

            const reviewList = [];
            Object.keys(reviews).forEach(reviewId => {
                const review = reviews[reviewId];
                // Only return approved reviews for customers
                if (review.approved !== false) {
                    let timestamp = review.timestamp;
                    if (timestamp && typeof timestamp === 'object') {
                        timestamp = timestamp.val ? timestamp.val() : Date.now();
                    } else if (!timestamp || isNaN(timestamp)) {
                        timestamp = Date.now();
                    }

                    reviewList.push({
                        id: reviewId,
                        rating: review.rating || 5,
                        review: review.review || '',
                        customerName: review.customerName || 'Anonymous',
                        timestamp: timestamp,
                        approved: review.approved !== false
                    });
                }
            });

            // Sort by timestamp (newest first)
            reviewList.sort((a, b) => b.timestamp - a.timestamp);
            return reviewList;
        } catch (error) {
            console.error('Error getting product reviews:', error);
            return [];
        }
    },

    // Get average rating for a product
    getAverageRating: async function(productId) {
        try {
            const reviews = await this.getProductReviews(productId);
            if (reviews.length === 0) {
                return { average: 0, count: 0 };
            }

            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 5), 0);
            const average = totalRating / reviews.length;
            
            return {
                average: Math.round(average * 10) / 10, // Round to 1 decimal
                count: reviews.length
            };
        } catch (error) {
            console.error('Error calculating average rating:', error);
            return { average: 0, count: 0 };
        }
    },

    // Display reviews on product page
    displayReviews: async function(containerId, productId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Reviews container not found:', containerId);
                return;
            }

            const reviews = await this.getProductReviews(productId);
            const ratingData = await this.getAverageRating(productId);

            // Create reviews HTML - Summary first (always visible)
            let reviewsHTML = `
                <div class="reviews-summary-section" style="padding: 0.75rem 1rem; background: #f8fafc; border-radius: 10px; margin-bottom: 0; border: 1px solid #e2e8f0;">
                    <div class="rating-display" style="display: flex; align-items: center; justify-content: center; gap: 0.6rem; height: 30px; margin-bottom: 0.25rem;">
                        <div class="stars-large" style="color: #10b981; font-size: 1rem; white-space: nowrap; display: inline-flex; align-items: center; flex-shrink: 0;">
                            ${this.renderStars(ratingData.average)}
                        </div>
                        <div class="rating-info" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; min-width: 75px; height: 30px;">
                            <span class="rating-value-large" style="font-size: 1.2rem; font-weight: 800; color: #1e293b; line-height: 1; white-space: nowrap; height: 1.2rem; display: flex; align-items: center; margin: 0;">${ratingData.average > 0 ? ratingData.average.toFixed(1) : '0.0'}</span>
                            <span class="rating-count-text" style="font-size: 0.75rem; color: #64748b; white-space: nowrap; text-align: center; height: 0.85rem; display: flex; align-items: center; margin: 0;">${ratingData.count} ${ratingData.count === 1 ? 'Review' : 'Reviews'}</span>
                        </div>
                    </div>
                    <div style="width: 100%; margin-top: 0.1rem; text-align: center;">
                        <button class="btn-show-reviews" id="showReviewsBtn" onclick="productReviewsHelper.toggleReviews('${productId}')" style="background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-size: 0.7rem; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.3rem; justify-content: center;">
                            <i class="fas fa-chevron-down" style="font-size: 0.65rem;"></i> Show Reviews
                        </button>
                    </div>
                </div>
                
                <div class="reviews-expanded-section" id="reviewsExpanded" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <div class="reviews-list-container" style="margin-bottom: 1.5rem;">
                        ${reviews.length === 0 ? `
                            <div class="no-reviews" style="text-align: center; padding: 3rem 1rem; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                <i class="fas fa-comment-slash" style="font-size: 3rem; margin-bottom: 1rem; color: #cbd5e1;"></i>
                                <p style="font-size: 1rem; color: #64748b;">No reviews yet. Be the first to review this product!</p>
                            </div>
                        ` : ''}
                        <div class="reviews-list" id="reviewsList" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            ${reviews.map(review => {
                                const date = new Date(review.timestamp);
                                const formattedDate = date.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                });
                                const formattedTime = date.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                });

                                return `
                                    <div class="review-item" style="padding: 1.25rem; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; text-align: left; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
                                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem;">
                                            <div class="reviewer-name" style="font-weight: 600; color: #1e293b; font-size: 1.1rem; display: inline-block; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${this.escapeHtml(review.customerName)}</div>
                                            <div class="review-rating" style="color: #10b981; font-size: 0.75rem; white-space: nowrap; display: inline-flex; align-items: center; justify-content: flex-start; line-height: 1;">
                                                ${this.renderStars(review.rating, '0.75rem')}
                                            </div>
                                        </div>
                                        <div class="review-date" style="color: #64748b; font-size: 0.75rem; display: block; margin-bottom: 0.75rem; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${formattedDate} at ${formattedTime}</div>
                                        <div class="review-text" style="color: #475569; line-height: 1.6; font-size: 1rem; display: block; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${this.escapeHtml(review.review)}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- Customer Review Form -->
                    <div class="customer-review-form-section" style="background: #ffffff; padding: 1.5rem; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 1.5rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: block; visibility: visible; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: block;"><i class="fas fa-edit" style="color: #10b981; margin-right: 0.5rem;"></i> Write a Review</h3>
                        <form id="customerReviewForm_${productId}" onsubmit="productReviewsHelper.submitReview(event, '${productId}')" style="display: block;">
                            <div class="form-group" style="margin-bottom: 1.5rem; display: block;">
                                <label for="customerRating_${productId}" style="display: block; color: #1e293b; font-weight: 600; margin-bottom: 0.5rem; font-size: 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Rating</label>
                                <div class="rating-input" id="ratingInput_${productId}" style="display: flex; flex-direction: row; justify-content: flex-start; gap: 0.3rem;">
                                    <input type="radio" name="rating" id="rating1_${productId}" value="1" required style="display: none;">
                                    <label for="rating1_${productId}" class="star-label" data-rating="1" style="cursor: pointer; color: #cbd5e1; font-size: 1.5rem; transition: all 0.2s ease;"><i class="far fa-star"></i></label>
                                    <input type="radio" name="rating" id="rating2_${productId}" value="2" style="display: none;">
                                    <label for="rating2_${productId}" class="star-label" data-rating="2" style="cursor: pointer; color: #cbd5e1; font-size: 1.5rem; transition: all 0.2s ease;"><i class="far fa-star"></i></label>
                                    <input type="radio" name="rating" id="rating3_${productId}" value="3" style="display: none;">
                                    <label for="rating3_${productId}" class="star-label" data-rating="3" style="cursor: pointer; color: #cbd5e1; font-size: 1.5rem; transition: all 0.2s ease;"><i class="far fa-star"></i></label>
                                    <input type="radio" name="rating" id="rating4_${productId}" value="4" style="display: none;">
                                    <label for="rating4_${productId}" class="star-label" data-rating="4" style="cursor: pointer; color: #cbd5e1; font-size: 1.5rem; transition: all 0.2s ease;"><i class="far fa-star"></i></label>
                                    <input type="radio" name="rating" id="rating5_${productId}" value="5" style="display: none;">
                                    <label for="rating5_${productId}" class="star-label" data-rating="5" style="cursor: pointer; color: #cbd5e1; font-size: 1.5rem; transition: all 0.2s ease;"><i class="far fa-star"></i></label>
                                </div>
                            </div>
                            <div class="form-group" style="margin-bottom: 1.5rem; display: block;">
                                <label for="customerReviewText_${productId}" style="display: block; color: #1e293b; font-weight: 600; margin-bottom: 0.5rem; font-size: 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Your Review</label>
                                <textarea id="customerReviewText_${productId}" name="reviewText" placeholder="Share your experience with this product..." rows="4" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; color: #1e293b; font-size: 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: block; resize: vertical;"></textarea>
                            </div>
                            <button type="submit" class="btn-submit-review" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.5rem; width: 100%; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                <i class="fas fa-paper-plane"></i> Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            `;

            container.innerHTML = reviewsHTML;
            
            // Ensure the summary section is visible
            const summarySection = container.querySelector('.reviews-summary-section');
            if (summarySection) {
                summarySection.style.display = 'flex';
                summarySection.style.visibility = 'visible';
            }
            
            // Setup star rating interaction
            this.setupStarRating(productId);
            
            // Check for pending review to submit (in case user just logged in)
            this.checkAndSubmitPendingReview();
            
            return Promise.resolve();
        } catch (error) {
            console.error('Error displaying reviews:', error);
            return Promise.reject(error);
        }
    },

    // Toggle reviews visibility
    toggleReviews: function(productId) {
        const expandedSection = document.getElementById('reviewsExpanded');
        const showBtn = document.getElementById('showReviewsBtn');
        
        if (expandedSection.style.display === 'none') {
            expandedSection.style.display = 'block';
            showBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Reviews';
            showBtn.classList.add('active');
        } else {
            expandedSection.style.display = 'none';
            showBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Reviews';
            showBtn.classList.remove('active');
        }
    },

    // Submit customer review
    submitReview: async function(event, productId) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const rating = parseInt(formData.get('rating'));
        const reviewText = formData.get('reviewText');
        
        // Check if user is authenticated
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const isLoggedIn = userData.isLoggedIn && userData.uid;
        
        // If not logged in, show login/signup prompt
        if (!isLoggedIn) {
            // Store review data temporarily
            const pendingReview = {
                productId: productId,
                rating: rating,
                reviewText: reviewText,
                formId: form.id,
                returnUrl: window.location.href // Store current page URL to return after login
            };
            sessionStorage.setItem('pendingReview', JSON.stringify(pendingReview));
            
            // Show login/signup prompt
            this.showLoginSignupPrompt(productId);
            return;
        }
        
        // User is logged in, proceed with submission
        const customerName = userData.name || userData.displayName || userData.email?.split('@')[0] || 'Guest User';
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            const database = window.firebaseDb;
            if (!database) {
                throw new Error('Firebase database not initialized');
            }
            
            // Get user data
            const userId = userData.uid || null;
            
            // Save review (pending approval)
            const reviewRef = database.ref(`productReviews/${productId}/reviews`).push();
            await reviewRef.set({
                id: reviewRef.key,
                rating: rating,
                review: reviewText,
                customerName: customerName,
                approved: false, // Pending admin approval
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                userId: userId,
                submittedBy: 'customer'
            });
            
            // Show success message
            alert('✅ Thank you for your review! It will be visible after admin approval.');
            
            // Reset form
            form.reset();
            
            // Reload reviews
            this.displayReviews('reviewsSection', productId);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    },

    // Get correct path to login/signup pages based on current location
    getAuthPageUrl: function(pageName) {
        const currentPath = window.location.pathname;
        
        // Normalize the path (handle Windows paths and URL encoding)
        let normalizedPath = currentPath.replace(/\\/g, '/');
        
        // Remove leading slash if present
        if (normalizedPath.startsWith('/')) {
            normalizedPath = normalizedPath.substring(1);
        }
        
        // Find the position of 'WesternPay' in the path to determine the site root
        const westernPayIndex = normalizedPath.toLowerCase().indexOf('westernpay');
        if (westernPayIndex !== -1) {
            // Extract path relative to WesternPay folder
            const relativePath = normalizedPath.substring(westernPayIndex + 'westernpay'.length);
            // Remove leading slash
            const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            
            // Count directory levels (excluding the HTML file itself)
            const pathParts = cleanPath.split('/').filter(part => part && !part.endsWith('.html'));
            const depth = pathParts.length;
            
            // Build relative path to root (where login.html and signup.html are located)
            if (depth === 0) {
                return pageName;
            } else {
                return '../'.repeat(depth) + pageName;
            }
        }
        
        // Fallback: use simple path detection
        // If we're in overview/product info/ directory, go up 2 levels
        if (normalizedPath.includes('/overview/product info/') || normalizedPath.includes('overview/product info/')) {
            return '../../' + pageName;
        }
        // If we're in overview/ directory, go up 1 level
        else if (normalizedPath.includes('/overview/') || normalizedPath.includes('overview/')) {
            return '../' + pageName;
        }
        // If we're at root level
        else {
            return pageName;
        }
    },

    // Show login/signup prompt modal
    showLoginSignupPrompt: function(productId) {
        // Remove existing modal if any
        const existingModal = document.getElementById('reviewAuthModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Get correct URLs for login and signup pages
        const loginUrl = this.getAuthPageUrl('login.html');
        const signupUrl = this.getAuthPageUrl('signup.html');
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'reviewAuthModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 450px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-lock" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem;">Login Required</h2>
                    <p style="color: #64748b; font-size: 1rem; margin: 0;">Please login or signup to submit your review</p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <button onclick="event.stopPropagation(); sessionStorage.setItem('returnUrl', window.location.href); window.location.href='${loginUrl}';" style="
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        text-decoration: none;
                        padding: 0.875rem 1.5rem;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 1rem;
                        text-align: center;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        border: none;
                        cursor: pointer;
                        width: 100%;
                    " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                    
                    <button onclick="event.stopPropagation(); sessionStorage.setItem('returnUrl', window.location.href); window.location.href='${signupUrl}';" style="
                        background: white;
                        color: #3b82f6;
                        text-decoration: none;
                        padding: 0.875rem 1.5rem;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 1rem;
                        text-align: center;
                        border: 2px solid #3b82f6;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        cursor: pointer;
                        width: 100%;
                    " onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>
                </div>
                
                <button onclick="document.getElementById('reviewAuthModal').remove()" style="
                    width: 100%;
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                    Cancel
                </button>
            </div>
        `;
        
        // Close on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    },

    // Check and submit pending review after login
    checkAndSubmitPendingReview: async function() {
        const pendingReviewStr = sessionStorage.getItem('pendingReview');
        if (!pendingReviewStr) {
            return;
        }
        
        try {
            const pendingReview = JSON.parse(pendingReviewStr);
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // Check if user is now logged in
            if (userData.isLoggedIn && userData.uid) {
                const customerName = userData.name || userData.displayName || userData.email?.split('@')[0] || 'Guest User';
                
                const database = window.firebaseDb;
                if (!database) {
                    throw new Error('Firebase database not initialized');
                }
                
                // Submit the pending review
                const reviewRef = database.ref(`productReviews/${pendingReview.productId}/reviews`).push();
                await reviewRef.set({
                    id: reviewRef.key,
                    rating: pendingReview.rating,
                    review: pendingReview.reviewText,
                    customerName: customerName,
                    approved: false, // Pending admin approval
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    userId: userData.uid,
                    submittedBy: 'customer'
                });
                
                // Clear pending review
                sessionStorage.removeItem('pendingReview');
                
                // Show success message
                alert('✅ Thank you for your review! It will be visible after admin approval.');
                
                // Reload reviews if on a product page
                if (typeof window.productReviewsHelper !== 'undefined') {
                    const currentProductId = window.productReviewsHelper.getProductId();
                    if (currentProductId === pendingReview.productId) {
                        await window.productReviewsHelper.displayReviews('reviewsSection', pendingReview.productId);
                    }
                }
            }
        } catch (error) {
            console.error('Error submitting pending review:', error);
            // Don't show alert to avoid interrupting user flow
        }
    },

    // Setup star rating interaction
    setupStarRating: function(productId) {
        const ratingInput = document.getElementById(`ratingInput_${productId}`);
        if (!ratingInput) return;
        
        const starLabels = ratingInput.querySelectorAll('.star-label');
        
        starLabels.forEach((label) => {
            const rating = parseInt(label.getAttribute('data-rating'));
            
            // Click event
            label.addEventListener('click', () => {
                // Check the corresponding radio
                const radio = document.getElementById(`rating${rating}_${productId}`);
                if (radio) {
                    radio.checked = true;
                }
                this.updateStarColors(productId, rating);
            });
            
            // Hover event
            label.addEventListener('mouseenter', () => {
                this.updateStarColors(productId, rating, true);
            });
        });
        
        // Reset on mouse leave
        ratingInput.addEventListener('mouseleave', () => {
            const checkedRadio = ratingInput.querySelector('input[type="radio"]:checked');
            if (checkedRadio) {
                const rating = parseInt(checkedRadio.value);
                this.updateStarColors(productId, rating);
            } else {
                this.updateStarColors(productId, 0);
            }
        });
    },
    
    // Update star colors based on rating
    updateStarColors: function(productId, rating, isHover = false) {
        const ratingInput = document.getElementById(`ratingInput_${productId}`);
        if (!ratingInput) return;
        
        const starLabels = ratingInput.querySelectorAll('.star-label');
        
        starLabels.forEach((label) => {
            const starRating = parseInt(label.getAttribute('data-rating'));
            const icon = label.querySelector('i');
            
            if (starRating <= rating) {
                // Fill star
                icon.className = 'fas fa-star';
                label.style.color = '#10b981';
            } else {
                // Empty star
                icon.className = 'far fa-star';
                label.style.color = '#cbd5e1';
            }
        });
    },

    // Render star rating
    renderStars: function(rating, size = '1rem') {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += `<i class="fas fa-star" style="font-size: ${size};"></i>`;
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += `<i class="fas fa-star-half-alt" style="font-size: ${size};"></i>`;
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += `<i class="far fa-star" style="font-size: ${size};"></i>`;
        }

        return starsHTML;
    },

    // Escape HTML to prevent XSS
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for use in product pages
window.productReviewsHelper = productReviewsHelper;

