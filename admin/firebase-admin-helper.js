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
    }
};

// Export for use in admin dashboard
window.adminHelper = adminHelper;

