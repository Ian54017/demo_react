import React from 'react';
import './SkillLevelSection.css';

const SkillLevelSection = ({ collapsed, onToggle, skillLevel, onSkillLevelChange }) => {
  const skillLevels = [
    { value: 'beginner', label: '初學者' },
    { value: 'intermediate', label: '中等' },
    { value: 'advanced', label: '高階' }
  ];

  return (
    <div className="collapsible-section">
      <div className="section-header" onClick={onToggle}>
        🎯 技能水準
        <span className={`chevron ${collapsed ? '' : 'expanded'}`}>▼</span>
      </div>
      {!collapsed && (
        <div className="section-content">
          <div className="skill-level-section">
            {skillLevels.map(level => (
              <label key={level.value} className="skill-level-option">
                <input
                  type="radio"
                  name="skillLevel"
                  value={level.value}
                  checked={skillLevel === level.value}
                  onChange={(e) => onSkillLevelChange(e.target.value)}
                />
                <span>{level.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillLevelSection;