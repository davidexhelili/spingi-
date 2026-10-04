import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkouts, deleteWorkout } from '../utils/storage'
import { IconPlus, IconPlay, IconEdit, IconTrash, IconClock } from '../components/Icons'
import { ToastContext } from '../App'

export default function WorkoutsPage() {
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)
  const [workouts, setWorkouts] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    setWorkouts(getWorkouts())
  }, [])

  const handleDelete = (id) => {
    deleteWorkout(id)
    setWorkouts(getWorkouts())
    setDeleteConfirm(null)
    showToast('Scheda eliminata')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Le tue Schede</h1>
        <p className="page-subtitle">Gestisci i tuoi piani di allenamento</p>
      </div>

      <button
        className="btn btn-primary btn-lg btn-full mb-6"
        onClick={() => navigate('/workout/new')}
        id="btn-create-workout"
      >
        <IconPlus size={20} />
        Crea Nuova Scheda
      </button>

      {workouts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2 className="empty-title">Nessuna scheda</h2>
          <p className="empty-text">
            Crea la tua prima scheda di allenamento con tutti gli esercizi, serie e ripetizioni.
          </p>
        </div>
      ) : (
        <div className="list-gap">
          {workouts.map((workout, index) => (
            <div
              key={workout.id}
              className="card animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 'var(--font-lg)', marginBottom: 'var(--space-2)' }}>
                    {workout.name}
                  </h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">
                      {workout.exercises?.length || 0} esercizi
                    </span>
                    {workout.restTime && (
                      <span className="badge badge-success">
                        <IconClock size={12} style={{ marginRight: '4px' }} />
                        {workout.restTime}s riposo
                      </span>
                    )}
                  </div>
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div style={{
                      marginTop: 'var(--space-3)',
                      fontSize: 'var(--font-sm)',
                      color: 'var(--text-tertiary)',
                      lineHeight: 1.5,
                    }}>
                      {workout.exercises.slice(0, 3).map(ex => ex.name).join(' · ')}
                      {workout.exercises.length > 3 && ` +${workout.exercises.length - 3}`}
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-color)',
                paddingTop: 'var(--space-3)',
              }}>
                <button
                  className="btn btn-success flex-1"
                  onClick={() => navigate(`/workout/session/${workout.id}`)}
                  id={`btn-start-workout-${workout.id}`}
                >
                  <IconPlay size={16} /> Inizia
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/workout/edit/${workout.id}`)}
                  id={`btn-edit-${workout.id}`}
                >
                  <IconEdit size={16} />
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setDeleteConfirm(workout.id)}
                  style={{ color: 'var(--accent-danger)' }}
                  id={`btn-delete-${workout.id}`}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Eliminare la scheda?</h2>
            <p className="text-secondary">Questa azione non può essere annullata.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>
                Annulla
              </button>
              <button className="btn btn-danger flex-1" onClick={() => handleDelete(deleteConfirm)} id="btn-confirm-delete">
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
