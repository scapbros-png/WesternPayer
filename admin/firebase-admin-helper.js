// Firebase Admin Helper Functions
// These functions help the admin panel read data from all users

const adminHelper = {
    // Get all payment requests from all users
    getAllPaymentRequests: async function() {
        try {
            const database = window.firebaseDb;
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            
            const allRequests = [];
            
            Object.keys(users).forEach(userId => {
                const user = users[userId];
                if (user.paymentRequests) {
                    Object.values(user.paymentRequests).forEach(request => {
                        allRequests.push({
                            ...request,
                            userId: userId,
                            userName: user.profile?.name || 'Unknown',
                            userEmail: user.profile?.email || 'Unknown'
                        });
                    });
                }
            });
            
            return allRequests;
        } catch (error) {
            console.error('Error getting payment requests:', error);
            return [];
        }
    },

    // Get all withdrawal requests from all users
    getAllWithdrawalRequests: async function() {
        try {
            const database = window.firebaseDb;
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            
            const allRequests = [];
            
            Object.keys(users).forEach(userId => {
                const user = users[userId];
                if (user.withdrawalRequests) {
                    Object.values(user.withdrawalRequests).forEach(request => {
                        allRequests.push({
                            ...request,
                            userId: userId,
                            userName: user.profile?.name || 'Unknown',
                            userEmail: user.profile?.email || 'Unknown'
                        });
                    });
                }
            });
            
            return allRequests;
        } catch (error) {
            console.error('Error getting withdrawal requests:', error);
            return [];
        }
    },

    // Get all users
    getAllUsers: async function() {
        try {
            const database = window.firebaseDb;
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            
            const userList = [];
            
            Object.keys(users).forEach(userId => {
                const user = users[userId];
                userList.push({
                    userId: userId,
                    profile: user.profile || {},
                    wallet: user.wallet || { balance: 0 },
                    paymentRequestsCount: user.paymentRequests ? Object.keys(user.paymentRequests).length : 0,
                    withdrawalRequestsCount: user.withdrawalRequests ? Object.keys(user.withdrawalRequests).length : 0
                });
            });
            
            return userList;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },

    // Approve payment request and add money to user's wallet
    approvePaymentRequest: async function(userId, requestId, amount) {
        try {
            const database = window.firebaseDb;
            
            // Update payment request status
            await database.ref(`users/${userId}/paymentRequests/${requestId}/status`).set('approved');
            await database.ref(`users/${userId}/paymentRequests/${requestId}/approvedAt`).set(firebase.database.ServerValue.TIMESTAMP);
            
            // Get current wallet balance
            const balanceSnapshot = await database.ref(`users/${userId}/wallet/balance`).once('value');
            const currentBalance = balanceSnapshot.val() || 0;
            const newBalance = currentBalance + parseFloat(amount);
            
            // Update wallet balance
            await database.ref(`users/${userId}/wallet/balance`).set(newBalance);
            
            // Add transaction to wallet
            const transactionRef = database.ref(`users/${userId}/wallet/transactions`).push();
            await transactionRef.set({
                id: transactionRef.key,
                type: 'add',
                amount: parseFloat(amount),
                balance: newBalance,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                source: 'admin_approved'
            });
            
            return true;
        } catch (error) {
            console.error('Error approving payment request:', error);
            return false;
        }
    },

    // Reject payment request
    rejectPaymentRequest: async function(userId, requestId) {
        try {
            const database = window.firebaseDb;
            
            await database.ref(`users/${userId}/paymentRequests/${requestId}/status`).set('rejected');
            await database.ref(`users/${userId}/paymentRequests/${requestId}/rejectedAt`).set(firebase.database.ServerValue.TIMESTAMP);
            
            return true;
        } catch (error) {
            console.error('Error rejecting payment request:', error);
            return false;
        }
    },

    // Process withdrawal request
    processWithdrawalRequest: async function(userId, requestId, status) {
        try {
            const database = window.firebaseDb;
            
            await database.ref(`users/${userId}/withdrawalRequests/${requestId}/status`).set(status);
            await database.ref(`users/${userId}/withdrawalRequests/${requestId}/processedAt`).set(firebase.database.ServerValue.TIMESTAMP);
            
            return true;
        } catch (error) {
            console.error('Error processing withdrawal request:', error);
            return false;
        }
    },

    // Approve withdrawal request
    approveWithdrawalRequest: async function(userId, requestId) {
        try {
            const database = window.firebaseDb;
            
            await database.ref(`users/${userId}/withdrawalRequests/${requestId}/status`).set('approved');
            await database.ref(`users/${userId}/withdrawalRequests/${requestId}/approvedAt`).set(firebase.database.ServerValue.TIMESTAMP);
            
            console.log(`✅ Withdrawal ${requestId} approved for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error approving withdrawal request:', error);
            return false;
        }
    },

    // Reject withdrawal request
    rejectWithdrawalRequest: async function(userId, requestId) {
        try {
            const database = window.firebaseDb;
            
            await database.ref(`users/${userId}/withdrawalRequests/${requestId}/status`).set('rejected');
            await database.ref(`users/${userId}/withdrawalRequests/${requestId}/rejectedAt`).set(firebase.database.ServerValue.TIMESTAMP);
            
            console.log(`❌ Withdrawal ${requestId} rejected for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error rejecting withdrawal request:', error);
            return false;
        }
    },

    // Find user by email
    findUserByEmail: async function(email) {
        try {
            const database = window.firebaseDb;
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            
            // Search through all users to find matching email
            for (const userId in users) {
                const user = users[userId];
                if (user.profile && user.profile.email === email) {
                    return { userId: userId, profile: user.profile };
                }
            }
            
            return null; // User not found
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    },

    // Send message to customer
    sendMessageToCustomer: async function(email, customerName, subject, message) {
        try {
            const database = window.firebaseDb;
            
            // Try to find user by email
            const user = await this.findUserByEmail(email);
            
            const messageData = {
                from: 'admin',
                to: email,
                customerName: customerName,
                subject: subject || 'Message from Western Payer',
                message: message,
                read: false,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            if (user && user.userId) {
                // User is registered - store in their notifications
                const notificationRef = database.ref(`users/${user.userId}/notifications`).push();
                await notificationRef.set({
                    ...messageData,
                    id: notificationRef.key
                });
                console.log(`✅ Message sent to registered user: ${user.userId}`);
                return { success: true, isRegisteredUser: true, userId: user.userId };
            } else {
                // Visitor - store in adminMessages by email
                // Replace email dots with underscores for Firebase key compatibility
                const emailKey = email.replace(/\./g, '_').replace(/@/g, '_at_');
                const messageRef = database.ref(`adminMessages/${emailKey}`).push();
                await messageRef.set({
                    ...messageData,
                    id: messageRef.key
                });
                console.log(`✅ Message sent to visitor: ${email}`);
                return { success: true, isRegisteredUser: false, email: email };
            }
        } catch (error) {
            console.error('Error sending message to customer:', error);
            return { success: false, error: error.message };
        }
    },

    // Send message to all users
    sendMessageToAllUsers: async function(subject, message) {
        try {
            const database = window.firebaseDb;
            
            // Get all users
            const users = await this.getAllUsers();
            
            if (users.length === 0) {
                return { success: false, error: 'No users found' };
            }
            
            const messageData = {
                from: 'admin',
                to: 'all_users',
                customerName: 'All Users',
                subject: subject || 'Message from Western Payer',
                message: message,
                read: false,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            let successCount = 0;
            let errorCount = 0;
            
            // Send message to each user
            for (const user of users) {
                try {
                    const userEmail = user.profile?.email;
                    if (userEmail) {
                        const notificationRef = database.ref(`users/${user.userId}/notifications`).push();
                        await notificationRef.set({
                            ...messageData,
                            to: userEmail,
                            customerName: user.profile?.name || 'User',
                            id: notificationRef.key
                        });
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Error sending message to user ${user.userId}:`, error);
                    errorCount++;
                }
            }
            
            console.log(`✅ Message sent to ${successCount} users, ${errorCount} errors`);
            return { 
                success: true, 
                sentCount: successCount, 
                errorCount: errorCount,
                totalUsers: users.length
            };
        } catch (error) {
            console.error('Error sending message to all users:', error);
            return { success: false, error: error.message };
        }
    },

    // Block user
    blockUser: async function(userId) {
        try {
            const database = window.firebaseDb;
            await database.ref(`users/${userId}/profile/isBlocked`).set(true);
            await database.ref(`users/${userId}/profile/blockedAt`).set(firebase.database.ServerValue.TIMESTAMP);
            console.log(`🚫 User ${userId} blocked`);
            return { success: true };
        } catch (error) {
            console.error('Error blocking user:', error);
            return { success: false, error: error.message };
        }
    },

    // Unblock user
    unblockUser: async function(userId) {
        try {
            const database = window.firebaseDb;
            await database.ref(`users/${userId}/profile/isBlocked`).set(false);
            await database.ref(`users/${userId}/profile/unblockedAt`).set(firebase.database.ServerValue.TIMESTAMP);
            console.log(`✅ User ${userId} unblocked`);
            return { success: true };
        } catch (error) {
            console.error('Error unblocking user:', error);
            return { success: false, error: error.message };
        }
    },

    // Remove/Delete user
    removeUser: async function(userId) {
        try {
            const database = window.firebaseDb;
            await database.ref(`users/${userId}`).remove();
            console.log(`🗑️ User ${userId} removed`);
            return { success: true };
        } catch (error) {
            console.error('Error removing user:', error);
            return { success: false, error: error.message };
        }
    },

    // Add money to user wallet (admin action)
    addMoneyToWallet: async function(userId, amount, reason = 'Admin credit') {
        try {
            const database = window.firebaseDb;
            
            // Get current balance
            const balanceSnapshot = await database.ref(`users/${userId}/wallet/balance`).once('value');
            const currentBalance = balanceSnapshot.val() || 0;
            const newBalance = currentBalance + parseFloat(amount);
            
            // Update wallet balance
            await database.ref(`users/${userId}/wallet/balance`).set(newBalance);
            
            // Add transaction
            const transactionRef = database.ref(`users/${userId}/wallet/transactions`).push();
            await transactionRef.set({
                id: transactionRef.key,
                type: 'add',
                amount: parseFloat(amount),
                balance: newBalance,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                source: 'admin_credit',
                reason: reason,
                adminAction: true
            });
            
            console.log(`💰 Added ₹${amount} to user ${userId}`);
            return { success: true, newBalance: newBalance };
        } catch (error) {
            console.error('Error adding money to wallet:', error);
            return { success: false, error: error.message };
        }
    },

    // Withdraw money from user wallet (admin action)
    withdrawMoneyFromWallet: async function(userId, amount, reason = 'Admin debit') {
        try {
            const database = window.firebaseDb;
            
            // Get current balance
            const balanceSnapshot = await database.ref(`users/${userId}/wallet/balance`).once('value');
            const currentBalance = balanceSnapshot.val() || 0;
            
            if (currentBalance < parseFloat(amount)) {
                return { success: false, error: 'Insufficient balance' };
            }
            
            const newBalance = currentBalance - parseFloat(amount);
            
            // Update wallet balance
            await database.ref(`users/${userId}/wallet/balance`).set(newBalance);
            
            // Add transaction
            const transactionRef = database.ref(`users/${userId}/wallet/transactions`).push();
            await transactionRef.set({
                id: transactionRef.key,
                type: 'withdraw',
                amount: parseFloat(amount),
                balance: newBalance,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                source: 'admin_debit',
                reason: reason,
                adminAction: true
            });
            
            console.log(`💸 Withdrew ₹${amount} from user ${userId}`);
            return { success: true, newBalance: newBalance };
        } catch (error) {
            console.error('Error withdrawing money from wallet:', error);
            return { success: false, error: error.message };
        }
    },

    // Save contact message to Firebase
    saveContactMessage: async function(messageData) {
        try {
            const database = window.firebaseDb;
            if (!database) {
                console.error('❌ Firebase database not initialized');
                throw new Error('Firebase database not initialized');
            }
            
            console.log('💾 Saving contact message to Firebase...', messageData);
            const messageRef = database.ref('contactMessages').push();
            
            const message = {
                id: messageRef.key,
                name: messageData.name || 'Unknown',
                email: messageData.email || '',
                userId: messageData.userId || null,
                phone: messageData.phone || null,
                message: messageData.message || '',
                source: messageData.source || 'contact',
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                read: false
            };
            
            await messageRef.set(message);
            console.log('✅ Contact message saved to Firebase:', messageRef.key);
            console.log('✅ Message data:', message);
            return { success: true, messageId: messageRef.key };
        } catch (error) {
            console.error('❌ Error saving contact message:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // If it's a permission error, show a helpful message
            if (error.code === 'PERMISSION_DENIED') {
                console.error('⚠️ PERMISSION DENIED: Check Firebase database rules!');
                console.error('Make sure contactMessages path is writable in Firebase rules');
            }
            
            return { success: false, error: error.message };
        }
    },

    // Get all contact messages from Firebase
    getAllContactMessages: async function() {
        try {
            const database = window.firebaseDb;
            if (!database) {
                console.error('❌ Firebase database not initialized');
                throw new Error('Firebase database not initialized');
            }
            
            console.log('📧 Fetching contact messages from Firebase...');
            const messagesSnapshot = await database.ref('contactMessages').once('value');
            const messages = messagesSnapshot.val();
            
            console.log('📧 Raw messages data:', messages);
            
            if (!messages) {
                console.log('ℹ️ No messages found in Firebase');
                return [];
            }
            
            const messageList = [];
            Object.keys(messages).forEach(messageId => {
                const message = messages[messageId];
                // Handle both Firebase timestamp objects and regular numbers
                let timestamp = message.timestamp;
                if (timestamp && typeof timestamp === 'object' && timestamp.constructor.name === 'Object') {
                    // Firebase timestamp object, convert to number
                    timestamp = timestamp.val ? timestamp.val() : Date.now();
                } else if (!timestamp || isNaN(timestamp)) {
                    timestamp = Date.now();
                }
                
                messageList.push({
                    id: messageId,
                    name: message.name || 'Unknown',
                    email: message.email || '',
                    userId: message.userId || null,
                    phone: message.phone || null,
                    message: message.message || '',
                    source: message.source || 'contact',
                    read: message.read !== undefined ? message.read : false,
                    timestamp: timestamp
                });
            });
            
            // Sort by timestamp (newest first)
            messageList.sort((a, b) => b.timestamp - a.timestamp);
            
            console.log(`✅ Found ${messageList.length} contact messages`);
            return messageList;
        } catch (error) {
            console.error('❌ Error getting contact messages:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // If it's a permission error, show a helpful message
            if (error.code === 'PERMISSION_DENIED') {
                console.error('⚠️ PERMISSION DENIED: Check Firebase database rules!');
                console.error('Make sure contactMessages path is readable in Firebase rules');
            }
            
            return [];
        }
    },

    // Mark message as read
    markMessageAsRead: async function(messageId) {
        try {
            const database = window.firebaseDb;
            await database.ref(`contactMessages/${messageId}/read`).set(true);
            return { success: true };
        } catch (error) {
            console.error('Error marking message as read:', error);
            return { success: false, error: error.message };
        }
    },

    // ========== PRODUCT REVIEWS MANAGEMENT ==========

    // Get all reviews for all products
    getAllProductReviews: async function() {
        try {
            const database = window.firebaseDb;
            const reviewsSnapshot = await database.ref('productReviews').once('value');
            const reviewsData = reviewsSnapshot.val() || {};

            const allReviews = [];
            
            Object.keys(reviewsData).forEach(productId => {
                const product = reviewsData[productId];
                if (product.reviews) {
                    Object.keys(product.reviews).forEach(reviewId => {
                        const review = product.reviews[reviewId];
                        let timestamp = review.timestamp;
                        if (timestamp && typeof timestamp === 'object') {
                            timestamp = timestamp.val ? timestamp.val() : Date.now();
                        } else if (!timestamp || isNaN(timestamp)) {
                            timestamp = Date.now();
                        }

                        allReviews.push({
                            id: reviewId,
                            productId: productId,
                            rating: review.rating || 5,
                            review: review.review || '',
                            customerName: review.customerName || 'Anonymous',
                            timestamp: timestamp,
                            approved: review.approved !== false,
                            submittedBy: review.submittedBy || 'admin',
                            userId: review.userId || null
                        });
                    });
                }
            });

            // Sort by timestamp (newest first)
            allReviews.sort((a, b) => b.timestamp - a.timestamp);
            return allReviews;
        } catch (error) {
            console.error('Error getting all product reviews:', error);
            return [];
        }
    },

    // Get reviews for a specific product
    getProductReviews: async function(productId) {
        try {
            const database = window.firebaseDb;
            const reviewsSnapshot = await database.ref(`productReviews/${productId}/reviews`).once('value');
            const reviews = reviewsSnapshot.val() || {};

            const reviewList = [];
            Object.keys(reviews).forEach(reviewId => {
                const review = reviews[reviewId];
                let timestamp = review.timestamp;
                if (timestamp && typeof timestamp === 'object') {
                    timestamp = timestamp.val ? timestamp.val() : Date.now();
                } else if (!timestamp || isNaN(timestamp)) {
                    timestamp = Date.now();
                }

                reviewList.push({
                    id: reviewId,
                    productId: productId,
                    rating: review.rating || 5,
                    review: review.review || '',
                    customerName: review.customerName || 'Anonymous',
                    timestamp: timestamp,
                    approved: review.approved !== false
                });
            });

            // Sort by timestamp (newest first)
            reviewList.sort((a, b) => b.timestamp - a.timestamp);
            return reviewList;
        } catch (error) {
            console.error('Error getting product reviews:', error);
            return [];
        }
    },

    // Add a new review (admin can add reviews)
    addProductReview: async function(productId, reviewData) {
        try {
            const database = window.firebaseDb;
            const reviewRef = database.ref(`productReviews/${productId}/reviews`).push();

            const review = {
                id: reviewRef.key,
                rating: parseInt(reviewData.rating) || 5,
                review: reviewData.review || '',
                customerName: reviewData.customerName || 'Anonymous',
                approved: reviewData.approved !== false,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                addedBy: 'admin'
            };

            await reviewRef.set(review);
            console.log(`✅ Review added for product ${productId}`);
            return { success: true, reviewId: reviewRef.key };
        } catch (error) {
            console.error('Error adding product review:', error);
            return { success: false, error: error.message };
        }
    },

    // Update a review
    updateProductReview: async function(productId, reviewId, reviewData) {
        try {
            const database = window.firebaseDb;
            const updates = {};

            if (reviewData.rating !== undefined) {
                updates[`productReviews/${productId}/reviews/${reviewId}/rating`] = parseInt(reviewData.rating);
            }
            if (reviewData.review !== undefined) {
                updates[`productReviews/${productId}/reviews/${reviewId}/review`] = reviewData.review;
            }
            if (reviewData.customerName !== undefined) {
                updates[`productReviews/${productId}/reviews/${reviewId}/customerName`] = reviewData.customerName;
            }
            if (reviewData.approved !== undefined) {
                updates[`productReviews/${productId}/reviews/${reviewId}/approved`] = reviewData.approved;
            }

            await database.ref().update(updates);
            console.log(`✅ Review ${reviewId} updated`);
            return { success: true };
        } catch (error) {
            console.error('Error updating product review:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete a review
    deleteProductReview: async function(productId, reviewId) {
        try {
            const database = window.firebaseDb;
            await database.ref(`productReviews/${productId}/reviews/${reviewId}`).remove();
            console.log(`🗑️ Review ${reviewId} deleted`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting product review:', error);
            return { success: false, error: error.message };
        }
    },

    // Approve a review
    approveProductReview: async function(productId, reviewId) {
        try {
            const database = window.firebaseDb;
            await database.ref(`productReviews/${productId}/reviews/${reviewId}/approved`).set(true);
            console.log(`✅ Review ${reviewId} approved`);
            return { success: true };
        } catch (error) {
            console.error('Error approving product review:', error);
            return { success: false, error: error.message };
        }
    },

    // Get list of all products
    getProductList: function() {
        return [
            { id: 'bajaj-card', name: 'Bajaj Finserv Insta EMI Card' },
            { id: 'lazypay', name: 'LazyPay' },
            { id: 'credit-card', name: 'Credit Card' },
            { id: 'home-credit', name: 'Home Credit Ujjwak EMI Card' },
            { id: 'axio', name: 'Axio' },
            { id: 'idfc-buy-emi', name: 'IDFC Buy EMI Card' },
            { id: 'hdfc-easyemi', name: 'HDFC EasyEMI Card' },
            { id: 'zest-money', name: 'Zest Money' },
            { id: 'mobikwik-zip', name: 'Mobikwik Zip Pay Later' },
            { id: 'amazon-pay-later', name: 'Amazon Pay Later Withdrawal' }
        ];
    }
};

// Export for use in admin dashboard
window.adminHelper = adminHelper;

