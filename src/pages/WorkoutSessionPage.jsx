import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getWorkoutById, getActiveSession, saveActiveSession, clearActiveSession, saveSession, formatTime
} from '../utils/storage'
import { IconArrowLeft, IconPlay, IconPause, IconCheck, IconSkipForward, IconRefresh, IconX } from '../components/Icons'
import { ToastContext } from '../App'

export default function WorkoutSessionPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useContext(ToastContext)

  const [workout, setWorkout] = useState(null)
  const [currentExIndex, setCurrentExIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(0)
  const [completedSets, setCompletedSets] = useState({}) // { exerciseIndex: [true, true, false...] }
  const [exerciseTimes, setExerciseTimes] = useState({}) // { exerciseIndex: startTime }
  const [exerciseDurations, setExerciseDurations] = useState({}) // { exerciseIndex: totalSeconds }

  // Timer state
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerTotal, setTimerTotal] = useState(90)
  const timerRef = useRef(null)

  // Total workout timer
  const [totalTime, setTotalTime] = useState(0)
  const [startTime] = useState(() => Date.now())
  const totalTimerRef = useRef(null)

  // Quit confirm
  const [showQuit, setShowQuit] = useState(false)

  // Load workout
  useEffect(() => {
    const w = getWorkoutById(id)
    if (!w) {
      showToast('Scheda non trovata', 'error')
      navigate('/workouts')
      return
    }
    setWorkout(w)
    setTimerTotal(w.restTime || 90)

    // Try to resume active session
    const active = getActiveSession()
    if (active && active.workoutId === id) {
      setCurrentExIndex(active.currentExIndex || 0)
      setCurrentSet(active.currentSet || 0)
      setCompletedSets(active.completedSets || {})
      setExerciseDurations(active.exerciseDurations || {})
    }

    // Track exercise start time
    setExerciseTimes(prev => ({ ...prev, 0: Date.now() }))
  }, [id])

  // Total workout timer
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(totalTimerRef.current)
  }, [startTime])

  // Rest timer countdown
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(prev => prev - 1)
      }, 1000)
    } else if (timerActive && timerSeconds <= 0) {
      setTimerActive(false)
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      showToast('⏰ Riposo finito! Vai!')
    }
    return () => clearTimeout(timerRef.current)
  }, [timerActive, timerSeconds])

  // Save active session periodically
  useEffect(() => {
    if (!workout) return
    const interval = setInterval(() => {
      saveActiveSession({
        workoutId: id,
        workoutName: workout.name,
        currentExIndex,
        currentSet,
        completedSets,
        exerciseDurations,
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [workout, currentExIndex, currentSet, completedSets, exerciseDurations])

  const currentExercise = workout?.exercises?.[currentExIndex]
  const totalExercises = workout?.exercises?.length || 0
  const allSetsCompleted = currentExercise
    ? (completedSets[currentExIndex] || []).filter(Boolean).length >= currentExercise.sets
    : false

  const totalSetsInWorkout = workout?.exercises?.reduce((acc, ex) => acc + ex.sets, 0) || 0
  const completedSetsCount = Object.values(completedSets).reduce(
    (acc, sets) => acc + sets.filter(Boolean).length, 0
  )
  const progressPercent = totalSetsInWorkout > 0
    ? Math.round((completedSetsCount / totalSetsInWorkout) * 100)
    : 0

  const startTimer = useCallback(() => {
    const rest = currentExercise?.restTime || workout?.restTime || 90
    setTimerTotal(rest)
    setTimerSeconds(rest)
    setTimerActive(true)
  }, [currentExercise, workout])

  const stopTimer = useCallback(() => {
    setTimerActive(false)
    setTimerSeconds(0)
  }, [])

  const completeSet = useCallback(() => {
    const setIndex = currentSet
    setCompletedSets(prev => {
      const exSets = [...(prev[currentExIndex] || Array(currentExercise.sets).fill(false))]
      exSets[setIndex] = true
      return { ...prev, [currentExIndex]: exSets }
    })

    // Auto advance to next set
    const nextSet = currentSet + 1
    if (nextSet < currentExercise.sets) {
      setCurrentSet(nextSet)
      // Start rest timer automatically
      startTimer()
    }
  }, [currentSet, currentExIndex, currentExercise, startTimer])

  const nextExercise = useCallback(() => {
    // Save duration for current exercise
    const exStartTime = exerciseTimes[currentExIndex] || Date.now()
    setExerciseDurations(prev => ({
      ...prev,
      [currentExIndex]: Math.floor((Date.now() - exStartTime) / 1000),
    }))

    stopTimer()

    if (currentExIndex + 1 >= totalExercises) {
      // All exercises done!
      clearActiveSession()
      const sessionData = {
        workoutId: id,
        workoutName: workout.name,
        totalTime: Math.floor((Date.now() - startTime) / 1000),
        exerciseDurations: {
          ...exerciseDurations,
          [currentExIndex]: Math.floor((Date.now() - (exerciseTimes[currentExIndex] || Date.now())) / 1000),
        },
        completedSets,
        exercises: workout.exercises.map((ex, i) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          completedSets: (completedSets[i] || []).filter(Boolean).length,
        })),
      }
      saveSession(sessionData)
      navigate('/workout/complete', { state: sessionData })
      return
    }

    const nextIdx = currentExIndex + 1
    setCurrentExIndex(nextIdx)
    setCurrentSet(0)
    setExerciseTimes(prev => ({ ...prev, [nextIdx]: Date.now() }))
  }, [currentExIndex, totalExercises, exerciseTimes, exerciseDurations, completedSets, workout, startTime])

  const handleQuit = () => {
    clearActiveSession()
    navigate('/')
  }

  if (!workout || !currentExercise) return null

  const timerProgress = timerTotal > 0 ? ((timerTotal - timerSeconds) / timerTotal) : 0
  const circumference = 2 * Math.PI * 90

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4) 0',
      }}>
        <button className="btn btn-ghost btn-icon" onClick={() => setShowQuit(true)} id="btn-quit-session">
          <IconX size={22} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-base)' }}>{workout.name}</div>
          <div className="text-secondary font-mono" style={{ fontSize: 'var(--font-sm)' }}>
            {formatTime(totalTime)}
          </div>
        </div>
        <div style={{ width: '44px' }} /> {/* Spacer */}
      </div>

      {/* Progress bar */}
      <div className="session-header animate-fade-in">
        <div className="session-progress-text">
          <span>Esercizio {currentExIndex + 1}/{totalExercises}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Current Exercise */}
      <div className="exercise-card active animate-scale-in" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="exercise-header">
          <div>
            <div className="exercise-name">{currentExercise.name}</div>
            {currentExercise.muscle && (
              <div className="exercise-muscle">{currentExercise.muscle}</div>
            )}
          </div>
          <span className="badge badge-primary">
            {currentExIndex + 1}/{totalExercises}
          </span>
        </div>

        {currentExercise.notes && (
          <div style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginBottom: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'rgba(139, 92, 246, 0.06)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--accent-primary)',
          }}>
            💡 {currentExercise.notes}
          </div>
        )}

        <div className="exercise-details">
          <div className="exercise-detail">
            <span className="exercise-detail-label">Serie</span>
            <span className="exercise-detail-value">{currentExercise.sets}</span>
          </div>
          <div className="exercise-detail">
            <span className="exercise-detail-label">Ripetizioni</span>
            <span className="exercise-detail-value">{currentExercise.reps}</span>
          </div>
          {currentExercise.weight && (
            <div className="exercise-detail">
              <span className="exercise-detail-label">Peso</span>
              <span className="exercise-detail-value">{currentExercise.weight}kg</span>
            </div>
          )}
          <div className="exercise-detail">
            <span className="exercise-detail-label">Riposo</span>
            <span className="exercise-detail-value">{currentExercise.restTime || workout.restTime}s</span>
          </div>
        </div>

        {/* Set tracker dots */}
        <div className="set-tracker">
          {Array.from({ length: currentExercise.sets }).map((_, setIdx) => {
            const isCompleted = completedSets[currentExIndex]?.[setIdx]
            const isCurrent = setIdx === currentSet && !allSetsCompleted
            return (
              <div
                key={setIdx}
                className={`set-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => !isCompleted && setCurrentSet(setIdx)}
              >
                {isCompleted ? '✓' : setIdx + 1}
              </div>
            )
          })}
        </div>
      </div>

      {/* Timer section */}
      {timerActive && (
        <div className="timer-circle-container animate-scale-in" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="timer-circle">
            <svg viewBox="0 0 200 200">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06d6a0" />
                </linearGradient>
              </defs>
              <circle className="timer-circle-bg" cx="100" cy="100" r="90" />
              <circle
                className="timer-circle-progress"
                cx="100" cy="100" r="90"
                style={{
                  strokeDashoffset: circumference * (1 - timerProgress),
                }}
              />
            </svg>
            <div className={`timer-time ${timerActive ? 'running' : ''}`}>
              {formatTime(timerSeconds)}
            </div>
          </div>
          <span className="timer-label">Riposo in corso...</span>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={stopTimer}>
              <IconX size={16} /> Stop
            </button>
            <button className="btn btn-primary" onClick={() => { stopTimer() }}>
              <IconSkipForward size={16} /> Salta
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="list-gap" style={{ marginTop: 'var(--space-4)' }}>
        {!allSetsCompleted ? (
          <>
            <button
              className="btn btn-primary btn-xl btn-full"
              onClick={completeSet}
              id="btn-complete-set"
            >
              <IconCheck size={22} />
              Completa Set {currentSet + 1}
            </button>
            {!timerActive && currentSet > 0 && (
              <button
                className="btn btn-outline btn-lg btn-full"
                onClick={startTimer}
                id="btn-start-timer"
              >
                <IconRefresh size={18} />
                Avvia Timer Riposo ({currentExercise.restTime || workout.restTime}s)
              </button>
            )}
          </>
        ) : (
          <button
            className="btn btn-success btn-xl btn-full"
            onClick={nextExercise}
            id="btn-next-exercise"
            style={{ animation: 'scaleIn var(--transition-spring)' }}
          >
            {currentExIndex + 1 >= totalExercises ? (
              <>🎉 Completa Allenamento</>
            ) : (
              <><IconSkipForward size={22} /> Prossimo Esercizio</>
            )}
          </button>
        )}
      </div>

      {/* Upcoming exercises */}
      {currentExIndex + 1 < totalExercises && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <div className="section-title" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
            Prossimi esercizi
          </div>
          <div className="list-gap">
            {workout.exercises.slice(currentExIndex + 1, currentExIndex + 4).map((ex, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  opacity: 0.6,
                  cursor: 'default',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, fontSize: 'var(--font-sm)' }}>{ex.name}</span>
                  <span className="text-secondary" style={{ fontSize: 'var(--font-xs)' }}>
                    {ex.sets}×{ex.reps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quit modal */}
      {showQuit && (
        <div className="modal-overlay" onClick={() => setShowQuit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Abbandonare l'allenamento?</h2>
            <p className="text-secondary">
              I tuoi progressi in questa sessione andranno persi.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary flex-1" onClick={() => setShowQuit(false)}>
                Continua
              </button>
              <button className="btn btn-danger flex-1" onClick={handleQuit} id="btn-confirm-quit">
                Abbandona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
