import React, { useState, useEffect } from 'react';
import { Bell, Check, BellRing } from 'lucide-react';
import { markNotificationRead } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const EmployeeNotifications = ({ notifications = [], onRefresh }) => {
  const { showToast } = useToast();
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setLocalNotifications(notifications);
    } else {
      // Fallback hardcoded notifications when empty
      setLocalNotifications([
        {
          _id: 'mock-notif-2',
          text: 'Your leave request for WFH has been reviewed and approved by HR.',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'Leave'
        },
        {
          _id: 'mock-notif-1',
          text: 'Welcome to OrbitWorks Portal! Complete your profile contact details to get started.',
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'System'
        }
      ]);
    }
  }, [notifications]);

  const handleMarkRead = async (id) => {
    try {
      if (id.startsWith('mock-')) {
        setLocalNotifications(prev => prev.map(n => (n._id || n.id) === id ? { ...n, read: true } : n));
        showToast('Notification marked as read!');
      } else {
        await markNotificationRead(id);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const mockIds = localNotifications.filter(n => !n.read && (n._id || n.id).startsWith('mock-')).map(n => n._id || n.id);
      const realIds = localNotifications.filter(n => !n.read && !(n._id || n.id).startsWith('mock-')).map(n => n._id || n.id);
      
      if (realIds.length > 0) {
        await Promise.all(realIds.map(id => markNotificationRead(id)));
      }
      
      if (mockIds.length > 0 || realIds.length > 0) {
        setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast('All notifications marked as read!');
      }
      
      if (realIds.length > 0) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = localNotifications.filter(n => !n.read).length;

  return (
    <div 
      className="card" 
      style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
            Notifications
          </h4>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            You have {unreadCount} unread notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead} 
            className="secondary" 
            style={{ fontSize: '0.92rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {localNotifications.length > 0 ? (
          localNotifications.map((n) => {
            const notifId = n._id || n.id;
            const notifTime = n.createdAt || n.time;
            return (
              <div 
                key={notifId} 
                style={{ 
                  display: 'flex', 
                  gap: '1.25rem', 
                  alignItems: 'center', 
                  padding: '1rem 1.25rem', 
                  border: '1.5px solid var(--border)', 
                  borderRadius: '10px', 
                  backgroundColor: n.read ? 'transparent' : 'var(--bg)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ color: n.read ? 'var(--text-secondary)' : 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                  {n.read ? <Bell size={20} /> : <BellRing size={20} />}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.98rem', color: 'var(--text-primary)', fontWeight: n.read ? '400' : '700', lineHeight: '1.4' }}>
                    {n.text}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {notifTime ? new Date(notifTime).toLocaleString() : ''}
                  </span>
                </div>

                {!n.read && (
                  <button 
                    onClick={() => handleMarkRead(notifId)}
                    className="secondary" 
                    style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center' }}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>
            No notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications;
