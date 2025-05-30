import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`Username: ${inputUsername}, Password: ${inputPassword}`);

    if (inputUsername !== 'admin' || inputPassword !== 'admin') {
      setShowError(true);
    } else {
      setShowError(false);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Sign In</h2>

        {showError && (
          <div className="login-alert">
            Incorrect username or password.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="login-input"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;