import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import LoginForm from './components/LoginForm.jsx';
import UserApp from './components/UserApp.jsx';
import AdminApp from './components/AdminApp.jsx';
import Notification from './components/Notification.jsx';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  
  // Data state
  const [venues, setVenues] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookings, setBookings] = useState({});
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}`;
    const newSocket = io(socketUrl);
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus(true);
      if (currentUser) {
        newSocket.emit('user_login', { username: currentUser, isAdmin });
      }
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus(false);
    });
    
    newSocket.on('booking_update', handleBookingUpdate);
    newSocket.on('venue_update', handleVenueUpdate);
    newSocket.on('message_update', handleMessageUpdate);
    newSocket.on('user_update', handleUserUpdate);
    newSocket.on('user_activity', handleUserActivity);
    newSocket.on('admin_activity', handleAdminActivity);
    newSocket.on('connected_users', (users) => {
      setOnlineUsers(users.length);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, isAdmin]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load venues
      const venuesResponse = await fetch('/api/venues');
      const venuesData = await venuesResponse.json();
      setVenues(venuesData);
      
      // Load time slots
      const timeSlotsResponse = await fetch('/api/time-slots');
      const timeSlotsData = await timeSlotsResponse.json();
      setTimeSlots(timeSlotsData);
      
      // Load bookings
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();
      const formattedBookings = {};
      bookingsData.forEach(booking => {
        if (!formattedBookings[booking.venue_name]) {
          formattedBookings[booking.venue_name] = {};
        }
        if (!formattedBookings[booking.venue_name][booking.time_slot]) {
          formattedBookings[booking.venue_name][booking.time_slot] = [];
        }
        formattedBookings[booking.venue_name][booking.time_slot].push({
          username: booking.username,
          skillLevel: booking.skill_level
        });
      });
      setBookings(formattedBookings);
      
      // Load messages
      const messagesResponse = await fetch('/api/messages');
      const messagesData = await messagesResponse.json();
      setMessages(messagesData);
      
      // Load users
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      setUsers(usersData);
      
      console.log('Initial data loaded successfully');
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification('載入數據時發生錯誤', 'error');
    }
  };

  // Socket event handlers
  const handleBookingUpdate = useCallback((data) => {
    const { type, venueName, timeSlot, username, skillLevel } = data;
    setBookings(prev => {
      const newBookings = { ...prev };
      if (!newBookings[venueName]) {
        newBookings[venueName] = {};
      }
      if (!newBookings[venueName][timeSlot]) {
        newBookings[venueName][timeSlot] = [];
      }
      
      if (type === 'new_booking') {
        newBookings[venueName][timeSlot].push({ username, skillLevel });
      } else if (type === 'cancel_booking') {
        newBookings[venueName][timeSlot] = newBookings[venueName][timeSlot].filter(
          booking => booking.username !== username
        );
      }
      
      return newBookings;
    });
  }, []);

  const handleVenueUpdate = useCallback((data) => {
    const { type, name, capacity, isOpen } = data;
    setVenues(prev => {
      if (type === 'new_venue') {
        return [...prev, { name, capacity, is_open: isOpen }];
      } else if (type === 'update_venue') {
        return prev.map(venue => 
          venue.name === name ? { ...venue, capacity, is_open: isOpen } : venue
        );
      } else if (type === 'delete_venue') {
        return prev.filter(venue => venue.name !== name);
      }
      return prev;
    });
  }, []);

  const handleMessageUpdate = useCallback((data) => {
    const { type, message, id } = data;
    setMessages(prev => {
      if (type === 'new_message') {
        return [message, ...prev];
      } else if (type === 'delete_message') {
        return prev.filter(msg => msg.id !== parseInt(id));
      }
      return prev;
    });
  }, []);

  const handleUserUpdate = useCallback((data) => {
    const { type, username, skillLevel, isAdmin } = data;
    setUsers(prev => {
      if (type === 'new_user') {
        return [...prev, { username, skill_level: skillLevel, is_admin: isAdmin }];
      } else if (type === 'update_user') {
        return prev.map(user => 
          user.username === username ? { ...user, skill_level: skillLevel, is_admin: isAdmin } : user
        );
      } else if (type === 'delete_user') {
        return prev.filter(user => user.username !== username);
      }
      return prev;
    });
  }, []);

  const handleUserActivity = useCallback((data) => {
    const { type, username, isAdmin, totalUsers } = data;
    if (type === 'user_joined') {
      showNotification(`${username}${isAdmin ? ' (管理員)' : ''} 加入了會話`);
      setOnlineUsers(totalUsers);
    } else if (type === 'user_left') {
      showNotification(`${username} 離開了會話`);
      setOnlineUsers(totalUsers);
    }
  }, []);

  const handleAdminActivity = useCallback((data) => {
    const { type, admin, data: actionData } = data;
    switch(type) {
      case 'venue_added':
        showNotification(`管理員 ${admin} 新增了場地：${actionData.name}`, 'info');
        break;
      case 'venue_updated':
        showNotification(`管理員 ${admin} 更新了場地：${actionData.name}`, 'info');
        break;
      case 'venue_deleted':
        showNotification(`管理員 ${admin} 刪除了場地：${actionData.name}`, 'info');
        break;
      case 'message_added':
        showNotification(`管理員 ${admin} 發布了新消息`, 'info');
        break;
      case 'message_deleted':
        showNotification(`管理員 ${admin} 刪除了一條消息`, 'info');
        break;
      case 'user_added':
        showNotification(`管理員 ${admin} 新增了用戶：${actionData.username}`, 'info');
        break;
      case 'user_deleted':
        showNotification(`管理員 ${admin} 刪除了用戶：${actionData.username}`, 'info');
        break;
      default:
        break;
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleLogin = async (username, adminStatus) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, isAdmin: adminStatus }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(username);
        setIsAdmin(adminStatus);
        setIsLoggedIn(true);
        
        if (socket) {
          socket.emit('user_login', { username, isAdmin: adminStatus });
        }
        
        showNotification(`歡迎，${username}！`);
      } else {
        showNotification('登入失敗，請重試', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser('');
    setIsAdmin(false);
    setIsLoggedIn(false);
    showNotification('已成功登出');
  };

  const broadcastAdminAction = (type, data) => {
    if (socket && isAdmin) {
      socket.emit('admin_action', { type, data });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="App">
        <LoginForm onLogin={handleLogin} />
        <Notification notification={notification} />
      </div>
    );
  }

  return (
    <div className="App">
      {isAdmin ? (
        <AdminApp
          currentUser={currentUser}
          venues={venues}
          timeSlots={timeSlots}
          bookings={bookings}
          messages={messages}
          users={users}
          onLogout={handleLogout}
          showNotification={showNotification}
          broadcastAdminAction={broadcastAdminAction}
          connectionStatus={connectionStatus}
          onlineUsers={onlineUsers}
        />
      ) : (
        <UserApp
          currentUser={currentUser}
          venues={venues}
          timeSlots={timeSlots}
          bookings={bookings}
          messages={messages}
          onLogout={handleLogout}
          showNotification={showNotification}
          connectionStatus={connectionStatus}
          onlineUsers={onlineUsers}
        />
      )}
      <Notification notification={notification} />
    </div>
  );
}

export default App;