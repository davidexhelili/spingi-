/* ============================================
   FitFlow - Local Storage Utilities
   ============================================ */

const STORAGE_KEYS = {
  USER: 'fitflow_user',
  WORKOUTS: 'fitflow_workouts',
  SESSIONS: 'fitflow_sessions',
  ACTIVE_SESSION: 'fitflow_active_session',
}

// --- Generic helpers ---
function getItem(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function removeItem(key) {
  localStorage.removeItem(key)
}

// --- User ---
export function getUser() {
  return getItem(STORAGE_KEYS.USER)
}

export function saveUser(user) {
  return setItem(STORAGE_KEYS.USER, {
    ...user,
    updatedAt: new Date().toISOString(),
  })
}

export function deleteUser() {
  removeItem(STORAGE_KEYS.USER)
  removeItem(STORAGE_KEYS.WORKOUTS)
  removeItem(STORAGE_KEYS.SESSIONS)
  removeItem(STORAGE_KEYS.ACTIVE_SESSION)
}

// --- Workouts (schede) ---
export function getWorkouts() {
  return getItem(STORAGE_KEYS.WORKOUTS) || []
}

export function saveWorkout(workout) {
  const workouts = getWorkouts()
  const existing = workouts.findIndex(w => w.id === workout.id)
  if (existing >= 0) {
    workouts[existing] = { ...workout, updatedAt: new Date().toISOString() }
  } else {
    workouts.push({
      ...workout,
      id: workout.id || generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  return setItem(STORAGE_KEYS.WORKOUTS, workouts)
}

export function deleteWorkout(workoutId) {
  const workouts = getWorkouts().filter(w => w.id !== workoutId)
  return setItem(STORAGE_KEYS.WORKOUTS, workouts)
}

export function getWorkoutById(workoutId) {
  return getWorkouts().find(w => w.id === workoutId) || null
}

// --- Sessions (completed workout history) ---
export function getSessions() {
  return getItem(STORAGE_KEYS.SESSIONS) || []
}

export function saveSession(session) {
  const sessions = getSessions()
  sessions.push({
    ...session,
    id: generateId(),
    completedAt: new Date().toISOString(),
  })
  return setItem(STORAGE_KEYS.SESSIONS, sessions)
}

// --- Active Session (in-progress workout) ---
export function getActiveSession() {
  return getItem(STORAGE_KEYS.ACTIVE_SESSION)
}

export function saveActiveSession(session) {
  return setItem(STORAGE_KEYS.ACTIVE_SESSION, session)
}

export function clearActiveSession() {
  removeItem(STORAGE_KEYS.ACTIVE_SESSION)
}

// --- ID Generator ---
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// --- Time Formatting ---
export function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  return `${mins}m`
}
