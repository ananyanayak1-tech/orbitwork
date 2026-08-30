import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTasks, getAttendance, getKudos, getWellnessLogs } from '../../services/api';
import { Award, Clock, HeartHandshake, Zap, ShieldCheck } from 'lucide-react';

const Achievements = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [kudos, setKudos] = useState([]);
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, a, k, w] = await Promise.all([
          getTasks(),
          getAttendance(),
          getKudos(),
          getWellnessLogs()
        ]);
        setTasks(t);
        setAttendance(a);
        setKudos(k);
        setWellnessLogs(w);
      } catch (err) {
        console.error('Failed to load badges stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats for current logged-in employee
  const completedTasksCount = tasks.filter(t => 
    t.assignee?.toLowerCase() === user.email.toLowerCase() && 
    t.status?.toLowerCase() === 'completed'
  ).length;

  const userAttendance = attendance.filter(a => 
    a.email?.toLowerCase() === user.email.toLowerCase()
  );
  const earlyCheckins = userAttendance.filter(a => {
    // If check-in mode isn't late (or simply has checked in)
    return a.checkInTime && !a.notes?.toLowerCase().includes('late');
  }).length;

  const receivedKudosCount = kudos.filter(k => 
    k.recipientId === user.id || 
    k.recipientName?.toLowerCase() === user.name?.toLowerCase()
  ).length;

  const wellnessCheckinCount = wellnessLogs.length;

  // Define badges with unlock criteria
  const badgesList = [
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Check in early without late markings',
      icon: Clock,
      color: '#4AA9E8',
      criteria: 'Requires 1 early check-in',
      unlocked: earlyCheckins > 0,
      progress: earlyCheckins >= 1 ? 100 : 0,
      statText: `${earlyCheckins}/1 early check-in`
    },
    {
      id: 'task_crusher',
      title: 'Task Crusher',
      description: 'Complete tasks assigned to you',
      icon: Award,
      color: '#8B5CF6',
      criteria: 'Complete 3 tasks',
      unlocked: completedTasksCount >= 3,
      progress: Math.min(Math.round((completedTasksCount / 3) * 100), 100),
      statText: `${completedTasksCount}/3 tasks completed`
    },
    {
      id: 'kudos_star',
      title: 'Team Player',
      description: 'Receive public appreciation kudos from peers',
      icon: HeartHandshake,
      color: '#EC4899',
      criteria: 'Receive 1 kudos post',
      unlocked: receivedKudosCount > 0,
      progress: receivedKudosCount >= 1 ? 100 : 0,
      statText: `${receivedKudosCount}/1 kudos received`
    },
    {
      id: 'health_champion',
      title: 'Consistent Wellness',
      description: 'Keep logging daily wellness logs',
      icon: Zap,
      color: '#10B981',
      criteria: 'Log 2 mood check-ins',
      unlocked: wellnessCheckinCount >= 2,
      progress: Math.min(Math.round((wellnessCheckinCount / 2) * 100), 100),
      statText: `${wellnessCheckinCount}/2 check-ins logged`
    }
  ];

  const unlockedCount = badgesList.filter(b => b.unlocked).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Gamified Task Badges</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Unlock official OrbitWorks medals and achievements by checking in and finishing tasks</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Computing achievements and badges...
        </div>
      ) : (
        <>
          {/* Summary Progress Box */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(29, 112, 184, 0.1)',
              color: '#1D70B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(29, 112, 184, 0.1)'
            }}>
              <Award size={36} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                Medals Collection
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You have unlocked <strong>{unlockedCount} of {badgesList.length}</strong> available career achievement medals!
              </p>
            </div>

            <div style={{ width: '180px', height: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ width: `${(unlockedCount / badgesList.length) * 100}%`, height: '100%', backgroundColor: '#1D70B8' }} />
            </div>
          </div>

          {/* Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {badgesList.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '1rem',
                    position: 'relative',
                    opacity: badge.unlocked ? 1 : 0.65,
                    border: badge.unlocked ? `2.5px solid ${badge.color}` : '1.5px solid var(--border)',
                    boxShadow: badge.unlocked ? `0 6px 15px ${badge.color}15` : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Lock Overlay Icon */}
                  {!badge.unlocked && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.45rem',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      Locked
                    </div>
                  )}

                  {badge.unlocked && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      color: badge.color,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <ShieldCheck size={18} />
                    </div>
                  )}

                  {/* Medal Icon Ring */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: badge.unlocked ? `${badge.color}15` : 'var(--bg)',
                    color: badge.unlocked ? badge.color : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1.5px solid ${badge.unlocked ? badge.color : 'var(--border)'}`
                  }}>
                    <BadgeIcon size={28} />
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{badge.title}</h4>
                    <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>{badge.description}</p>
                  </div>

                  {/* Progress Line */}
                  <div style={{ width: '100%', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                      <span>{badge.criteria}</span>
                      <span>{badge.statText}</span>
                    </div>
                    
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{ width: `${badge.progress}%`, height: '100%', backgroundColor: badge.color }} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
};

export default Achievements;
