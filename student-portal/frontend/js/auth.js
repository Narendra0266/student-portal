// Core Authentication Logic

const API_BASE_URL = window.location.origin;

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const pswToggle = document.getElementById('password-toggle');
  const pswField = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.classList.add('hidden');

      const email = document.getElementById('email').value.trim();
      const password = pswField.value;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        let data = {};
        try {
          data = await response.json();
        } catch (parseErr) {
          data = {};
        }

        if (!response.ok) {
          // If backend API is not deployed/reachable (e.g. 404/405 on static Vercel)
          if (response.status === 404 || response.status === 405) {
            // Check for valid demo accounts to allow frontend preview
            const demoUsers = {
              'student@modern.edu': { name: 'Aarav Sharma', role: 'student', pass: 'student123' },
              'parent@modern.edu': { name: 'Rajesh Sharma', role: 'parent', pass: 'parent123' },
              'teacher@modern.edu': { name: 'Dr. R. Prasad', role: 'teacher', pass: 'teacher123' },
              'admin@modern.edu': { name: 'System Administrator', role: 'admin', pass: 'admin123' }
            };

            const demoAccount = demoUsers[email];
            if (demoAccount && password === demoAccount.pass) {
              const mockUser = {
                id: 1,
                name: demoAccount.name,
                email: email,
                role: demoAccount.role,
                institution_id: 1
              };
              localStorage.setItem('token', 'demo-token-' + Date.now());
              localStorage.setItem('user', JSON.stringify(mockUser));

              if (mockUser.role === 'admin') {
                window.location.href = 'admin.html';
              } else if (mockUser.role === 'teacher') {
                window.location.href = 'teacher.html';
              } else if (mockUser.role === 'parent') {
                window.location.href = 'parent.html';
              } else {
                window.location.href = 'student.html';
              }
              return;
            }
            throw new Error('Backend API is not connected. Use one of the Demo buttons below.');
          }
          throw new Error(data.error || 'Authentication failed');
        }

        // Save token and user details in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on user role
        if (data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else if (data.user.role === 'teacher') {
          window.location.href = 'teacher.html';
        } else if (data.user.role === 'parent') {
          window.location.href = 'parent.html';
        } else {
          window.location.href = 'student.html';
        }
      } catch (err) {
        console.error('Login Error:', err);
        const errorSpan = loginError.querySelector('span');
        if (errorSpan) {
          errorSpan.textContent = err.message || 'Server error. Please try again.';
        } else {
          loginError.textContent = err.message || 'Server error. Please try again.';
        }
        loginError.classList.remove('hidden');
      }
    });
  }

  // Password visibility toggle binding
  if (pswToggle) {
    pswToggle.onclick = togglePasswordVisibility;
  }
});

// Standalone Password Visibility Toggle (can be called via onclick or button)
function togglePasswordVisibility() {
  const pswField = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');
  if (!pswField) return;

  if (pswField.type === 'password') {
    pswField.type = 'text';
    if (eyeIcon) {
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    }
  } else {
    pswField.type = 'password';
    if (eyeIcon) {
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// Guard helper to protect dashboard pages
function protectPage(requiredRole) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    logout();
    return null;
  }

  const user = JSON.parse(userStr);

  if (requiredRole && user.role !== requiredRole) {
    // If mismatch, send to correct dashboard
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else if (user.role === 'teacher') {
      window.location.href = 'teacher.html';
    } else if (user.role === 'parent') {
      window.location.href = 'parent.html';
    } else {
      window.location.href = 'student.html';
    }
    return null;
  }

  return { token, user };
}

// Global logout helper
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Setup Authorization Headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}
