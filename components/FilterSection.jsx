import React from 'react';
import './FilterSection.css';

const FilterSection = ({
  collapsed,
  onToggle,
  venues,
  timeSlots,
  venueFilter,
  timeFilter,
  onVenueFilterChange,
  onTimeFilterChange,
  onFilterUpcoming
}) => {
  return (
    <div className="collapsible-section">
      <div className="section-header" onClick={onToggle}>
        🔍 篩選
        <span className={`chevron ${collapsed ? '' : 'expanded'}`}>▼</span>
      </div>
      {!collapsed && (
        <div className="section-content">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="venueFilter">場地：</label>
              <select
                id="venueFilter"
                value={venueFilter}
                onChange={(e) => onVenueFilterChange(e.target.value)}
              >
                <option value="">所有場地</option>
                {venues.map(venue => (
                  <option key={venue.name} value={venue.name}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="timeFilter">時間：</label>
              <select
                id="timeFilter"
                value={timeFilter}
                onChange={(e) => onTimeFilterChange(e.target.value)}
              >
                <option value="">所有時間</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn secondary" onClick={onFilterUpcoming}>
              篩選可用時段
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;