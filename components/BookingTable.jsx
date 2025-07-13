import React from 'react';
import './BookingTable.css';

const BookingTable = ({
  venues,
  timeSlots,
  bookings,
  currentUser,
  skillLevel,
  onMakeBooking,
  onCancelBooking,
  currentTime
}) => {
  const isVenueOpenOnDate = (venue, date) => {
    // 假設場地開放（實際邏輯可能需要從後端獲取）
    return venue.is_open !== false;
  };

  const createCellContent = (venue, slot) => {
    const venueBookings = bookings[venue.name] && bookings[venue.name][slot] ? 
      bookings[venue.name][slot] : [];
    const capacity = venue.capacity || 4;
    const hasUserBooking = venueBookings.some(booking => booking.username === currentUser);
    
    if (!isVenueOpenOnDate(venue, new Date())) {
      return (
        <div className="cell-content venue-closed">
          <div className="closed-text">關閉</div>
        </div>
      );
    }

    const isFull = venueBookings.length >= capacity;
    const isAvailable = !isFull;

    const handleClick = () => {
      if (hasUserBooking) {
        onCancelBooking(venue.name, slot);
      } else if (isAvailable) {
        onMakeBooking(venue.name, slot);
      }
    };

    return (
      <div 
        className={`cell-content ${isAvailable && !hasUserBooking ? 'available' : 'occupied'} ${hasUserBooking ? 'user-booking' : ''}`}
        onClick={handleClick}
        style={{ cursor: isAvailable || hasUserBooking ? 'pointer' : 'not-allowed' }}
      >
        <div className="capacity-info">
          {venueBookings.length}/{capacity}
        </div>
        
        {venueBookings.length > 0 && (
          <div className="booking-users">
            {venueBookings.map((booking, index) => (
              <div 
                key={index} 
                className={`user-indicator ${booking.username === currentUser ? 'current-user' : ''}`}
                title={`${booking.username} (${booking.skillLevel})`}
              >
                {getUserInitials(booking.username)}
              </div>
            ))}
          </div>
        )}
        
        {isAvailable && !hasUserBooking && (
          <div className="available-text">點擊預約</div>
        )}
        
        {hasUserBooking && (
          <div className="cancel-text">點擊取消</div>
        )}
      </div>
    );
  };

  const getUserInitials = (username) => {
    if (!username) return '';
    const words = username.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
  };

  const isTimeSlotPast = (slot) => {
    const slotTime = parseTimeToMinutes(slot);
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return slotTime < currentTimeMinutes;
  };

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  if (venues.length === 0 || timeSlots.length === 0) {
    return (
      <div className="booking-table-container">
        <div className="loading">載入中...</div>
      </div>
    );
  }

  return (
    <div className="booking-table-container">
      <div className="timetable-container">
        <table className="timetable">
          <thead>
            <tr>
              <th>時間</th>
              {venues.map(venue => (
                <th key={venue.name}>{venue.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot} className={isTimeSlotPast(slot) ? 'past-time' : ''}>
                <td className="time-cell">{slot}</td>
                {venues.map(venue => (
                  <td key={`${venue.name}-${slot}`} className="venue-cell">
                    {createCellContent(venue, slot)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;