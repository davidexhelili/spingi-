import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWorkoutById, saveWorkout, generateId } from '../utils/storage'
import { IconPlus, IconTrash, IconArrowLeft, IconMinus, IconChevronDown } from '../components/Icons'
import { ToastContext } from '../App'

const MUSCLE_GROUPS = [
  'Petto', 'Schiena', 'Spalle', 'Bicipiti', 'Tricipiti',
  'Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Addominali', 'Avambracci', 'Altro'
]

function emptyExercise() {
  return {
    id: generateId(),
    name: '',
    muscle: '',
    sets: 3,
    reps: '10',
    weight: '',
    restTime: 90,
    notes: '',
  }
}

export default function WorkoutEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useContext(ToastContext)
  const isEditing = !!id

  const [name, setName] = useState('')
  const [restTime, setRestTime] = useState(90)
  const [exercises, setExercises] = useState([emptyExercise()])
  const [expandedExercise, setExpandedExercise] = useState(0)

  useEffect(() => {
    if (isEditing) {
      const workout = getWorkoutById(id)
      if (workout) {
        setName(workout.name)
        setRestTime(workout.restTime || 90)
        setExercises(workout.exercises || [emptyExercise()])
      } else {
        navigate('/workouts')
        showToast('Scheda non trovata', 'error')
      }
    }
  }, [id])

  const updateExercise = (index, field, value) => {
    setExercises(prev => prev.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    ))
  }

  const addExercise = () => {
    const newEx = emptyExercise()
    setExercises(prev => [...prev, newEx])
    setExpandedExercise(exercises.length)
  }

  const removeExercise = (index) => {
    if (exercises.length <= 1) {
      showToast('Serve almeno un esercizio', 'error')
      return
    }
    setExercises(prev => prev.filter((_, i) => i !== index))
    if (expandedExercise >= index && expandedExercise > 0) {
      setExpandedExercise(prev => prev - 1)
    }
  }

  const moveExercise = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= exercises.length) return
    const updated = [...exercises]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setExercises(updated)
    setExpandedExercise(newIndex)
  }

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Dai un nome alla scheda', 'error')
      return
    }

    const validExercises = exercises.filter(ex => ex.name.trim())
    if (validExercises.length === 0) {
      showToast('Aggiungi almeno un esercizio', 'error')
      return
    }

    saveWorkout({
      id: id || generateId(),
      name: name.trim(),
      restTime,
      exercises: validExercises,
    })

    showToast(isEditing ? 'Scheda aggiornata! ✓' : 'Scheda creata! 🎉')
    navigate('/workouts')
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} id="btn-back">
          <IconArrowLeft size={22} />
        </button>
        <div>
          <h1 className="page-title" style={{ fontSize: 'var(--font-2xl)' }}>
            {isEditing ? 'Modifica Scheda' : 'Nuova Scheda'}
          </h1>
        </div>
      </div>

      {/* Workout Info */}
      <div className="card mb-6 animate-fade-in-up">
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Nome della scheda *</label>
          <input
            type="text"
            className="input-field"
            placeholder="es. Push Day, Upper Body, Giorno A..."
            value={name}
            onChange={e => setName(e.target.value)}
            id="input-workout-name"
          />
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Tempo di riposo predefinito (secondi)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              className="btn btn-secondary btn-icon-sm"
              onClick={() => setRestTime(prev => Math.max(15, prev - 15))}
              type="button"
            >
              <IconMinus size={16} />
            </button>
            <input
              type="number"
              className="input-field"
              style={{ textAlign: 'center', maxWidth: '100px' }}
              value={restTime}
              onChange={e => setRestTime(Math.max(0, parseInt(e.target.value) || 0))}
              id="input-rest-time"
            />
            <button
              className="btn btn-secondary btn-icon-sm"
              onClick={() => setRestTime(prev => prev + 15)}
              type="button"
            >
              <IconPlus size={16} />
            </button>
            <span className="input-suffix">sec</span>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="section-title-row">
        <span className="section-title" style={{ marginBottom: 0 }}>
          Esercizi ({exercises.length})
        </span>
      </div>

      <div className="list-gap mb-4">
        {exercises.map((exercise, index) => {
          const isExpanded = expandedExercise === index
          return (
            <div
              key={exercise.id}
              className="card animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Exercise header - clickable to expand/collapse */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedExercise(isExpanded ? -1 : index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-base)' }}>
                    {exercise.name || `Esercizio ${index + 1}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {!isExpanded && exercise.name && (
                    <span className="text-secondary" style={{ fontSize: 'var(--font-xs)' }}>
                      {exercise.sets}×{exercise.reps}
                    </span>
                  )}
                  <IconChevronDown
                    size={18}
                    style={{
                      color: 'var(--text-tertiary)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-fast)',
                    }}
                  />
                </div>
              </div>

              {/* Expanded form */}
              {isExpanded && (
                <div style={{ marginTop: 'var(--space-4)', animation: 'fadeIn 0.2s ease-out' }}>
                  <div className="input-group">
                    <label className="input-label">Nome esercizio *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="es. Panca piana, Squat, Curl..."
                      value={exercise.name}
                      onChange={e => updateExercise(index, 'name', e.target.value)}
                      autoFocus={!exercise.name}
                      id={`input-exercise-name-${index}`}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Gruppo muscolare</label>
                    <div className="chip-group">
                      {MUSCLE_GROUPS.map(m => (
                        <button
                          key={m}
                          type="button"
                          className={`chip ${exercise.muscle === m ? 'active' : ''}`}
                          onClick={() => updateExercise(index, 'muscle', m)}
                          style={{ fontSize: 'var(--font-xs)', padding: 'var(--space-1) var(--space-3)' }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label className="input-label">Serie</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <button className="btn btn-secondary btn-icon-sm" onClick={() => updateExercise(index, 'sets', Math.max(1, exercise.sets - 1))} type="button">
                          <IconMinus size={14} />
                        </button>
                        <input
                          type="number"
                          className="input-field"
                          style={{ textAlign: 'center' }}
                          value={exercise.sets}
                          onChange={e => updateExercise(index, 'sets', Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <button className="btn btn-secondary btn-icon-sm" onClick={() => updateExercise(index, 'sets', exercise.sets + 1)} type="button">
                          <IconPlus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Ripetizioni</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="10 o 8-12"
                        value={exercise.reps}
                        onChange={e => updateExercise(index, 'reps', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label className="input-label">Peso (kg)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="es. 60"
                        value={exercise.weight}
                        onChange={e => updateExercise(index, 'weight', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Riposo (sec)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={exercise.restTime}
                        onChange={e => updateExercise(index, 'restTime', Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
                    <label className="input-label">Note</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="es. Scendere lento, pausa al petto..."
                      value={exercise.notes}
                      onChange={e => updateExercise(index, 'notes', e.target.value)}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: 'var(--space-3)',
                  }}>
                    {index > 0 && (
                      <button className="btn btn-ghost" onClick={() => moveExercise(index, -1)} style={{ fontSize: 'var(--font-xs)' }}>
                        ↑ Su
                      </button>
                    )}
                    {index < exercises.length - 1 && (
                      <button className="btn btn-ghost" onClick={() => moveExercise(index, 1)} style={{ fontSize: 'var(--font-xs)' }}>
                        ↓ Giù
                      </button>
                    )}
                    <div style={{ flex: 1 }} />
                    <button
                      className="btn btn-ghost"
                      onClick={() => removeExercise(index)}
                      style={{ color: 'var(--accent-danger)', fontSize: 'var(--font-xs)' }}
                    >
                      <IconTrash size={14} /> Rimuovi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        className="btn btn-outline btn-full mb-6"
        onClick={addExercise}
        id="btn-add-exercise"
      >
        <IconPlus size={18} /> Aggiungi Esercizio
      </button>

      <button
        className="btn btn-primary btn-lg btn-full mb-6"
        onClick={handleSave}
        id="btn-save-workout"
      >
        {isEditing ? 'Salva Modifiche' : 'Crea Scheda'} ✓
      </button>
    </div>
  )
}
