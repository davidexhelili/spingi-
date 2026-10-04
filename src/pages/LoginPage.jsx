import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveUser } from '../utils/storage'
import { ToastContext } from '../App'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const { showToast } = useContext(ToastContext)
  const [step, setStep] = useState(1) // 1=welcome, 2=profile setup
  const [form, setForm] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    goal: '',
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showToast('Inserisci il tuo nome', 'error')
      return
    }

    saveUser({
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseInt(form.height) : null,
      gender: form.gender || null,
      goal: form.goal || null,
      createdAt: new Date().toISOString(),
    })

    showToast(`Benvenuto, ${form.name}! 💪`)
    onLogin()
    navigate('/')
  }

  if (step === 1) {
    return (
      <div className="auth-page">
        <div className="auth-logo">FitFlow</div>
        <p className="auth-tagline">Il tuo personal trainer digitale.<br />Segui ogni rep, ogni set, ogni progresso.</p>
        <button
          className="btn btn-primary btn-xl btn-full"
          onClick={() => setStep(2)}
          id="btn-start"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}
        >
          Inizia Ora 🚀
        </button>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <h1 className="auth-logo" style={{ fontSize: '2rem' }}>👋 Chi sei?</h1>
      <p className="auth-tagline">Raccontaci un po' di te per personalizzare l'esperienza</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Nome *</label>
          <input
            type="text"
            className="input-field"
            placeholder="Il tuo nome"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            autoFocus
            id="input-name"
          />
        </div>

        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Età</label>
            <input
              type="number"
              className="input-field"
              placeholder="25"
              value={form.age}
              onChange={e => handleChange('age', e.target.value)}
              id="input-age"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Genere</label>
            <select
              className="input-field"
              value={form.gender}
              onChange={e => handleChange('gender', e.target.value)}
              id="input-gender"
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
              placeholder="75"
              step="0.1"
              value={form.weight}
              onChange={e => handleChange('weight', e.target.value)}
              id="input-weight"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Altezza (cm)</label>
            <input
              type="number"
              className="input-field"
              placeholder="178"
              value={form.height}
              onChange={e => handleChange('height', e.target.value)}
              id="input-height"
            />
          </div>
        </div>

        <div className="input-group">
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

        <button type="submit" className="btn btn-primary btn-lg btn-full mt-6" id="btn-save-profile">
          Salva e Inizia 💪
        </button>
      </form>
    </div>
  )
}
