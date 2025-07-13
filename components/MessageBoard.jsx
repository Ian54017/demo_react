import React, { useState } from 'react';
import './MessageBoard.css';

const MessageBoard = ({ messages, onClose, isAdmin, showNotification, broadcastAdminAction }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMessage, setNewMessage] = useState({ author: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.author || !newMessage.text) {
      showNotification('請填寫所有欄位', 'error');
      return;
    }

    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: newMessage.author,
          text: newMessage.text
        })
      });

      if (response.ok) {
        setNewMessage({ author: '', text: '' });
        setShowAddForm(false);
        showNotification('消息發布成功');
        if (broadcastAdminAction) {
          broadcastAdminAction('message_added', { author: newMessage.author, text: newMessage.text });
        }
      } else {
        const error = await response.json();
        showNotification(error.error || '發布消息失敗', 'error');
      }
    } catch (error) {
      console.error('Error posting message:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('確定要刪除這條消息嗎？')) return;

    try {
      const response = await fetch(`/api/message/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('消息刪除成功');
        if (broadcastAdminAction) {
          broadcastAdminAction('message_deleted', { id: messageId });
        }
      } else {
        const error = await response.json();
        showNotification(error.error || '刪除消息失敗', 'error');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  return (
    <div className="message-board-overlay">
      <div className="message-board">
        <div className="message-board-header">
          <h3>📢 消息板</h3>
          <div className="header-actions">
            {isAdmin && (
              <button
                className="btn primary"
                onClick={() => setShowAddForm(true)}
              >
                新增消息
              </button>
            )}
            <button className="btn secondary" onClick={onClose}>
              關閉
            </button>
          </div>
        </div>

        <div className="message-board-content">
          {messages.length === 0 ? (
            <div className="no-messages">暫無消息</div>
          ) : (
            <div className="messages-list">
              {messages.map(message => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <span className="message-author">{message.author}</span>
                    <span className="message-date">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                    {isAdmin && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(message.id)}
                      >
                        刪除
                      </button>
                    )}
                  </div>
                  <div className="message-text">{message.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddForm && (
          <div className="add-message-form">
            <h4>新增消息</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="author">作者：</label>
                <input
                  type="text"
                  id="author"
                  value={newMessage.author}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="text">內容：</label>
                <textarea
                  id="text"
                  value={newMessage.text}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, text: e.target.value }))}
                  rows="4"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn primary">
                  發布
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBoard;