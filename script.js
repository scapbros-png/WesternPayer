// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});

// Service Tabs Functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
});

// Smooth Scrolling for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default for anchor links (hash links), not regular links
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
            // If it's not a hash link, let it navigate normally
        });
    });
});

// Header Background Change on Scroll - DISABLED
// document.addEventListener('DOMContentLoaded', function() {
//     const header = document.querySelector('.header');
//     
//     window.addEventListener('scroll', function() {
//         if (window.scrollY > 100) {
//             header.style.background = 'rgba(255, 255, 255, 0.95)';
//             header.style.backdropFilter = 'blur(10px)';
//         } else {
//             header.style.background = '#fff';
//             header.style.backdropFilter = 'none';
//         }
//     });
// });

// Intersection Observer for Animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .service-item, .timeline-item, .testimonial-item, .blog-item, .faq-item, .stat-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Counter Animation for Stats
document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number with commas
            element.textContent = Math.floor(current).toLocaleString();
        }, 20);
    };
    
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.textContent.replace(/,/g, ''));
                animateCounter(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Newsletter Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button');
            
            if (emailInput.value) {
                // Simulate form submission
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    submitBtn.textContent = 'Subscribed!';
                    emailInput.value = '';
                    
                    setTimeout(() => {
                        submitBtn.textContent = 'Subscribe Now';
                        submitBtn.disabled = false;
                    }, 2000);
                }, 1000);
            }
        });
    }
});

// Dropdown Menu Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        
        dropdown.addEventListener('mouseenter', function() {
            dropdownContent.style.display = 'block';
        });
        
        dropdown.addEventListener('mouseleave', function() {
            dropdownContent.style.display = 'none';
        });
    });
});

// Parallax Effect for Hero Section
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            hero.style.transform = `translateY(${parallax}px)`;
        });
    }
});

// Loading Animation
document.addEventListener('DOMContentLoaded', function() {
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Remove loading class after page load
    window.addEventListener('load', function() {
        document.body.classList.remove('loading');
    });
});

// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h4');
        const answer = item.querySelector('p');
        
        // Initially hide answers
        answer.style.display = 'none';
        
        question.addEventListener('click', function() {
            const isOpen = answer.style.display === 'block';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('p');
                otherAnswer.style.display = 'none';
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isOpen) {
                answer.style.display = 'block';
                item.classList.add('active');
            }
        });
    });
});

// Search Functionality (if needed)
document.addEventListener('DOMContentLoaded', function() {
    // Add search functionality here if needed
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const searchableElements = document.querySelectorAll('.service-item, .blog-item');
            
            searchableElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            });
        });
    }
});

// Back to Top Button
document.addEventListener('DOMContentLoaded', function() {
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Form Validation
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';
                } else {
                    input.style.borderColor = '#d1d5db';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
});

// Lazy Loading for Images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
});

// Add CSS for loading state
const loadingStyles = `
    .loading {
        overflow: hidden;
    }
    
    .loading::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .loading::after {
        content: 'Loading...';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        color: #2563eb;
        z-index: 10000;
    }
`;

// Inject loading styles
const styleSheet = document.createElement('style');
styleSheet.textContent = loadingStyles;
document.head.appendChild(styleSheet);

// Load and display profile photo on all pages (global function)
window.loadAndDisplayProfilePhoto = async function() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const profileBtn = document.getElementById('profileBtn');
    
    if (!userData.isLoggedIn || !userData.uid) {
        return;
    }
    
    try {
        // Check localStorage first
        let photoUrl = userData.photoUrl;
        
        // If not in localStorage, load from Firebase
        if (!photoUrl && typeof window.dbHelper !== 'undefined') {
            const profile = await window.dbHelper.getUserProfile(userData.uid);
            if (profile && profile.photoUrl) {
                photoUrl = profile.photoUrl;
                // Update localStorage
                userData.photoUrl = photoUrl;
                localStorage.setItem('userData', JSON.stringify(userData));
            }
        }
        
        // Update profile button with photo (if button exists)
        if (profileBtn) {
            if (photoUrl) {
                const existingImg = profileBtn.querySelector('img');
                const icon = profileBtn.querySelector('i');
                
                if (existingImg) {
                    existingImg.src = photoUrl;
                    if (icon) icon.style.display = 'none';
                } else {
                    if (icon) icon.style.display = 'none';
                    const img = document.createElement('img');
                    img.src = photoUrl;
                    img.alt = 'Profile Photo';
                    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;';
                    profileBtn.appendChild(img);
                    // Remove background when image is present
                    profileBtn.style.background = 'transparent';
                    profileBtn.style.border = '2px solid rgba(96, 165, 250, 0.3)';
                }
            } else {
                // If no photo, ensure icon is visible
                const existingImg = profileBtn.querySelector('img');
                const icon = profileBtn.querySelector('i');
                if (existingImg) {
                    existingImg.remove();
                }
                if (icon) {
                    icon.style.display = 'block';
                }
                profileBtn.style.background = '#f8fafc';
                profileBtn.style.border = '2px solid #e5e7eb';
            }
        }
        
        // Update profile header in dropdown menu (always try, even if not visible yet)
        updateProfileHeaderPhoto(photoUrl || null);
    } catch (error) {
        console.error('Error loading profile photo:', error);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load photo immediately
    loadAndDisplayProfilePhoto();
    
    // Also run after a short delay to handle cases where profile section is shown dynamically
    setTimeout(function() {
        loadAndDisplayProfilePhoto();
    }, 500);
    
    // Also run after a longer delay for pages that load content dynamically
    setTimeout(function() {
        loadAndDisplayProfilePhoto();
    }, 1500);
    
    // Observe profile section visibility changes
    const profileSection = document.getElementById('profileSection');
    if (profileSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (profileSection.style.display !== 'none') {
                        loadAndDisplayProfilePhoto();
                    }
                }
            });
        });
        observer.observe(profileSection, { attributes: true, attributeFilter: ['style'] });
    }
});

// Function to update profile header photo in dropdown menu (global function)
window.updateProfileHeaderPhoto = function(photoUrl) {
    const profileHeader = document.querySelector('.profile-header');
    if (!profileHeader) {
        // Retry after a short delay if header not found (might be dynamically loaded)
        setTimeout(function() {
            window.updateProfileHeaderPhoto(photoUrl);
        }, 100);
        return;
    }
    
    const icon = profileHeader.querySelector('i');
    let photoImg = profileHeader.querySelector('img');
    
    if (photoUrl) {
        // Create image if it doesn't exist
        if (!photoImg) {
            photoImg = document.createElement('img');
            photoImg.alt = 'Profile Photo';
            photoImg.className = 'show';
            // Insert before the userName span
            const userName = profileHeader.querySelector('span');
            if (userName) {
                profileHeader.insertBefore(photoImg, userName);
            } else {
                profileHeader.appendChild(photoImg);
            }
        }
        photoImg.src = photoUrl;
        photoImg.classList.add('show');
        photoImg.style.display = 'block';
        if (icon) icon.style.display = 'none';
    } else {
        // Hide photo and show icon
        if (photoImg) {
            photoImg.classList.remove('show');
            photoImg.style.display = 'none';
        }
        if (icon) icon.style.display = 'block';
    }
}

// Function to check for unread messages and update notification badge
window.updateMessageNotificationBadge = async function() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!userData.isLoggedIn || !userData.uid) {
        // Hide badge if user is not logged in
        const badge = document.querySelector('.profile-link[href*="messages"] .message-notification-badge');
        if (badge) {
            badge.classList.remove('show');
        }
        return;
    }
    
    try {
        // Check if Firebase is available
        if (typeof window.firebaseDb === 'undefined') {
            return;
        }
        
        const database = window.firebaseDb;
        const messagesSnapshot = await database.ref(`users/${userData.uid}/notifications`).once('value');
        const messages = messagesSnapshot.val() || {};
        
        // Count unread messages from admin
        let unreadCount = 0;
        Object.keys(messages).forEach(key => {
            const msg = messages[key];
            // Check if message is from admin and not read
            if (msg.from === 'admin' && (!msg.read || msg.read === false)) {
                unreadCount++;
            }
        });
        
        // Find the Messages link in the profile dropdown
        const messagesLink = document.querySelector('.profile-link[href*="messages"]');
        if (messagesLink) {
            // Find or create the notification badge
            let badge = messagesLink.querySelector('.message-notification-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'message-notification-badge';
                messagesLink.appendChild(badge);
            }
            
            // Show or hide badge based on unread count
            if (unreadCount > 0) {
                badge.classList.add('show');
            } else {
                badge.classList.remove('show');
            }
        }
    } catch (error) {
        console.error('Error checking for unread messages:', error);
        // Hide badge on error
        const badge = document.querySelector('.profile-link[href*="messages"] .message-notification-badge');
        if (badge) {
            badge.classList.remove('show');
        }
    }
}

// Run badge check on page load and periodically
document.addEventListener('DOMContentLoaded', function() {
    // Check immediately
    if (typeof window.updateMessageNotificationBadge === 'function') {
        setTimeout(function() {
            window.updateMessageNotificationBadge();
        }, 1000);
    }
    
    // Check periodically (every 30 seconds) for new messages
    setInterval(function() {
        if (typeof window.updateMessageNotificationBadge === 'function') {
            window.updateMessageNotificationBadge();
        }
    }, 30000);
    
    // Update badge when profile dropdown is opened
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        // Use MutationObserver to watch for class changes on profile dropdown
        const profileDropdown = profileBtn.parentElement;
        if (profileDropdown) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        // Check if dropdown is now active
                        if (profileDropdown.classList.contains('active')) {
                            // Update badge when dropdown opens
                            if (typeof window.updateMessageNotificationBadge === 'function') {
                                setTimeout(function() {
                                    window.updateMessageNotificationBadge();
                                }, 100);
                            }
                        }
                    }
                });
            });
            observer.observe(profileDropdown, { attributes: true, attributeFilter: ['class'] });
        }
    }
});

// Check if user is blocked and handle blocked users
window.checkUserBlockedStatus = async function() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Only check if user is logged in
        if (!userData.isLoggedIn || !userData.uid) {
            return false;
        }
        
        // Check if dbHelper is available
        if (typeof window.dbHelper === 'undefined' || typeof window.dbHelper.getUserProfile !== 'function') {
            // dbHelper not available, skip check but don't log out user
            console.log('dbHelper not available, skipping block status check');
            return false;
        }
        
        // Check Firebase for current block status
        const profile = await window.dbHelper.getUserProfile(userData.uid);
        
        if (profile && profile.isBlocked === true) {
            // User is blocked - sign them out and clear data
            if (typeof firebaseAuth !== 'undefined') {
                await firebaseAuth.signOut();
            }
            localStorage.removeItem('userData');
            
            // Show blocked message
            alert('⛔ Your account has been blocked!\n\n' +
                  'Your account access has been restricted by the administrator.\n\n' +
                  'If you believe this is a mistake, please contact support for assistance.');
            
            // Redirect to login page
            window.location.href = 'login.html';
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking user block status:', error);
        // On error, don't log out user - just return false
        return false;
    }
};