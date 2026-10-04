import React, { useState, useEffect, useCallback } from 'react'
import { Agentation } from 'agentation'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { getUser } from './utils/storage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import WorkoutsPage from './pages/WorkoutsPage'
import WorkoutEditorPage from './pages/WorkoutEditorPage'
import WorkoutSessionPage from './pages/WorkoutSessionPage'
import WorkoutCompletePage from './pages/WorkoutCompletePage'
import StatsPage from './pages/StatsPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'

/* Toast context */
export const ToastContext = React.createContext(null)

function AppContent() {
  const [user, setUser] = useState(() => getUser())
  const [toasts, setToasts] = useState([])
  const location = useLocation()

  const refreshUser = useCallback(() => {
    setUser(getUser())
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  // Pages where bottom nav is hidden
  const hideNav = ['/login', '/workout/session', '/workout/complete'].some(p =>
    location.pathname.startsWith(p)
  ) || !user

  return (
    <ToastContext.Provider value={{ showToast, refreshUser, user }}>
      <div className="app-container">
        <Toast toasts={toasts} />
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <LoginPage onLogin={refreshUser} />
          } />
          <Route path="/" element={
            user ? <HomePage /> : <Navigate to="/login" replace />
          } />
          <Route path="/workouts" element={
            user ? <WorkoutsPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/workout/new" element={
            user ? <WorkoutEditorPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/workout/edit/:id" element={
            user ? <WorkoutEditorPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/workout/session/:id" element={
            user ? <WorkoutSessionPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/workout/complete" element={
            user ? <WorkoutCompletePage /> : <Navigate to="/login" replace />
          } />
          <Route path="/stats" element={
            user ? <StatsPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/profile" element={
            user ? <ProfilePage onUpdate={refreshUser} /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!hideNav && <BottomNav />}
      </div>
    </ToastContext.Provider>
  )
}

export default function App() {
  return (
    <>
      <HashRouter>
        <AppContent />
      </HashRouter>
      {import.meta.env.DEV && <Agentation />}
    </>
  )
}
