import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatTime, formatDuration } from '../utils/storage'

export default function WorkoutCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = location.state

  if (!session) {
    return (
      <div className="completion-page">
        <div className="completion-emoji">🏋️</div>
        <h1 className="completion-title">Nessun dato</h1>
        <p className="completion-subtitle">Non ci sono dati della sessione da mostrare.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
          Torna alla Home
        </button>
      </div>
    )
  }

  return (
    <div className="completion-page">
      <div className="completion-emoji">🎉</div>
      <h1 className="completion-title animate-fade-in-up">Grande lavoro!</h1>
      <p className="completion-subtitle animate-fade-in-up stagger-1">
        Hai completato <strong>{session.workoutName}</strong>
      </p>

      {/* Stats */}
      <div className="stats-grid animate-fade-in-up stagger-2" style={{ width: '100%', maxWidth: '360px', marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-value">{formatTime(session.totalTime)}</div>
          <div className="stat-label">Durata totale</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{session.exercises?.length || 0}</div>
          <div className="stat-label">Esercizi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {session.exercises?.reduce((a, e) => a + (e.completedSets || 0), 0) || 0}
          </div>
          <div className="stat-label">Set completati</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {session.totalTime > 0
              ? Math.round(session.totalTime / 60)
              : 0}
          </div>
          <div className="stat-label">Minuti</div>
        </div>
      </div>

      {/* Per exercise breakdown */}
      {session.exercises && session.exercises.length > 0 && (
        <div className="animate-fade-in-up stagger-3" style={{ width: '100%', maxWidth: '360px', marginBottom: 'var(--space-8)' }}>
          <h3 style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)', textAlign: 'left' }}>
            DETTAGLI ESERCIZI
          </h3>
          <div className="list-gap">
            {session.exercises.map((ex, i) => (
              <div key={i} className="card" style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{ex.name}</div>
                    <div className="text-secondary" style={{ fontSize: 'var(--font-xs)' }}>
                      {ex.completedSets}/{ex.sets} set · {ex.reps} reps
                    </div>
                  </div>
                  {session.exerciseDurations?.[i] !== undefined && (
                    <span className="badge badge-primary">
                      {formatDuration(session.exerciseDurations[i])}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%', maxWidth: '360px' }}>
        <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/')} id="btn-go-home">
          Torna alla Home 🏠
        </button>
        <button className="btn btn-secondary btn-lg btn-full" onClick={() => navigate('/stats')} id="btn-go-stats">
          Vedi Statistiche 📊
        </button>
      </div>
    </div>
  )
}
