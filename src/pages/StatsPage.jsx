import React, { useState, useEffect } from 'react'
import { getSessions } from '../utils/storage'
import { formatTime, formatDuration } from '../utils/storage'

export default function StatsPage() {
  const [sessions, setSessions] = useState([])
  const [period, setPeriod] = useState('all') // all, week, month

  useEffect(() => {
    setSessions(getSessions())
  }, [])

  const filteredSessions = sessions.filter(s => {
    if (period === 'all') return true
    const date = new Date(s.completedAt)
    const now = new Date()
    if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return date >= weekAgo
    }
    if (period === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      return date >= monthAgo
    }
    return true
  })

  const totalWorkouts = filteredSessions.length
  const totalTime = filteredSessions.reduce((acc, s) => acc + (s.totalTime || 0), 0)
  const totalSets = filteredSessions.reduce(
    (acc, s) => acc + (s.exercises?.reduce((a, e) => a + (e.completedSets || 0), 0) || 0),
    0
  )
  const avgTime = totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0

  // Workout frequency by name
  const workoutFreq = {}
  filteredSessions.forEach(s => {
    const name = s.workoutName || 'Sconosciuto'
    workoutFreq[name] = (workoutFreq[name] || 0) + 1
  })
  const topWorkouts = Object.entries(workoutFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Recent activity (last 7 days)
  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStr = date.toISOString().split('T')[0]
    const count = sessions.filter(s => s.completedAt?.startsWith(dayStr)).length
    last7.push({
      day: date.toLocaleDateString('it-IT', { weekday: 'short' }),
      count,
    })
  }
  const maxCount = Math.max(...last7.map(d => d.count), 1)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Statistiche</h1>
        <p className="page-subtitle">I tuoi progressi di allenamento</p>
      </div>

      {/* Period filter */}
      <div className="chip-group mb-6">
        {[
          { key: 'week', label: 'Settimana' },
          { key: 'month', label: 'Mese' },
          { key: 'all', label: 'Tutto' },
        ].map(p => (
          <button
            key={p.key}
            className={`chip ${period === p.key ? 'active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="stats-grid mb-6 animate-fade-in-up">
        <div className="stat-card">
          <div className="stat-value">{totalWorkouts}</div>
          <div className="stat-label">Allenamenti</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalTime > 0 ? formatDuration(totalTime) : '0m'}</div>
          <div className="stat-label">Tempo totale</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalSets}</div>
          <div className="stat-label">Set totali</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgTime > 0 ? formatDuration(avgTime) : '0m'}</div>
          <div className="stat-label">Media sessione</div>
        </div>
      </div>

      {/* Activity chart (last 7 days) */}
      <div className="card mb-6 animate-fade-in-up stagger-1">
        <h3 style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
          ATTIVITÀ ULTIMI 7 GIORNI
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          height: '100px',
          gap: 'var(--space-2)',
        }}>
          {last7.map((day, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flex: 1,
            }}>
              <div style={{
                width: '100%',
                maxWidth: '32px',
                height: `${Math.max(8, (day.count / maxCount) * 70)}px`,
                background: day.count > 0 ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                transition: 'height 0.5s ease-out',
                transitionDelay: `${i * 50}ms`,
              }} />
              <span style={{
                fontSize: '10px',
                color: day.count > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: day.count > 0 ? 600 : 400,
                textTransform: 'capitalize',
              }}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top workouts */}
      {topWorkouts.length > 0 && (
        <div className="card mb-6 animate-fade-in-up stagger-2">
          <h3 style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
            SCHEDE PIÙ UTILIZZATE
          </h3>
          <div className="list-gap">
            {topWorkouts.map(([name, count], i) => (
              <div key={name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-2) 0',
                borderBottom: i < topWorkouts.length - 1 ? '1px solid var(--border-color)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: i === 0 ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 700,
                    color: i === 0 ? 'white' : 'var(--text-secondary)',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 'var(--font-sm)' }}>{name}</span>
                </div>
                <span className="badge badge-primary">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {filteredSessions.length > 0 ? (
        <div className="animate-fade-in-up stagger-3">
          <h3 style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
            CRONOLOGIA
          </h3>
          <div className="list-gap">
            {[...filteredSessions].reverse().slice(0, 20).map((session, i) => (
              <div key={session.id || i} className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                      {session.workoutName}
                    </div>
                    <div className="text-secondary" style={{ fontSize: 'var(--font-xs)', marginTop: '2px' }}>
                      {session.completedAt
                        ? new Date(session.completedAt).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--accent-primary)' }}>
                      {session.totalTime ? formatDuration(session.totalTime) : '—'}
                    </div>
                    <div className="text-secondary" style={{ fontSize: 'var(--font-xs)' }}>
                      {session.exercises?.length || 0} esercizi
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2 className="empty-title">Nessun dato ancora</h2>
          <p className="empty-text">
            Completa il tuo primo allenamento per vedere le statistiche qui.
          </p>
        </div>
      )}
    </div>
  )
}
