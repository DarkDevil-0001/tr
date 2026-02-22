document.addEventListener('DOMContentLoaded', function () {
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
});


// Add this function at the beginning of the <script> section in signup.html
function saveUserData(firstName, lastName, email) {
    const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        signedUpAt: new Date().toISOString()
    };
    localStorage.setItem('treeviz_user', JSON.stringify(userData));
}

// Modify the form submission handler in signup.html
// In signup.js - Replace the entire form submission handler

document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) {
        const container = document.querySelector('.signup-container');
        container.style.animation = 'none';
        setTimeout(() => {
            container.style.animation = 'shake 0.5s ease';
        }, 10);
        return;
    }

    const btn = this.querySelector('button[type="submit"]');
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    // Get return URL from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo') || 'index.html';

    // Show loading state
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    btn.disabled = true;

    try {
        // Send data to backend
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password,
                userType
            })
        });

        const result = await response.json();

        if (result.success) {
            // Save user to localStorage
            localStorage.setItem('treeviz_user', JSON.stringify(result.user));
            
            // Success animation
            document.querySelector('.signup-container').style.boxShadow =
                '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 230, 118, 0.4)';
            
            alert(`Welcome to TreeViz, ${firstName}! Your account has been created.`);
            
            // Redirect back to the page user came from
            setTimeout(() => {
                window.location.href = returnTo;
            }, 1000);
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Network error. Please check if backend server is running.');
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
});

// Update the login link in signup page to preserve return URL
document.getElementById('loginLink')?.addEventListener('click', function(e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo') || 'index.html';
    window.location.href = `login.html?returnTo=${encodeURIComponent(returnTo)}`;
});

// Also update the login link to pass return URL
document.getElementById('loginLink').addEventListener('click', function (e) {
    e.preventDefault();
    // Check if there's a return URL in query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');

    // if (returnTo) {
    //     // In a real app, you would navigate to login with return URL
    //     alert('Login would be implemented in production. Return URL: ' + returnTo);
    // } else {
    //     alert('Login would be implemented in production');
    // }
});
// Create animated background nodes
function createAnimatedNodes() {
    const container = document.getElementById('nodesContainer');
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

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    // Update UI
    strengthFill.style.width = `${strength}%`;

    if (strength < 50) {
        strengthFill.style.background = '#ff4757';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#ff4757';
    } else if (strength < 75) {
        strengthFill.style.background = '#ffa502';
        strengthText.textContent = 'Fair';
        strengthText.style.color = '#ffa502';
    } else {
        strengthFill.style.background = '#00c853';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#00c853';
    }

    return strength;
}

// Form validation
function validateForm() {
    let isValid = true;
    const form = document.getElementById('signupForm');

    // Clear previous errors
    form.querySelectorAll('.field-error').forEach(el => {
        el.style.display = 'none';
    });

    form.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('input-error');
    });

    // Check required fields
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');

    // First name validation
    if (!firstName.value.trim()) {
        showError(firstName, 'firstNameError', 'First name is required');
        isValid = false;
    }

    // Last name validation
    if (!lastName.value.trim()) {
        showError(lastName, 'lastNameError', 'Last name is required');
        isValid = false;
    }

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
    } else if (password.value.length < 8) {
        showError(password, 'passwordError', 'Password must be at least 8 characters');
        isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword.value) {
        showError(confirmPassword, 'confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }

    // Terms validation
    if (!terms.checked) {
        document.getElementById('termsError').style.display = 'block';
        isValid = false;
    }

    return isValid;
}

function showError(inputElement, errorId, message) {
    inputElement.classList.add('input-error');
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Form submission handler
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) {
        // Create error shake animation
        const container = document.querySelector('.signup-container');
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

    // Show loading state
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    btn.disabled = true;

    // Add success glow effect
    document.querySelector('.signup-container').style.boxShadow =
        '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 230, 118, 0.4)';

    // Simulate API call for registration
    setTimeout(() => {
        // Reset button
        btn.innerHTML = originalContent;
        btn.disabled = false;

        // Create success animation
        const container = document.querySelector('.signup-container');
        container.style.animation = 'none';
        setTimeout(() => {
            container.style.animation = 'successPulse 1s ease';
        }, 10);

        setTimeout(() => {
            container.style.animation = '';

            // Show success message
            alert(`Welcome to TreeViz, ${document.getElementById('firstName').value}! Your account has been created. Redirecting to login...`);

            // In a real app, you would redirect to login or dashboard
            setTimeout(() => {
                // Redirect to login page (simulated)
                window.location.href = 'login.html';
            }, 1000);
        }, 1000);
    }, 1500);
});

// Password strength real-time checking
document.getElementById('password').addEventListener('input', function () {
    checkPasswordStrength(this.value);

    // Clear error if password becomes valid
    if (this.value.length >= 8) {
        this.classList.remove('input-error');
        document.getElementById('passwordError').style.display = 'none';
    }

    // Check password confirmation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword.value && this.value !== confirmPassword.value) {
        confirmPassword.classList.add('input-error');
        document.getElementById('confirmPasswordError').style.display = 'block';
    } else if (confirmPassword.value) {
        confirmPassword.classList.remove('input-error');
        document.getElementById('confirmPasswordError').style.display = 'none';
    }
});

// Confirm password validation
document.getElementById('confirmPassword').addEventListener('input', function () {
    const password = document.getElementById('password').value;

    if (this.value && password !== this.value) {
        this.classList.add('input-error');
        document.getElementById('confirmPasswordError').style.display = 'block';
    } else {
        this.classList.remove('input-error');
        document.getElementById('confirmPasswordError').style.display = 'none';
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

// Social signup buttons
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', function () {
        const platform = this.querySelector('i').className.includes('google') ? 'Google' :
            this.querySelector('i').className.includes('github') ? 'GitHub' : 'Microsoft';

        // Create ripple effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);

        setTimeout(() => {
            alert(`${platform} signup would be implemented in production`);
        }, 300);
    });
});

// Terms and Privacy links
document.getElementById('termsLink').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Terms of Service would be displayed in a production app');
});

document.getElementById('privacyLink').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Privacy Policy would be displayed in a production app');
});

// Login link
document.getElementById('loginLink').addEventListener('click', function (e) {
    e.preventDefault();
    // In a real app, you would navigate to the login page
    alert('Redirecting to login page...');
    // window.location.href = 'login.html';
});

// Initialize animated background
createAnimatedNodes();

// Add interactive hover effects to nodes
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

        if (distance < 0.2) {
            node.style.transform = `scale(1.3) translateY(-8px)`;
        } else {
            node.style.transform = '';
        }
    });
});
