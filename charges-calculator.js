// Charges Calculator - Inject link and modal across pages
document.addEventListener('DOMContentLoaded', function() {
    try {
        const profileMenu = document.getElementById('profileMenu');
        const profileBtn = document.getElementById('profileBtn');
        if (!profileMenu || !profileBtn) return;

        // Add link if missing
        let openLink = document.getElementById('openChargesCalc');
        if (!openLink) {
            openLink = document.createElement('a');
            openLink.href = '#';
            openLink.className = 'profile-link';
            openLink.id = 'openChargesCalc';
            openLink.innerHTML = '<i class="fas fa-calculator"></i> Calculate Charges';
            // Insert above logout if available (inside profile menu)
            const logoutAnchor = document.getElementById('logoutBtn');
            if (logoutAnchor && profileMenu.contains(logoutAnchor)) {
                profileMenu.insertBefore(openLink, logoutAnchor);
            } else {
                profileMenu.appendChild(openLink);
            }
        }

        // Ensure modal exists
        let modal = document.getElementById('chargesCalcModal');
        if (!modal) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
            <div class="modal-overlay" id="chargesCalcModal" style="display:none;">
                <div class="modal">
                    <div class="modal-header">
                        <h3>Calculate Charges</h3>
                        <button class="modal-close" id="closeChargesCalc" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form class="calc-form" id="chargesCalcForm">
                            <div class="form-group" style="margin-bottom: 0.75rem;">
                                <label for="productSelect">Product</label>
                                <select id="productSelect" style="width:100%; padding: 0.875rem; border: 2px solid rgba(96, 165, 250, 0.3); border-radius: 10px; background: rgba(30, 41, 59, 0.8); color: #f1f5f9;">
                                    <option value="generic" selected>Select Product</option>
                                    <option value="bajaj">Bajaj Insta EMI Card</option>
                                    <option value="hdfc_easyemi">HDFC EasyEMI Card</option>
                                    <option value="home_credit">Home Credit Ujjwal Card</option>
                                    <option value="zestmoney">ZestMoney</option>
                                    <option value="axio">Axio</option>
                                    <option value="idfc_buy_emi">IDFC Buy EMI Card</option>
                                    <option value="lazypay">LazyPay</option>
                                    <option value="mobikwik_zip">MobiKwik Zip</option>
                                    <option value="credit_card">Credit Card Withdrawal</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="withdrawAmount">Withdrawal amount (₹)</label>
                                    <input type="number" id="withdrawAmount" min="0" step="0.01" placeholder="Enter amount" required>
                                </div>
                                <div class="form-group">
                                    <label for="chargeRate">Charge rate (%)</label>
                                    <input type="number" id="chargeRate" min="0" max="100" step="0.01" value="7.25" required>
                                </div>
                            </div>
                            <button type="submit" class="btn-primary" style="width:100%; margin-top: 0.5rem;">Calculate</button>
                        </form>
                        <div class="calc-result" id="calcResult" style="display:none;">
                            <div class="result-row">
                                <span id="resGstLabel">GST (18%)</span>
                                <strong id="resGst">₹0.00</strong>
                            </div>
                            <div class="result-row">
                                <span>Charges</span>
                                <strong id="resCharges">₹0.00</strong>
                            </div>
                            <div class="result-row total">
                                <span>Payable amount</span>
                                <strong id="resNet">₹0.00</strong>
                            </div>
                            <p class="result-note">Note: Charge auto-fills by product (default 7.25%, Credit Card 0.5%). GST is 18% except Credit Card 5%.</p>
                        </div>
                    </div>
                </div>
            </div>`;
            modal = wrapper.firstElementChild;
            document.body.appendChild(modal);
        }

        // Wiring
        const calcModal = document.getElementById('chargesCalcModal');
        const closeCalc = document.getElementById('closeChargesCalc');
        const calcForm = document.getElementById('chargesCalcForm');
        const productSelect = document.getElementById('productSelect');
        const withdrawAmount = document.getElementById('withdrawAmount');
        const chargeRate = document.getElementById('chargeRate');
        const calcResult = document.getElementById('calcResult');
        const resCharges = document.getElementById('resCharges');
        const resGst = document.getElementById('resGst');
        const resGstLabel = document.getElementById('resGstLabel');
        const resNet = document.getElementById('resNet');

        const productRates = {
            generic: 7.25,
            bajaj: 7.25,
            hdfc_easyemi: 7.25,
            home_credit: 7.25,
            zestmoney: 7.25,
            axio: 7.25,
            idfc_buy_emi: 7.25,
            lazypay: 7.25,
            mobikwik_zip: 7.25,
            credit_card: 0.5
        };

        const productMinimums = {
            generic: 1000,
            bajaj: 30000,
            hdfc_easyemi: 20000,
            home_credit: 20000,
            zestmoney: 30000,
            axio: 5000,
            idfc_buy_emi: 20000,
            lazypay: 10000,
            mobikwik_zip: 20000,
            credit_card: 20000
        };

        function applyProductMinimum(key) {
            const minAmt = productMinimums[key] != null ? productMinimums[key] : productMinimums.generic;
            withdrawAmount.min = String(minAmt);
            withdrawAmount.placeholder = 'Minimum ₹' + minAmt.toLocaleString();
            const current = parseFloat(withdrawAmount.value || '0');
            if (!current || current < minAmt) {
                withdrawAmount.value = String(minAmt);
            }
        }

        function openChargesModal() {
            calcModal.style.display = 'flex';
            if (productSelect) {
                const key = 'generic';
                productSelect.value = key;
                chargeRate.value = productRates[key];
                if (resGstLabel) resGstLabel.textContent = 'GST (18%)';
                applyProductMinimum(key);
            }
            withdrawAmount && withdrawAmount.focus();
            // close dropdown behind modal
            profileBtn.parentElement.classList.remove('active');
        }

        function closeChargesModal() {
            calcModal.style.display = 'none';
        }

        openLink.addEventListener('click', function(e) {
            e.preventDefault();
            openChargesModal();
        });
        closeCalc && closeCalc.addEventListener('click', closeChargesModal);
        calcModal.addEventListener('click', function(e) {
            if (e.target === calcModal) closeChargesModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && calcModal.style.display !== 'none') closeChargesModal();
        });

        if (productSelect) {
            productSelect.addEventListener('change', function() {
                const key = productSelect.value;
                if (productRates[key] != null) chargeRate.value = productRates[key];
                if (resGstLabel) resGstLabel.textContent = key === 'credit_card' ? 'GST (5%)' : 'GST (18%)';
                applyProductMinimum(key);
            });
        }

        if (calcForm) {
            calcForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const key = productSelect ? productSelect.value : 'generic';
                const minAmt = productMinimums[key] != null ? productMinimums[key] : productMinimums.generic;
                const amount = parseFloat(withdrawAmount.value || '0');
                const rate = parseFloat(chargeRate.value || '0');
                if (isNaN(amount) || amount < minAmt) {
                    alert(`Please enter at least the minimum amount: ₹${minAmt.toLocaleString()}`);
                    withdrawAmount.value = String(minAmt);
                    return;
                }
                const charges = (amount * rate) / 100;
                const gstRate = key === 'credit_card' ? 0.05 : 0.18;
                const gst = charges * gstRate;
                const net = charges + gst;
                resCharges.textContent = `₹${charges.toFixed(2)}`;
                resGst.textContent = `₹${gst.toFixed(2)}`;
                resNet.textContent = `₹${net.toFixed(2)}`;
                calcResult.style.display = 'block';
            });
        }
    } catch (err) {
        console.error('Charges calculator init error:', err);
    }
});


