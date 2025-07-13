import React from 'react';
import './TimeManagementSection.css';

const TimeManagementSection = ({
  collapsed,
  onToggle,
  currentTime,
  timeOffset,
  onAdjustTime,
  onResetTime
}) => {
  return (
    <div className="collapsible-section">
      <div className="section-header" onClick={onToggle}>
        ⏰ 時間管理
        <span className={`chevron ${collapsed ? '' : 'expanded'}`}>▼</span>
      </div>
      {!collapsed && (
        <div className="section-content">
          <div className="time-management">
            <div className="time-display">
              當前時間：{currentTime.toLocaleTimeString()}
              {timeOffset !== 0 && (
                <span className="time-offset">
                  ({timeOffset > 0 ? '+' : ''}{timeOffset}分鐘)
                </span>
              )}
            </div>
            
            <div className="time-controls">
              <button 
                className="btn secondary"
                onClick={() => onAdjustTime(-15)}
              >
                -15分
              </button>
              <button 
                className="btn secondary"
                onClick={() => onAdjustTime(-5)}
              >
                -5分
              </button>
              <button 
                className="btn secondary"
                onClick={() => onAdjustTime(5)}
              >
                +5分
              </button>
              <button 
                className="btn secondary"
                onClick={() => onAdjustTime(15)}
              >
                +15分
              </button>
              <button 
                className="btn secondary"
                onClick={onResetTime}
              >
                重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeManagementSection;