import React, { useState, useEffect } from 'react';
import BookingTable from './BookingTable.jsx';
import MessageBoard from './MessageBoard.jsx';
import VenueManager from './VenueManager.jsx';
import UserManager from './UserManager.jsx';
import './AdminApp.css';

const AdminApp = ({
  currentUser,
  venues,
  timeSlots,
  bookings,
  messages,
  users,
  onLogout,
  showNotification,
  broadcastAdminAction,
  connectionStatus,
  onlineUsers
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const [showMessageBoard, setShowMessageBoard] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getAdjustedTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + timeOffset);
    return now;
  };

  const adjustTimeOffset = (minutes) => {
    setTimeOffset(prev => prev + minutes);
  };

  const resetTimeOffset = () => {
    setTimeOffset(0);
  };

  const getTotalBookings = () => {
    let total = 0;
    Object.values(bookings).forEach(venueBookings => {
      Object.values(venueBookings).forEach(timeSlotBookings => {
        total += timeSlotBookings.length;
      });
    });
    return total;
  };

  const tabs = [
    { id: 'bookings', label: '📋 預約總覽', count: getTotalBookings() },
    { id: 'venues', label: '🏟️ 場地管理', count: venues.length },
    { id: 'users', label: '👥 用戶管理', count: users.length },
    { id: 'messages', label: '📢 消息管理', count: messages.length }
  ];

  return (
    <div className="admin-app">
      <div className="admin-header">
        <div className="main-header">
          <div className="header-left">
            <h2>🛠️ 管理員後台</h2>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-id">管理員：{currentUser}</div>
              <div className="current-time">
                {getAdjustedTime().toLocaleTimeString()}
                {timeOffset !== 0 && (
                  <span className="time-offset">
                    ({timeOffset > 0 ? '+' : ''}{timeOffset}分鐘)
                  </span>
                )}
              </div>
              <div className="connection-info">
                <div className={`connection-status ${connectionStatus ? 'connected' : 'disconnected'}`}>
                  {connectionStatus ? '已連接' : '未連接'}
                </div>
                <div className="online-users">在線：{onlineUsers}</div>
              </div>
            </div>
            <div className="time-controls">
              <button 
                className="btn secondary"
                onClick={() => adjustTimeOffset(-15)}
              >
                -15分
              </button>
              <button 
                className="btn secondary"
                onClick={() => adjustTimeOffset(15)}
              >
                +15分
              </button>
              <button 
                className="btn secondary"
                onClick={resetTimeOffset}
              >
                重置時間
              </button>
            </div>
            <button className="btn secondary" onClick={onLogout}>
              登出
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'bookings' && (
          <div className="tab-content">
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-value">{getTotalBookings()}</div>
                <div className="stat-label">總預約數</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{venues.length}</div>
                <div className="stat-label">場地數量</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">用戶數量</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{onlineUsers}</div>
                <div className="stat-label">在線用戶</div>
              </div>
            </div>
            
            <BookingTable
              venues={venues}
              timeSlots={timeSlots}
              bookings={bookings}
              currentUser={currentUser}
              skillLevel="advanced"
              onMakeBooking={() => {}}
              onCancelBooking={() => {}}
              currentTime={getAdjustedTime()}
              isAdmin={true}
            />
          </div>
        )}

        {activeTab === 'venues' && (
          <VenueManager
            venues={venues}
            timeSlots={timeSlots}
            showNotification={showNotification}
            broadcastAdminAction={broadcastAdminAction}
          />
        )}

        {activeTab === 'users' && (
          <UserManager
            users={users}
            showNotification={showNotification}
            broadcastAdminAction={broadcastAdminAction}
          />
        )}

        {activeTab === 'messages' && (
          <div className="tab-content">
            <div className="messages-manager">
              <div className="messages-header">
                <h3>消息管理</h3>
                <button
                  className="btn primary"
                  onClick={() => setShowMessageBoard(true)}
                >
                  管理消息
                </button>
              </div>
              
              <div className="recent-messages">
                <h4>最近消息</h4>
                {messages.slice(0, 5).map(message => (
                  <div key={message.id} className="message-preview">
                    <div className="message-preview-header">
                      <span className="message-author">{message.author}</span>
                      <span className="message-date">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="message-preview-text">
                      {message.text.substring(0, 100)}
                      {message.text.length > 100 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showMessageBoard && (
        <MessageBoard
          messages={messages}
          onClose={() => setShowMessageBoard(false)}
          isAdmin={true}
          showNotification={showNotification}
          broadcastAdminAction={broadcastAdminAction}
        />
      )}
    </div>
  );
};

export default AdminApp;