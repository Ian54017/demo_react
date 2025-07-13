import React, { useState } from 'react';
import './VenueManager.css';

const VenueManager = ({ venues, timeSlots, showNotification, broadcastAdminAction }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 4,
    timeSlots: timeSlots || [],
    isOpen: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showNotification('請填寫場地名稱', 'error');
      return;
    }

    const isEditing = editingVenue !== null;
    const url = '/api/venue';
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          capacity: formData.capacity,
          timeSlots: formData.timeSlots,
          isOpen: formData.isOpen,
          ...(isEditing && { originalName: editingVenue.name })
        })
      });

      if (response.ok) {
        const action = isEditing ? 'venue_updated' : 'venue_added';
        showNotification(`場地${isEditing ? '更新' : '新增'}成功`);
        broadcastAdminAction(action, {
          name: formData.name,
          capacity: formData.capacity,
          isOpen: formData.isOpen
        });
        resetForm();
      } else {
        const error = await response.json();
        showNotification(error.error || `場地${isEditing ? '更新' : '新增'}失敗`, 'error');
      }
    } catch (error) {
      console.error('Error saving venue:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      capacity: venue.capacity || 4,
      timeSlots: venue.time_slots || timeSlots || [],
      isOpen: venue.is_open !== false
    });
    setShowAddForm(true);
  };

  const handleDelete = async (venueName) => {
    if (!window.confirm(`確定要刪除場地 "${venueName}" 嗎？這將同時刪除該場地的所有預約。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/venue/${encodeURIComponent(venueName)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('場地刪除成功');
        broadcastAdminAction('venue_deleted', { name: venueName });
      } else {
        const error = await response.json();
        showNotification(error.error || '場地刪除失敗', 'error');
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      showNotification('網路錯誤，請重試', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 4,
      timeSlots: timeSlots || [],
      isOpen: true
    });
    setEditingVenue(null);
    setShowAddForm(false);
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, '19:00']
    }));
  };

  const removeTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index, value) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => i === index ? value : slot)
    }));
  };

  return (
    <div className="venue-manager">
      <div className="manager-header">
        <h3>場地管理</h3>
        <button 
          className="btn primary"
          onClick={() => setShowAddForm(true)}
        >
          新增場地
        </button>
      </div>

      <div className="venues-grid">
        {venues.map(venue => (
          <div key={venue.name} className="venue-card">
            <div className="venue-card-header">
              <h4>{venue.name}</h4>
              <div className={`venue-status ${venue.is_open !== false ? 'open' : 'closed'}`}>
                {venue.is_open !== false ? '開放' : '關閉'}
              </div>
            </div>
            
            <div className="venue-details">
              <div className="detail-item">
                <span className="label">容量：</span>
                <span className="value">{venue.capacity || 4} 人</span>
              </div>
              <div className="detail-item">
                <span className="label">時段：</span>
                <span className="value">{venue.time_slots ? venue.time_slots.length : timeSlots.length} 個</span>
              </div>
            </div>

            <div className="venue-actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(venue)}
              >
                編輯
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(venue.name)}
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="venue-form-overlay">
          <div className="venue-form">
            <div className="form-header">
              <h4>{editingVenue ? '編輯場地' : '新增場地'}</h4>
              <button 
                className="close-btn"
                onClick={resetForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="venueName">場地名稱：</label>
                <input
                  type="text"
                  id="venueName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">容量：</label>
                <select
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                >
                  <option value={2}>2 人</option>
                  <option value={4}>4 人</option>
                  <option value={6}>6 人</option>
                  <option value={8}>8 人</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isOpen}
                    onChange={(e) => setFormData(prev => ({ ...prev, isOpen: e.target.checked }))}
                  />
                  場地開放
                </label>
              </div>

              <div className="form-group">
                <label>時段設定：</label>
                <div className="time-slots-manager">
                  {formData.timeSlots.map((slot, index) => (
                    <div key={index} className="time-slot-item">
                      <input
                        type="time"
                        value={slot}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                      />
                      <button
                        type="button"
                        className="remove-slot-btn"
                        onClick={() => removeTimeSlot(index)}
                      >
                        刪除
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-slot-btn"
                    onClick={addTimeSlot}
                  >
                    新增時段
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn primary">
                  {editingVenue ? '更新' : '新增'}
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

export default VenueManager;