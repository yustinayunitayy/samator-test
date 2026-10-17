import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/Logo.png'

function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconList(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

const links = [
  { to: '/', label: 'Dashboard', Icon: IconGrid },
  { to: '/cylinders', label: 'Database Cylinders', Icon: IconList },
]

function NavItems() {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand text-white' : 'text-mauve-700 hover:bg-brand-soft hover:text-brand'
            }`
          }
        >
          <l.Icon className="h-5 w-5 shrink-0" />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-mauve-200 bg-white px-4 py-6">
        <img src={logo} alt="Samator" className="mb-8 w-auto px-2" />
        <NavItems />
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
