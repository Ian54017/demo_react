import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim(), isAdmin);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>歡迎使用場地預約系統</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="請輸入您的用戶ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
            />
          </div>
          
          <div className="admin-checkbox">
            <label>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span className="checkmark">管理員登入</span>
            </label>
          </div>
          
          <button type="submit" className="login-btn">
            登入
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;