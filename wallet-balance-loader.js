// ⚡ OPTIMIZED WALLET BALANCE LOADER - Works on ALL pages
// Fast loading with caching, preloading, and parallel requests

(function() {
    'use strict';

    // Global wallet balance manager
    window.WalletBalanceLoader = {
        // Cache configuration
        CACHE_DURATION: 5000, // 5 seconds
        loadPromise: null,
        lastBalance: null,

        // Get cache key for user
        getCacheKey: function(userId) {
            return 'walletBalance_' + userId;
        },

        getCacheTimeKey: function(userId) {
            return 'walletBalance_time_' + userId;
        },

        // Get cached balance if valid
        getCachedBalance: function(userId) {
            const cached = localStorage.getItem(this.getCacheKey(userId));
            const cacheTime = localStorage.getItem(this.getCacheTimeKey(userId));
            const now = Date.now();

            if (cached && cacheTime && (now - parseInt(cacheTime)) < this.CACHE_DURATION) {
                return parseFloat(cached);
            }
            return null;
        },

        // Set cache
        setCachedBalance: function(userId, balance) {
            localStorage.setItem(this.getCacheKey(userId), balance.toString());
            localStorage.setItem(this.getCacheTimeKey(userId), Date.now().toString());
        },

        // Format balance for display
        formatBalance: function(balance) {
            return '₹' + parseFloat(balance).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        // Update balance display on page
        updateBalanceDisplay: function(balance, elementId = 'walletBalance') {
            const balanceElement = document.getElementById(elementId);
            if (balanceElement) {
                balanceElement.textContent = this.formatBalance(balance);
                this.lastBalance = balance;
            }
        },

        // Show loading state
        showLoading: function(elementId = 'walletBalance') {
            const balanceElement = document.getElementById(elementId);
            if (balanceElement) {
                balanceElement.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 0.9em;"></i>';
            }
        },

        // Load balance from Firebase (optimized)
        loadBalance: async function(userId, elementId = 'walletBalance', showCache = true) {
            const startTime = performance.now();

            try {
                // Check if already loading
                if (this.loadPromise) {
                    console.log('⚡ Using existing wallet load promise...');
                    return await this.loadPromise;
                }

                // Show loading state
                this.showLoading(elementId);

                // Check cache first
                const cachedBalance = this.getCachedBalance(userId);
                if (cachedBalance !== null && showCache) {
                    console.log('⚡ Showing cached balance:', cachedBalance);
                    this.updateBalanceDisplay(cachedBalance, elementId);
                }

                // Start loading (only once, even if called multiple times)
                this.loadPromise = dbHelper.getUserWallet(userId);
                
                const walletData = await this.loadPromise;
                const balance = walletData.balance || 0;

                // Update display
                this.updateBalanceDisplay(balance, elementId);

                // Update cache
                this.setCachedBalance(userId, balance);

                const loadTime = (performance.now() - startTime).toFixed(0);
                console.log(`⚡ Wallet balance loaded in ${loadTime}ms`);

                // Clear promise
                this.loadPromise = null;

                return balance;

            } catch (error) {
                console.error('Error loading wallet balance:', error);
                this.updateBalanceDisplay(0, elementId);
                this.loadPromise = null;
                return 0;
            }
        },

        // Preload balance (call this early!)
        preloadBalance: function(userId) {
            if (!userId || !window.dbHelper) return;
            
            console.log('⚡ Preloading wallet balance...');
            
            // Start loading but don't wait for it
            this.loadPromise = dbHelper.getUserWallet(userId).catch(error => {
                console.error('Preload error:', error);
                return { balance: 0 };
            });
        },

        // Quick setup for any page
        quickSetup: async function(elementId = 'walletBalance') {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            if (!userData.isLoggedIn || !userData.uid) {
                return null;
            }

            // Wait for dbHelper to be available
            if (typeof dbHelper === 'undefined') {
                console.warn('dbHelper not yet available, waiting...');
                await this.waitForDbHelper();
            }

            return await this.loadBalance(userData.uid, elementId);
        },

        // Wait for dbHelper to be available
        waitForDbHelper: function() {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (typeof dbHelper !== 'undefined') {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);

                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 5000);
            });
        },

        // Auto-init when script loads
        autoInit: function() {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            if (userData.isLoggedIn && userData.uid) {
                // Wait a tiny bit for dbHelper to load
                setTimeout(() => {
                    if (typeof dbHelper !== 'undefined') {
                        this.preloadBalance(userData.uid);
                    }
                }, 100);
            }
        }
    };

    // Auto-start preloading when script loads
    WalletBalanceLoader.autoInit();

    // Auto-load balance when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const walletBalanceElement = document.getElementById('walletBalance');
        
        if (walletBalanceElement && userData.isLoggedIn && userData.uid) {
            console.log('⚡ Auto-loading wallet balance in header...');
            await WalletBalanceLoader.quickSetup('walletBalance');
        }
    });

})();

