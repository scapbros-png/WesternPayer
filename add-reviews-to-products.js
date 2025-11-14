// Script to add reviews section to all product pages
// This is a helper script - the actual implementation is done directly in each file

// Product ID mapping for each product page
const productIdMap = {
    'bajaj card.html': 'bajaj-card',
    'lazypay.html': 'lazypay',
    'credit-card.html': 'credit-card',
    'home-credit.html': 'home-credit',
    'axio.html': 'axio',
    'idfc-buy-emi.html': 'idfc-buy-emi',
    'hdfc-easyemi.html': 'hdfc-easyemi',
    'zest-money.html': 'zest-money',
    'mobikwik-zip.html': 'mobikwik-zip',
    'amazon-pay-later.html': 'amazon-pay-later'
};

// Reviews section HTML template
const reviewsSectionHTML = `
            <!-- Reviews Section -->
            <div class="reviews-section" id="reviewsSection" style="background: #ffffff; padding: 2rem; border-radius: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); border: 1px solid rgba(0, 0, 0, 0.1); margin-top: 2rem;">
                <style>
                    .reviews-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 2px solid #e2e8f0;
                    }

                    .reviews-header h2 {
                        font-size: 1.8rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin: 0;
                    }

                    .reviews-header h2 i {
                        color: #f59e0b;
                        margin-right: 0.5rem;
                    }

                    .rating-summary {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        gap: 0.5rem;
                    }

                    .average-rating {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }

                    .rating-value {
                        font-size: 2.5rem;
                        font-weight: 800;
                        color: #1e293b;
                    }

                    .stars-display {
                        color: #f59e0b;
                        font-size: 1.5rem;
                    }

                    .rating-count {
                        color: #64748b;
                        font-size: 0.9rem;
                    }

                    .reviews-list {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .review-item {
                        padding: 1.5rem;
                        background: #f8fafc;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                    }

                    .review-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1rem;
                    }

                    .reviewer-info {
                        flex: 1;
                    }

                    .reviewer-name {
                        font-weight: 600;
                        color: #1e293b;
                        font-size: 1.1rem;
                        margin-bottom: 0.25rem;
                    }

                    .review-date {
                        color: #64748b;
                        font-size: 0.9rem;
                    }

                    .review-rating {
                        color: #f59e0b;
                        font-size: 1.2rem;
                    }

                    .review-text {
                        color: #475569;
                        line-height: 1.6;
                        font-size: 1rem;
                    }

                    .no-reviews {
                        text-align: center;
                        padding: 3rem 1rem;
                        color: #64748b;
                    }

                    .no-reviews i {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                        color: #cbd5e1;
                    }

                    @media (max-width: 768px) {
                        .reviews-header {
                            flex-direction: column;
                            align-items: flex-start;
                        }

                        .rating-summary {
                            align-items: flex-start;
                            margin-top: 1rem;
                        }
                    }
                </style>
            </div>
`;

// This is just a reference file - actual implementation is done in each product page file

