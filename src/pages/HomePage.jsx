import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getWorkouts, getSessions, getActiveSession } from '../utils/storage'
import { formatDuration } from '../utils/storage'
import { IconPlay, IconPlus, IconFire, IconTarget, IconClock, IconArrowRight } from '../components/Icons'
import { ToastContext } from '../App'

export default function HomePage() {
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)
  const [user] = useState(() => getUser())
  const [workouts, setWorkouts] = useState([])
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    setWorkouts(getWorkouts())
    setSessions(getSessions())
    setActiveSession(getActiveSession())
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buongiorno'
    if (hour < 18) return 'Buon pomeriggio'
    return 'Buonasera'
  }

  const totalSessions = sessions.length
  const totalTime = sessions.reduce((acc, s) => acc + (s.totalTime || 0), 0)
  const thisWeek = sessions.filter(s => {
    const d = new Date(s.completedAt)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return d >= weekStart
  }).length

  return (
    <div className="page">
      <div className="page-header">
        <p className="text-secondary" style={{ fontSize: 'var(--font-sm)' }}>{greeting()}</p>
        <h1 className="page-title">{user?.name || 'Atleta'}</h1>
      </div>

      {/* Resume active session */}
      {activeSession && (
        <div
          className="card animate-fade-in-up"
          style={{
            marginBottom: 'var(--space-4)',
            borderColor: 'var(--accent-primary)',
            cursor: 'pointer',
            background: 'var(--gradient-card)',
          }}
          onClick={() => navigate(`/workout/session/${activeSession.workoutId}`)}
          id="resume-session"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)', display: 'inline-block' }}>
                ⏸ In corso
              </span>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>
                {activeSession.workoutName}
              </h3>
              <p className="text-secondary" style={{ fontSize: 'var(--font-sm)', marginTop: '4px' }}>
                Tocca per riprendere l'allenamento
              </p>
            </div>
            <IconArrowRight size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="stats-grid animate-fade-in-up stagger-1" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-value">{totalSessions}</div>
          <div className="stat-label">Allenamenti</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{thisWeek}</div>
          <div className="stat-label">Questa settimana</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{workouts.length}</div>
          <div className="stat-label">Schede</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalTime > 0 ? formatDuration(totalTime) : '0m'}</div>
          <div className="stat-label">Tempo totale</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-title">Azione rapida</div>
      <div className="list-gap animate-fade-in-up stagger-2" style={{ marginBottom: 'var(--space-6)' }}>
        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={() => navigate('/workout/new')}
          id="btn-new-workout"
          style={{ gap: 'var(--space-3)' }}
        >
          <IconPlus size={20} />
          Crea Nuova Scheda
        </button>
      </div>

      {/* Workouts list */}
      {workouts.length > 0 && (
        <>
          <div className="section-title-row">
            <span className="section-title" style={{ marginBottom: 0 }}>Le tue schede</span>
            <button className="btn btn-ghost" onClick={() => navigate('/workouts')} style={{ fontSize: 'var(--font-sm)' }}>
              Vedi tutte <IconArrowRight size={16} />
            </button>
          </div>
          <div className="list-gap animate-fade-in-up stagger-3">
            {workouts.slice(0, 3).map(workout => (
              <div key={workout.id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--font-base)' }}>{workout.name}</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                      <span className="badge badge-primary">
                        {workout.exercises?.length || 0} esercizi
                      </span>
                      {workout.restTime && (
                        <span className="badge badge-success">
                          <IconClock size={12} style={{ marginRight: '4px' }} />
                          {workout.restTime}s rest
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-success btn-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/workout/session/${workout.id}`)
                    }}
                    id={`btn-start-${workout.id}`}
                    title="Inizia allenamento"
                  >
                    <IconPlay size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {workouts.length === 0 && !activeSession && (
        <div className="empty-state animate-fade-in-up stagger-2">
          <div className="empty-icon"></div>
          <h2 className="empty-title">Nessuna scheda ancora</h2>
          <p className="empty-text">
            Crea la tua prima scheda di allenamento e inizia a tracciare i tuoi progressi!
          </p>
        </div>
      )}
    </div>
  )
}
