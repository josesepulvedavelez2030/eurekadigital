// Document Ready Function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initLanguageSystem();
    initHeroCarousel();
    initNavigation();
    initThemeToggle();
    initScrollAnimations();
    initContactForm();
    initSmoothScrolling();
    initActiveNavigation();
});

// Hero Carousel Functionality
function initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    
    let currentSlide = 0;
    let slideInterval;
    const autoPlayDelay = 5000; // 5 seconds
    
    // Show slide function
    function showSlide(index) {
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        // Reset typing animation for new active slide
        const activeSlide = slides[index];
        const title = activeSlide.querySelector('.slide-text h3');
        if (title) {
            // Remove animation
            title.style.animation = 'none';
            // Force reflow
            title.offsetHeight;
            // Re-add animation
            title.style.animation = 'typing 5s steps(60) forwards, blink 0.75s step-end infinite';
        }
        
        currentSlide = index;
    }
    
    // Next slide function
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Previous slide function
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    // Start autoplay
    function startAutoPlay() {
        slideInterval = setInterval(nextSlide, autoPlayDelay);
    }
    
    // Stop autoplay
    function stopAutoPlay() {
        clearInterval(slideInterval);
    }
    
    // Event listeners for controls
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            prevSlide();
            startAutoPlay();
        });
    }
    
    // Event listeners for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoPlay();
            showSlide(index);
            startAutoPlay();
        });
    });
    
    // Pause on hover
    const carousel = document.getElementById('hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopAutoPlay();
            prevSlide();
            startAutoPlay();
        } else if (e.key === 'ArrowRight') {
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
        }
    });
    
    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                stopAutoPlay();
                nextSlide();
                startAutoPlay();
            } else {
                // Swipe right - previous slide
                stopAutoPlay();
                prevSlide();
                startAutoPlay();
            }
        }
    }
    
    // Initialize first slide
    showSlide(0);
    
    // Start autoplay
    startAutoPlay();
    
    // Pause autoplay when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
    
    // Expose functions for global access
    window.carouselAPI = {
        nextSlide,
        prevSlide,
        showSlide,
        stopAutoPlay,
        startAutoPlay
    };
}

// Language System
let translations = {};
let currentLanguage = localStorage.getItem('language') || 'es';

async function initLanguageSystem() {
    // Load translations
    await loadTranslations(currentLanguage);
    
    // Apply initial translations
    applyTranslations();
    
    // Set up language selector
    setupLanguageSelector();
    
    // Update language display
    updateLanguageDisplay();
    
    // Set HTML lang attribute
    document.documentElement.lang = currentLanguage;
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        translations = await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to Spanish if translation file fails to load
        if (lang !== 'es') {
            await loadTranslations('es');
        }
    }
}

function applyTranslations() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(key);
        if (translation) {
            element.placeholder = translation;
        }
    });
    
    // Update select options
    document.querySelectorAll('[data-i18n-select]').forEach(select => {
        const selectKey = select.getAttribute('data-i18n-select');
        const placeholderTranslation = getTranslation(selectKey);
        if (placeholderTranslation && select.options[0]) {
            select.options[0].textContent = placeholderTranslation;
        }
    });
    
    // Update option elements
    document.querySelectorAll('option[data-i18n]').forEach(option => {
        const key = option.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            option.textContent = translation;
        }
    });
    
    // Update page title
    const titleKey = getPageTitleKey();
    const titleTranslation = getTranslation(titleKey);
    if (titleTranslation) {
        document.title = `${titleTranslation} - Eureka Digital`;
    }
    
    // Update meta description
    updateMetaTags();
}

function getTranslation(key) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
    }
    
    return value;
}

function getPageTitleKey() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') {
        return 'hero.title';
    }
    return 'navigation.logo';
}

function updateMetaTags() {
    // Update description
    const descriptionKey = currentLanguage === 'es' ? 
        'hero.subtitle' : 'hero.subtitle';
    const description = getTranslation(descriptionKey);
    
    if (description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = description;
        }
    }
    
    // Update keywords based on language
    const keywords = currentLanguage === 'es' ? 
        'desarrollo software, aplicaciones web, móviles, escritorio, soluciones empresariales' :
        'software development, web applications, mobile, desktop, enterprise solutions';
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.content = keywords;
    }
}

function setupLanguageSelector() {
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    
    if (languageToggle && languageDropdown) {
        // Toggle dropdown
        languageToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            languageDropdown.classList.remove('show');
        });
        
        // Handle language selection
        languageOptions.forEach(option => {
            option.addEventListener('click', async function(e) {
                e.stopPropagation();
                
                const newLang = this.getAttribute('data-lang');
                if (newLang !== currentLanguage) {
                    // Update active state
                    languageOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Load new translations
                    currentLanguage = newLang;
                    await loadTranslations(currentLanguage);
                    
                    // Apply translations
                    applyTranslations();
                    
                    // Update display
                    updateLanguageDisplay();
                    
                    // Save preference
                    localStorage.setItem('language', currentLanguage);
                    
                    // Update HTML lang attribute
                    document.documentElement.lang = currentLanguage;
                }
                
                // Close dropdown
                languageDropdown.classList.remove('show');
            });
        });
    }
}

function updateLanguageDisplay() {
    const currentLangElement = document.querySelector('.current-lang');
    const languageOptions = document.querySelectorAll('.language-option');
    
    if (currentLangElement) {
        currentLangElement.textContent = currentLanguage.toUpperCase();
    }
    
    // Update active state
    languageOptions.forEach(option => {
        option.classList.toggle('active', 
            option.getAttribute('data-lang') === currentLanguage);
    });
}

async function switchLanguage(lang) {
    if (lang !== currentLanguage) {
        currentLanguage = lang;
        await loadTranslations(currentLanguage);
        applyTranslations();
        updateLanguageDisplay();
        localStorage.setItem('language', currentLanguage);
        document.documentElement.lang = currentLanguage;
    }
}

// Navigation Mobile Toggle
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            
            // Reset hamburger menu
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target) && 
            !event.target.closest('.language-selector')) {
            navMenu.classList.remove('active');
            
            // Reset hamburger menu
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        }
    });
}

// Theme Toggle (Dark Mode)
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add stagger effect for multiple elements
                const elements = entry.target.querySelectorAll('.service-card, .product-card, .stat');
                elements.forEach((el, index) => {
                    setTimeout(() => {
                        el.style.animation = `fadeInUp 0.6s ease forwards`;
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.about, .services, .products, .contact');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Initial state for cards
    const cards = document.querySelectorAll('.service-card, .product-card, .stat');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Active Navigation Highlight
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightCurrentSection() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightCurrentSection);
    highlightCurrentSection(); // Call on load
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!validateForm(data)) {
                return;
            }
            
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitButton.classList.add('loading');
            
            // Simulate form submission (replace with actual implementation)
            setTimeout(() => {
                // Show success message
                const successMessage = translations.form?.success || 'Message sent successfully! We will contact you soon.';
                showMessage(successMessage, 'success');
                
                // Reset form
                form.reset();
                
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.classList.remove('loading');
                
                // In a real implementation, you would send the data to a server here
                console.log('Form data:', data);
            }, 2000);
        });
    }
}

function validateForm(data) {
    let isValid = true;
    let errorMessage = '';
    
    // Get validation messages based on current language
    const validationMessages = translations.form?.validation || {};
    
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errorMessage = validationMessages.name || 'Please enter your full name.';
        isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errorMessage = validationMessages.email || 'Please enter a valid email.';
        isValid = false;
    }
    
    // Service validation
    if (!data.service) {
        errorMessage = validationMessages.service || 'Please select a service.';
        isValid = false;
    }
    
    // Message validation
    if (!data.message || data.message.trim().length < 10) {
        errorMessage = validationMessages.message || 'Please enter a message with at least 10 characters.';
        isValid = false;
    }
    
    if (!isValid) {
        showMessage(errorMessage, 'error');
    }
    
    return isValid;
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    // Add message to form
    const form = document.getElementById('contact-form');
    form.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Navbar Background on Scroll
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const scrolled = window.pageYOffset > 50;
    
    if (navbar) {
        if (scrolled) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            }
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
            
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            }
        }
    }
}

// Parallax Effect for Hero Section
function handleParallax() {
    const scrolled = window.pageYOffset;
    const heroElements = document.querySelectorAll('.float-element');
    
    heroElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// Performance optimized scroll handler
let ticking = false;
function requestTick() {
    if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
}

function updateOnScroll() {
    handleNavbarScroll();
    handleParallax();
    ticking = false;
}

// Initialize scroll handlers
window.addEventListener('scroll', requestTick);

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add resize observer for responsive adjustments
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        // Handle responsive layout changes if needed
        const width = entry.contentRect.width;
        
        // Adjust animations based on screen size
        if (width < 768) {
            document.documentElement.style.setProperty('--animation-duration', '0.3s');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '0.6s');
        }
    }
});

// Observe body for resize events
resizeObserver.observe(document.body);

// Add loading complete event
window.addEventListener('load', function() {
    // Hide loading spinner if exists
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
    
    // Add loaded class to body for animations
    document.body.classList.add('loaded');
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Console welcome message
const welcomeMessages = {
    es: ['Soluciones digitales que impulsan tu negocio', '¿Listo para crear algo amazing juntos?'],
    en: ['Digital solutions that drive your business', 'Ready to create something amazing together?']
};

const currentWelcomeMessages = welcomeMessages[currentLanguage] || welcomeMessages.es;

console.log('%c🚀 Eureka Digital', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log(`%c${currentWelcomeMessages[0]}`, 'font-size: 14px; color: #764ba2;');
console.log(`%c${currentWelcomeMessages[1]}`, 'font-size: 12px; color: #f093fb;');