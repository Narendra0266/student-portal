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

        const data = await response.json();

        if (!response.ok) {
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
        loginError.textContent = err.message || 'Server error. Please try again.';
        loginError.classList.remove('hidden');
      }
    });
  }

  // Password visibility toggle
  if (pswToggle && pswField && eyeIcon) {
    pswToggle.addEventListener('click', () => {
      if (pswField.type === 'password') {
        pswField.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
      } else {
        pswField.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
      }
    });
  }


});

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
