// Firebase Message Helper
// Ensures messages are always saved to Firebase and never to localStorage
// This ensures messages are visible across all devices

(function() {
    'use strict';
    
    // Maximum retries for Firebase operations
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    // Wait for Firebase to be ready (simplified)
    function waitForFirebase(maxWait = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function checkFirebase() {
                if (typeof window.firebaseDb !== 'undefined' && window.firebaseDb && window.firebaseDb.ref) {
                    resolve(window.firebaseDb);
                } else {
                    if (Date.now() - startTime > maxWait) {
                        reject(new Error('Firebase database not initialized. Make sure firebase-config.js is loaded.'));
                    } else {
                        setTimeout(checkFirebase, 100);
                    }
                }
            }
            
            checkFirebase();
        });
    }
    
    // Save message to Firebase with retry logic
    async function saveMessageToFirebase(messageData, retries = MAX_RETRIES) {
        try {
            // Wait for Firebase to be ready
            const database = await waitForFirebase();
            
            console.log('💾 Saving message to Firebase...', messageData);
            
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
                read: false,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    timestamp: Date.now()
                }
            };
            
            await messageRef.set(message);
            
            console.log('✅ Message saved to Firebase successfully:', messageRef.key);
            console.log('✅ Message will be visible on all devices');
            
            return { 
                success: true, 
                messageId: messageRef.key,
                savedToFirebase: true
            };
        } catch (error) {
            console.error('❌ Error saving message to Firebase:', error);
            
            // Retry if we have retries left and it's not a permission error
            if (retries > 0 && error.code !== 'PERMISSION_DENIED') {
                console.log(`⏳ Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return saveMessageToFirebase(messageData, retries - 1);
            }
            
            // If it's a permission error, don't retry
            if (error.code === 'PERMISSION_DENIED') {
                console.error('⚠️ PERMISSION_DENIED: Firebase database rules need to be updated');
                throw new Error('PERMISSION_DENIED: Please update Firebase database rules to allow writing to contactMessages. See FIREBASE_RULES_FOR_CONTACT_MESSAGES.md for instructions.');
            }
            
            throw error;
        }
    }
    
    // Public API
    window.firebaseMessageHelper = {
        // Save contact message (always to Firebase, never localStorage)
        saveContactMessage: async function(messageData) {
            try {
                const result = await saveMessageToFirebase(messageData);
                return result;
            } catch (error) {
                // Don't fall back to localStorage - throw error instead
                // This ensures user knows there's an issue and messages aren't lost silently
                console.error('❌ Failed to save message to Firebase after all retries');
                throw error;
            }
        },
        
        // Check if Firebase is available
        isFirebaseAvailable: async function() {
            try {
                await waitForFirebase(2000);
                return true;
            } catch (error) {
                return false;
            }
        },
        
        // Get Firebase database instance
        getDatabase: async function() {
            return await waitForFirebase();
        }
    };
    
    console.log('✅ Firebase Message Helper loaded');
})();

