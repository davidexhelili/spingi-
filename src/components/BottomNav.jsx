import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconHome, IconList, IconChart, IconUser } from './Icons'

const navItems = [
  { path: '/', icon: IconHome, label: 'Home' },
  { path: '/workouts', icon: IconList, label: 'Schede' },
  { path: '/stats', icon: IconChart, label: 'Stats' },
  { path: '/profile', icon: IconUser, label: 'Profilo' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      <div className="bottom-nav-inner">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className="nav-icon">
                <Icon size={22} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
