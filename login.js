// login.js - Complete fixed version

document.addEventListener('DOMContentLoaded', function () {
    // Initialize particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 100,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#00d4ff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.8,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.4,
                    "sync": false
                }
            },
            "size": {
                "value": 5,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#00d4ff",
                "opacity": 0.6,
                "width": 1.5
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": true,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 100,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    // Create animated background nodes
    createAnimatedNodes();
    
    // Get return URL from query parameters on page load
    // CRITICAL FIX: Get return URL from query parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    
    console.log('Login page loaded - returnTo from URL:', returnTo); // For debugging
    
    if (returnTo) {
        // Store it in sessionStorage
        sessionStorage.setItem('login_returnTo', returnTo);
        console.log('Stored in sessionStorage:', returnTo);
    } else {
        // If no returnTo in URL, check if we have one in sessionStorage
        const storedReturnTo = sessionStorage.getItem('login_returnTo');
        if (storedReturnTo) {
            console.log('Using stored returnTo:', storedReturnTo);
        } else {
            // Default to index.html
            sessionStorage.setItem('login_returnTo', 'index.html');
            console.log('Using default returnTo: index.html');
        }
    }
    
    // Pre-fill email if it was saved
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
});

// Create animated background nodes
function createAnimatedNodes() {
    const container = document.getElementById('nodesContainer');
    if (!container) return;
    
    const nodeCount = 20;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'node';

        // Random properties
        const size = Math.random() * 25 + 8;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const animationDelay = Math.random() * 10;
        const animationDuration = Math.random() * 15 + 8;

        // Random node type
        const types = ['tree-node', 'graph-node', 'binary-node'];
        node.classList.add(types[Math.floor(Math.random() * types.length)]);

        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.left = `${posX}%`;
        node.style.top = `${posY}%`;
        node.style.animationDelay = `${animationDelay}s`;
        node.style.animationDuration = `${animationDuration}s`;

        container.appendChild(node);
        nodes.push({ element: node, x: posX, y: posY });
    }

    // Create connections between nodes
    createConnections(nodes);
}

function createConnections(nodes) {
    const container = document.getElementById('nodesContainer');
    if (!container) return;

    // Create connections between some nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            // Only connect nodes that are relatively close
            const distance = Math.sqrt(
                Math.pow(nodes[i].x - nodes[j].x, 2) +
                Math.pow(nodes[i].y - nodes[j].y, 2)
            );

            if (distance < 30 && Math.random() > 0.7) {
                const connection = document.createElement('div');
                connection.className = 'connection';

                const x1 = nodes[i].x;
                const y1 = nodes[i].y;
                const x2 = nodes[j].x;
                const y2 = nodes[j].y;

                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                connection.style.width = `${length}%`;
                connection.style.left = `${x1}%`;
                connection.style.top = `${y1}%`;
                connection.style.transform = `rotate(${angle}deg)`;
                connection.style.opacity = Math.random() * 0.2 + 0.1;

                container.appendChild(connection);
            }
        }
    }
}

// Toggle password visibility
document.getElementById('togglePassword')?.addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Form validation
function validateForm() {
    let isValid = true;
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('input-error');
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, 'emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError(email, 'emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (!password.value) {
        showError(password, 'passwordError', 'Password is required');
        isValid = false;
    }

    return isValid;
}

function showError(inputElement, errorId, message) {
    inputElement.classList.add('input-error');
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Check if user is already logged in
function checkLoggedIn() {
    const user = localStorage.getItem('treeviz_user');
    if (user) {
        console.log('User already logged in:', JSON.parse(user));
    }
}

// Login function - Connected to backend
async function loginUser(email, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please check if backend server is running.' };
    }
}

// Form submission handler
// Replace the entire form submission handler in login.js with this:

document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) {
        const container = document.querySelector('.login-container');
        container.style.animation = 'none';
        setTimeout(() => {
            container.style.animation = 'shake 0.5s ease';
        }, 10);
        setTimeout(() => {
            container.style.animation = '';
        }, 500);
        return;
    }

    const btn = this.querySelector('button[type="submit"]');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // CRITICAL FIX: Get return URL from sessionStorage
    const returnTo = sessionStorage.getItem('login_returnTo') || 'index.html';
    
    console.log('Login - Will redirect to:', returnTo); // For debugging

    // Show loading state
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        // Check for demo credentials
        if (email === 'demo@treeviz.com' && password === 'demo1234') {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const demoUser = {
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@treeviz.com',
                userType: 'student',
                isDemo: true,
                loggedInAt: new Date().toISOString()
            };
            
            localStorage.setItem('treeviz_user', JSON.stringify(demoUser));
            
            if (remember) {
                localStorage.setItem('remembered_email', email);
            }
            
            // Success animation
            const container = document.querySelector('.login-container');
            container.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 230, 118, 0.4)';
            
            alert(`✅ Demo Login Successful!\n\nWelcome to TreeViz, Demo User!`);
            
            // CRITICAL FIX: Clear sessionStorage and redirect
            console.log('Demo login - Redirecting to:', returnTo);
            sessionStorage.removeItem('login_returnTo'); // Clean up
            setTimeout(() => {
                window.location.href = returnTo;
            }, 1000);
            
            return;
        }

        // Attempt real login with backend
        const result = await loginUser(email, password);
        
        if (result.success) {
            // Save user data
            localStorage.setItem('treeviz_user', JSON.stringify(result.user));
            
            if (remember) {
                localStorage.setItem('remembered_email', email);
            }
            
            // Success animation
            const container = document.querySelector('.login-container');
            container.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 230, 118, 0.4)';
            
            container.style.animation = 'none';
            setTimeout(() => {
                container.style.animation = 'successPulse 1s ease';
            }, 10);
            
            setTimeout(() => {
                container.style.animation = '';
                alert(`✅ Welcome back, ${result.user.firstName}!`);
                
                // CRITICAL FIX: Clear sessionStorage and redirect
                console.log('Real login - Redirecting to:', returnTo);
                sessionStorage.removeItem('login_returnTo'); // Clean up
                window.location.href = returnTo;
            }, 1000);
        } else {
            throw new Error(result.error || 'Login failed');
        }

    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = `Login failed: ${error.message}`;
        if (error.message.includes('Invalid credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('not found')) {
            errorMessage = 'No account found with this email. Please sign up.';
        }
        
        alert(`❌ ${errorMessage}`);
        
        // Error animation
        const container = document.querySelector('.login-container');
        container.style.animation = 'none';
        setTimeout(() => {
            container.style.animation = 'shake 0.5s ease';
        }, 10);
        
    } finally {
        // Reset button
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.disabled = false;
            btn.classList.remove('loading');
            document.querySelector('.login-container').style.animation = '';
        }, 500);
    }
});

// Add CSS animations for feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes successPulse {
        0%, 100% { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 230, 118, 0.4); }
        50% { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 150px rgba(0, 230, 118, 0.6); }
    }
`;
document.head.appendChild(style);

// Social login buttons
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', function () {
        const platform = this.classList.contains('btn-google') ? 'Google' :
                        this.classList.contains('btn-github') ? 'GitHub' : 'Microsoft';

        // Create ripple effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);

        setTimeout(() => {
            alert(`${platform} login would be implemented in production`);
        }, 300);
    });
});

// Forgot password link - preserve return URL
document.getElementById('forgotPasswordLink')?.addEventListener('click', function (e) {
    e.preventDefault();
    
    const returnTo = sessionStorage.getItem('login_returnTo') || 'index.html';
    const email = document.getElementById('email').value.trim();
    
    if (email) {
        if (confirm(`Send password reset link to ${email}?`)) {
            alert(`✅ Password reset email sent to ${email}\n\nPlease check your inbox. You'll be redirected back after reset.`);
            // In a real app, you would redirect to password reset page with return URL
            // window.location.href = `forgot-password.html?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(returnTo)}`;
        }
    } else {
        alert('Please enter your email address first to reset your password.');
        document.getElementById('email').focus();
    }
});

// Signup link - preserve return URL
// Replace the signup link handler in login.js with this:

document.getElementById('signupLink')?.addEventListener('click', function (e) {
    e.preventDefault();
    
    // Add animation before redirect
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = '';
    }, 200);
    
    // CRITICAL FIX: Get return URL from sessionStorage and pass it to signup
    const returnTo = sessionStorage.getItem('login_returnTo') || 'index.html';
    
    console.log('Signup link - Redirecting with returnTo:', returnTo);
    
    // Clear login session storage before going to signup
    sessionStorage.removeItem('login_returnTo');
    
    window.location.href = `signup.html?returnTo=${encodeURIComponent(returnTo)}`;
});

// Interactive hover effects on nodes
document.addEventListener('mousemove', (e) => {
    const nodes = document.querySelectorAll('.node');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    nodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        const nodeX = (rect.left + rect.width / 2) / window.innerWidth;
        const nodeY = (rect.top + rect.height / 2) / window.innerHeight;

        const distance = Math.sqrt(
            Math.pow(mouseX - nodeX, 2) +
            Math.pow(mouseY - nodeY, 2)
        );

        if (distance < 0.15) {
            node.style.transform = `scale(1.5) translateY(-10px)`;
            node.style.boxShadow = '0 0 30px rgba(41, 182, 246, 0.6)';
        } else {
            node.style.transform = '';
            node.style.boxShadow = '';
        }
    });
});

// Check if user is already logged in on page load
checkLoggedIn();

// Handle Enter key for form submission
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('loginForm')?.dispatchEvent(new Event('submit'));
    }
});

// Input focus effects
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.querySelector('i')?.style.setProperty('color', '#29b6f6');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.querySelector('i')?.style.setProperty('color', '#1a237e');
        }
    });

});
