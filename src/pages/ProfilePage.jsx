import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, saveUser, deleteUser } from '../utils/storage'
import { IconLogOut, IconArrowLeft, IconUser, IconChart, IconTarget, IconFire, IconCheck } from '../components/Icons'
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
    <div className="page" style={{ padding: 'calc(var(--space-8) + env(safe-area-inset-top)) var(--space-4) 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div className="menu-card" style={{ width: '100%' }}>
        <div className="menu-header">
          <div className="menu-avatar">
            {form.name ? form.name[0].toUpperCase() : '👤'}
          </div>
          <div className="menu-user-info">
            <div className="menu-user-name">
              {form.name || 'Utente'} <span className="menu-badge">{bmi ? `BMI ${bmi}` : 'Pro'}</span>
            </div>
            <div className="menu-user-email">
              {form.goal ? `Obiettivo: ${form.goal}` : 'Nessun obiettivo impostato'}
            </div>
          </div>
        </div>

        <div className="menu-item" style={{ cursor: 'default' }}>
          <div className="menu-item-icon"><IconUser size={18} /></div>
          <div className="menu-item-content">
            <span>Nome</span>
            <input type="text" className="menu-item-input" placeholder="Il tuo nome" value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
        </div>

        <div className="menu-item" style={{ cursor: 'default' }}>
          <div className="menu-item-icon"><IconChart size={18} /></div>
          <div className="menu-item-content">
            <span>Età</span>
            <input type="number" className="menu-item-input" placeholder="Anni" value={form.age} onChange={e => handleChange('age', e.target.value)} />
          </div>
        </div>
        
        <div className="menu-item" style={{ cursor: 'default' }}>
          <div className="menu-item-icon"><IconTarget size={18} /></div>
          <div className="menu-item-content">
            <span>Peso</span>
            <input type="number" className="menu-item-input" placeholder="kg" value={form.weight} onChange={e => handleChange('weight', e.target.value)} />
          </div>
        </div>

        <div className="menu-item" style={{ cursor: 'default' }}>
          <div className="menu-item-icon"><IconFire size={18} /></div>
          <div className="menu-item-content">
            <span>Altezza</span>
            <input type="number" className="menu-item-input" placeholder="cm" value={form.height} onChange={e => handleChange('height', e.target.value)} />
          </div>
        </div>

        <div className="menu-item" style={{ cursor: 'default' }}>
          <div className="menu-item-icon"><IconUser size={18} /></div>
          <div className="menu-item-content">
            <span>Genere</span>
            <select className="menu-item-select" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
              <option value="">Seleziona</option>
              <option value="male">Uomo</option>
              <option value="female">Donna</option>
              <option value="other">Altro</option>
            </select>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>

        <div className="menu-item" onClick={handleSave}>
          <div className="menu-item-icon"><IconCheck size={18} /></div>
          <div className="menu-item-content">
            <span>Salva Modifiche</span>
            <span style={{ fontSize: '12px', color: '#a3a3a3' }}>⌘ S</span>
          </div>
        </div>
        
        <div className="menu-item danger" onClick={() => setShowDelete(true)}>
          <div className="menu-item-icon"><IconLogOut size={18} /></div>
          <div className="menu-item-content">
            <span>Esci e Cancella</span>
          </div>
        </div>

      </div>

      <p className="text-center text-secondary" style={{ fontSize: 'var(--font-xs)', marginTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        I tuoi dati sono salvati localmente.
      </p>

      {/* Delete confirm */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">⚠️ Eliminare tutto?</h2>
            <p className="text-secondary">
              Tutti i tuoi dati saranno eliminati permanentemente.
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
