// Firebase Configuration and Initialization
// Replace these values with your actual Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyAqrGvvVVr9Y6_rm504PRDgxGdjlxs4woQ",
    authDomain: "westernpayer.firebaseapp.com",
    databaseURL: "https://westernpayer-default-rtdb.firebaseio.com",  // ← ADDED THIS!
    projectId: "westernpayer",
    storageBucket: "westernpayer.firebasestorage.app",
    messagingSenderId: "1085613521369",
    appId: "1:1085613521369:web:74c3fef25a26b983c881c8",
    measurementId: "G-BLTMXZTQV7"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Enable offline persistence for faster loading (data cached locally)
try {
    database.goOnline(); // Ensure we're online
    // Note: Realtime Database automatically caches data locally
} catch (error) {
    console.warn('Offline persistence setup:', error);
}

// Helper Functions for Database Operations
const dbHelper = {
    // Get user wallet data (OPTIMIZED)
    getUserWallet: async function(userId) {
        try {
            // Use .once() with 'value' event for faster single read
            const snapshot = await database.ref('users/' + userId + '/wallet/balance').once('value');
            const balance = snapshot.val() || 0;
            return { balance: balance, transactions: [] };
        } catch (error) {
            console.error('Error getting user wallet:', error);
            return { balance: 0, transactions: [] };
        }
    },

    // Update wallet balance
    updateWalletBalance: async function(userId, newBalance) {
        try {
            await database.ref('users/' + userId + '/wallet/balance').set(newBalance);
            return true;
        } catch (error) {
            console.error('Error updating wallet balance:', error);
            return false;
        }
    },

    // Add transaction
    addTransaction: async function(userId, transaction) {
        try {
            const transactionRef = database.ref('users/' + userId + '/wallet/transactions').push();
            await transactionRef.set({
                ...transaction,
                id: transactionRef.key,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            return true;
        } catch (error) {
            console.error('Error adding transaction:', error);
            return false;
        }
    },

    // Get transactions
    getTransactions: async function(userId, limit = 10) {
        try {
            const snapshot = await database.ref('users/' + userId + '/wallet/transactions')
                .orderByChild('timestamp')
                .limitToLast(limit)
                .once('value');
            
            const transactions = [];
            snapshot.forEach(child => {
                transactions.push(child.val());
            });
            return transactions.reverse(); // Most recent first
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },

    // Add withdrawal request
    addWithdrawalRequest: async function(userId, withdrawalData) {
        try {
            const requestRef = database.ref('users/' + userId + '/withdrawalRequests').push();
            await requestRef.set({
                ...withdrawalData,
                id: requestRef.key,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            return true;
        } catch (error) {
            console.error('Error adding withdrawal request:', error);
            return false;
        }
    },

    // Get user profile
    getUserProfile: async function(userId) {
        try {
            const snapshot = await database.ref('users/' + userId + '/profile').once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    },

    // Update user profile
    updateUserProfile: async function(userId, profileData) {
        try {
            await database.ref('users/' + userId + '/profile').update(profileData);
            return true;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
    },

    // Create new user profile
    createUserProfile: async function(userId, profileData) {
        try {
            await database.ref('users/' + userId).set({
                profile: {
                    ...profileData,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                },
                wallet: {
                    balance: 0,
                    transactions: {}
                },
                withdrawalRequests: {},
                orders: {}
            });
            return true;
        } catch (error) {
            console.error('Error creating user profile:', error);
            return false;
        }
    },

    // Add order
    addOrder: async function(userId, orderData) {
        try {
            console.log('addOrder called with userId:', userId);
            console.log('addOrder data:', orderData);
            
            // Validate inputs
            if (!userId) {
                throw new Error('userId is required');
            }
            
            if (!database || !database.ref) {
                throw new Error('Firebase database not initialized');
            }
            
            const orderRef = database.ref('orders/' + userId).push();
            console.log('Order reference created:', orderRef.key);
            
            const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
            console.log('Generated orderId:', orderId);
            
            const orderToSave = {
                ...orderData,
                orderId: orderId,
                orderKey: orderRef.key,
                orderDate: new Date().toISOString(),
                status: 'pending',
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            console.log('Attempting to save order:', orderToSave);
            await orderRef.set(orderToSave);
            
            console.log('Order saved successfully!');
            return { success: true, orderId: orderId, orderKey: orderRef.key };
        } catch (error) {
            console.error('❌ Error adding order:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            return { success: false, error: error.message || 'Unknown error occurred' };
        }
    },

    // Get user orders
    getUserOrders: async function(userId) {
        try {
            const snapshot = await database.ref('orders/' + userId).once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting user orders:', error);
            return {};
        }
    },

    // Get all orders (for admin)
    getAllOrders: async function() {
        try {
            const snapshot = await database.ref('orders').once('value');
            const ordersData = snapshot.val() || {};
            
            // Flatten orders by user
            const allOrders = [];
            Object.keys(ordersData).forEach(userId => {
                const userOrders = ordersData[userId];
                Object.keys(userOrders).forEach(orderKey => {
                    allOrders.push({
                        ...userOrders[orderKey],
                        userId: userId,
                        orderKey: orderKey
                    });
                });
            });
            
            return allOrders;
        } catch (error) {
            console.error('Error getting all orders:', error);
            return [];
        }
    },

    // Update order status (for admin)
    updateOrderStatus: async function(userId, orderKey, status, adminNote = '') {
        try {
            await database.ref('orders/' + userId + '/' + orderKey).update({
                status: status,
                statusUpdatedAt: new Date().toISOString(),
                adminNote: adminNote,
                statusTimestamp: firebase.database.ServerValue.TIMESTAMP
            });
            return true;
        } catch (error) {
            console.error('Error updating order status:', error);
            return false;
        }
    }
};

// Auth State Observer
auth.onAuthStateChanged(async function(user) {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.uid);
        
        // Update localStorage with current user (for backward compatibility)
        const profile = await dbHelper.getUserProfile(user.uid);
        if (profile) {
            localStorage.setItem('userData', JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: profile.name || user.email.split('@')[0],
                isLoggedIn: true,
                ...profile
            }));
        }
    } else {
        // User is signed out
        console.log('User is signed out');
        localStorage.removeItem('userData');
    }
});

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDb = database;
window.dbHelper = dbHelper;

