import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, highlight }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.35rem', flex: 1, minWidth: '220px', padding: '1.25rem' }}>
      {Icon && (
        <div 
          style={{ 
            padding: '0.85rem', 
            backgroundColor: highlight ? 'rgba(137, 225, 247, 0.15)' : 'var(--bg)', 
            borderRadius: '12px', 
            border: '1px solid var(--border)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Icon size={22} style={{ color: highlight ? '#087E8B' : 'var(--text-secondary)' }} />
        </div>
      )}
      <div>
        <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: '500' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
          {value}
        </div>
        {description && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
