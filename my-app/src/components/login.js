import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';

const Login = () => {
  const auth = getAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password } = formData;

    // Validation
    if (!email || !password) {
      setError('Email and Password are both required!');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be 6 characters long!');
      setLoading(false);
      return;
    }

    try {
      // Login
      await signInWithEmailAndPassword(auth, email, password);

      // Get ID token after login
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();

        // Example: Call admin API (only if needed)
        // Remove this if you don't want to call on every login
      
        const response = await fetch('http://localhost:5000/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Test1234',
            displayName: 'Test User'
          })
        });
        
      }
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Login Error!';

      switch(error.code) {
        case 'auth/user-not-found':
          errorMessage = 'There is no Account associated with this Email!';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password is wrong!';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email format is wrong!';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account is disabled!';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many wrong attempts! Try again after few minutes.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Check your Internet connection!';
          break;
        default:
          errorMessage = 'Login error: ' + error.message;
      }

      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1> Login Page</h1>
          <p>Please Login to Access Account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">📧 Email Address:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password "
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Please wait ...
              </>
            ) : (
              'Login'
            )}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;