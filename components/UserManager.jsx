import React, { useState } from 'react';
import './UserManager.css';

const UserManager = ({ users, showNotification, broadcastAdminAction }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    skillLevel: 'beginner',
    isAdmin: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      showNotification('請填寫用戶名稱', 'error');
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          skillLevel: formData.skillLevel,
          isAdmin: formData.isAdmin
        })
      });

      if (response.ok) {
        showNotification('用戶新增成功');
        broadcastAdminAction('user_added', {
          username: formData.username,
          skillLevel: formData.skillLevel,
          isAdmin: formData.isAdmin
        });
        resetForm();
      } else {
        const error = await response.json();
        showNotification(error.error || '用戶新增失敗', 'error');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`確定要刪除用戶 "${username}" 嗎？這將同時刪除該用戶的所有預約。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/user/${encodeURIComponent(username)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('用戶刪除成功');
        broadcastAdminAction('user_deleted', { username });
      } else {
        const error = await response.json();
        showNotification(error.error || '用戶刪除失敗', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      skillLevel: 'beginner',
      isAdmin: false
    });
    setShowAddForm(false);
  };

  const getSkillLevelLabel = (level) => {
    const levels = {
      beginner: '初學者',
      intermediate: '中等',
      advanced: '高階'
    };
    return levels[level] || level;
  };

  const getUserInitials = (username) => {
    if (!username) return '';
    const words = username.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
  };

  return (
    <div className="user-manager">
      <div className="manager-header">
        <h3>用戶管理</h3>
        <button 
          className="btn primary"
          onClick={() => setShowAddForm(true)}
        >
          新增用戶
        </button>
      </div>

      <div className="users-grid">
        {users.map(user => (
          <div key={user.username} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar">
                {getUserInitials(user.username)}
              </div>
              <div className="user-info">
                <h4>{user.username}</h4>
                <div className="user-badges">
                  <span className={`skill-badge ${user.skill_level}`}>
                    {getSkillLevelLabel(user.skill_level)}
                  </span>
                  {user.is_admin && (
                    <span className="admin-badge">管理員</span>
                  )}
                </div>
              </div>
            </div>

            <div className="user-actions">
              <button 
                className="delete-btn"
                onClick={() => handleDelete(user.username)}
              >
                刪除用戶
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="user-form-overlay">
          <div className="user-form">
            <div className="form-header">
              <h4>新增用戶</h4>
              <button 
                className="close-btn"
                onClick={resetForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">用戶名稱：</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="skillLevel">技能水準：</label>
                <select
                  id="skillLevel"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                >
                  <option value="beginner">初學者</option>
                  <option value="intermediate">中等</option>
                  <option value="advanced">高階</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                  />
                  管理員權限
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn primary">
                  新增
                </button>
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={resetForm}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;