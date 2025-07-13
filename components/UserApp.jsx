import React, { useState, useEffect } from 'react';
import BookingTable from './BookingTable.jsx';
import MessageBoard from './MessageBoard.jsx';
import FilterSection from './FilterSection.jsx';
import SkillLevelSection from './SkillLevelSection.jsx';
import TimeManagementSection from './TimeManagementSection.jsx';
import './UserApp.css';

const UserApp = ({
  currentUser,
  venues,
  timeSlots,
  bookings,
  messages,
  onLogout,
  showNotification,
  connectionStatus,
  onlineUsers
}) => {
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [venueFilter, setVenueFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [showMessageBoard, setShowMessageBoard] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState({
    filters: false,
    skill: false,
    time: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleMakeBooking = async (venueName, timeSlot) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venueName,
          timeSlot,
          username: currentUser,
          skillLevel
        })
      });

      if (response.ok) {
        showNotification(`成功預約 ${venueName} 在 ${timeSlot}`);
      } else {
        const error = await response.json();
        showNotification(error.error || '預約失敗', 'error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const handleCancelBooking = async (venueName, timeSlot) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venueName,
          timeSlot,
          username: currentUser
        })
      });

      if (response.ok) {
        showNotification(`已取消 ${venueName} 在 ${timeSlot} 的預約`);
      } else {
        const error = await response.json();
        showNotification(error.error || '取消預約失敗', 'error');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const filterUpcoming = () => {
    const currentTimeMinutes = getCurrentTimeInMinutes();
    setTimeFilter(timeSlots.find(slot => {
      const slotMinutes = parseTimeToMinutes(slot);
      return slotMinutes >= currentTimeMinutes;
    }) || '');
  };

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentTimeInMinutes = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + timeOffset);
    return now.getHours() * 60 + now.getMinutes();
  };

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

  const getFilteredVenues = () => {
    if (!venueFilter) return venues;
    return venues.filter(venue => venue.name === venueFilter);
  };

  const getFilteredTimeSlots = () => {
    if (!timeFilter) return timeSlots;
    return timeSlots.filter(slot => slot === timeFilter);
  };

  return (
    <div className="user-app">
      <div className="header">
        <div className="main-header">
          <div className="header-left">
            <h2>📋 場地預約系統</h2>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-id">用戶：{currentUser}</div>
              <div className="current-time">
                {getAdjustedTime().toLocaleTimeString()}
              </div>
              <div className="connection-info">
                <div className={`connection-status ${connectionStatus ? 'connected' : 'disconnected'}`}>
                  {connectionStatus ? '已連接' : '未連接'}
                </div>
                <div className="online-users">在線：{onlineUsers}</div>
              </div>
            </div>
            <button className="btn primary" onClick={() => setShowMessageBoard(true)}>
              📢 消息
            </button>
            <button className="btn secondary" onClick={onLogout}>
              登出
            </button>
          </div>
        </div>

        <div className="collapsible-sections">
          <FilterSection
            collapsed={collapsedSections.filters}
            onToggle={() => toggleSection('filters')}
            venues={venues}
            timeSlots={timeSlots}
            venueFilter={venueFilter}
            timeFilter={timeFilter}
            onVenueFilterChange={setVenueFilter}
            onTimeFilterChange={setTimeFilter}
            onFilterUpcoming={filterUpcoming}
          />

          <SkillLevelSection
            collapsed={collapsedSections.skill}
            onToggle={() => toggleSection('skill')}
            skillLevel={skillLevel}
            onSkillLevelChange={setSkillLevel}
          />

          <TimeManagementSection
            collapsed={collapsedSections.time}
            onToggle={() => toggleSection('time')}
            currentTime={getAdjustedTime()}
            timeOffset={timeOffset}
            onAdjustTime={adjustTimeOffset}
            onResetTime={resetTimeOffset}
          />
        </div>
      </div>

      <div className="main-content">
        <BookingTable
          venues={getFilteredVenues()}
          timeSlots={getFilteredTimeSlots()}
          bookings={bookings}
          currentUser={currentUser}
          skillLevel={skillLevel}
          onMakeBooking={handleMakeBooking}
          onCancelBooking={handleCancelBooking}
          currentTime={getAdjustedTime()}
        />

        <div className="legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>可預約</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>已預約</span>
          </div>
          <div className="legend-item">
            <div className="legend-color closed"></div>
            <span>關閉</span>
          </div>
        </div>
      </div>

      {showMessageBoard && (
        <MessageBoard
          messages={messages}
          onClose={() => setShowMessageBoard(false)}
          isAdmin={false}
        />
      )}
    </div>
  );
};

export default UserApp;