import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, saveUser, deleteUser } from '../utils/storage'
import { IconLogOut, IconArrowLeft } from '../components/Icons'
import { ToastContext } from '../App'

export default function ProfilePage({ onUpdate }) {
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)
  const [user, setUser] = useState(() => getUser() || {})
  const [showDelete, setShowDelete] = useState(false)

  const [form, setForm] = useState({
    name: user.name || '',
    age: user.age || '',
    weight: user.weight || '',
    height: user.height || '',
    gender: user.gender || '',
    goal: user.goal || '',
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('Il nome è obbligatorio', 'error')
      return
    }

    saveUser({
      ...user,
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseInt(form.height) : null,
      gender: form.gender || null,
      goal: form.goal || null,
    })

    showToast('Profilo aggiornato ✓')
    onUpdate()
  }

  const handleLogout = () => {
    deleteUser()
    onUpdate()
    navigate('/login')
  }

  // BMI calculation
  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseInt(form.height) / 100, 2)).toFixed(1)
    : null

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Sottopeso', color: 'var(--accent-info)' }
    if (bmi < 25) return { label: 'Normopeso', color: 'var(--accent-secondary)' }
    if (bmi < 30) return { label: 'Sovrappeso', color: 'var(--accent-warning)' }
    return { label: 'Obeso', color: 'var(--accent-danger)' }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profilo</h1>
        <p className="page-subtitle">Gestisci i tuoi dati personali</p>
      </div>

      {/* Avatar / Greeting */}
      <div className="card mb-6 animate-fade-in-up" style={{ textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          margin: '0 auto var(--space-3)',
        }}>
          {form.name ? form.name[0].toUpperCase() : '👤'}
        </div>
        <h2 style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>{form.name || 'Utente'}</h2>
        {form.goal && (
          <span className="badge badge-primary" style={{ marginTop: 'var(--space-2)', display: 'inline-flex' }}>
            🎯 {form.goal}
          </span>
        )}
        {bmi && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>BMI: </span>
            <span style={{ fontWeight: 700, color: getBmiCategory(bmi).color }}>{bmi}</span>
            <span style={{ fontSize: 'var(--font-xs)', color: getBmiCategory(bmi).color, marginLeft: 'var(--space-2)' }}>
              ({getBmiCategory(bmi).label})
            </span>
          </div>
        )}
      </div>

      {/* Edit form */}
      <div className="card mb-6 animate-fade-in-up stagger-1">
        <h3 style={{ fontWeight: 600, fontSize: 'var(--font-base)', marginBottom: 'var(--space-4)' }}>
          Dati personali
        </h3>

        <div className="input-group">
          <label className="input-label">Nome</label>
          <input
            type="text"
            className="input-field"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            id="profile-name"
          />
        </div>

        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Età</label>
            <input
              type="number"
              className="input-field"
              value={form.age}
              onChange={e => handleChange('age', e.target.value)}
              id="profile-age"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Genere</label>
            <select
              className="input-field"
              value={form.gender}
              onChange={e => handleChange('gender', e.target.value)}
              id="profile-gender"
            >
              <option value="">Seleziona</option>
              <option value="male">Uomo</option>
              <option value="female">Donna</option>
              <option value="other">Altro</option>
            </select>
          </div>
        </div>

        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Peso (kg)</label>
            <input
              type="number"
              className="input-field"
              step="0.1"
              value={form.weight}
              onChange={e => handleChange('weight', e.target.value)}
              id="profile-weight"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Altezza (cm)</label>
            <input
              type="number"
              className="input-field"
              value={form.height}
              onChange={e => handleChange('height', e.target.value)}
              id="profile-height"
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Obiettivo</label>
          <div className="chip-group">
            {['Forza', 'Ipertrofia', 'Dimagrimento', 'Resistenza', 'Benessere'].map(g => (
              <button
                key={g}
                type="button"
                className={`chip ${form.goal === g ? 'active' : ''}`}
                onClick={() => handleChange('goal', g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-lg btn-full mb-4" onClick={handleSave} id="btn-save-profile">
        Salva Modifiche ✓
      </button>

      <button
        className="btn btn-ghost btn-full"
        onClick={() => setShowDelete(true)}
        style={{ color: 'var(--accent-danger)', marginBottom: 'var(--space-4)' }}
        id="btn-logout"
      >
        <IconLogOut size={18} /> Esci e cancella dati
      </button>

      <p className="text-center text-secondary" style={{ fontSize: 'var(--font-xs)', paddingBottom: 'var(--space-8)' }}>
        FitFlow v1.0 · I tuoi dati sono salvati localmente sul dispositivo
      </p>

      {/* Delete confirm */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">⚠️ Eliminare tutto?</h2>
            <p className="text-secondary">
              Tutti i tuoi dati (profilo, schede, statistiche) saranno eliminati permanentemente.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary flex-1" onClick={() => setShowDelete(false)}>
                Annulla
              </button>
              <button className="btn btn-danger flex-1" onClick={handleLogout} id="btn-confirm-logout">
                Elimina tutto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
