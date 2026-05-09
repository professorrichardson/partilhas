import {
  BookCopy,
  BookOpenText,
  Heart,
  Shapes,
  UserRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

export const navItems = [
  { to: '/', label: 'Partilhas', subtitle: 'Experiências e atividades', icon: BookOpenText, end: true },
  { to: '/comunidades', label: 'Comunidades', subtitle: 'Grupos por temas', icon: Shapes },
  { to: '/biblioteca', label: 'Biblioteca', subtitle: 'Materiais organizados', icon: BookCopy },
  { to: '/perfil', label: 'Meu Perfil', subtitle: 'Dados e histórico', icon: UserRound },
  { to: '/favoritos', label: 'Favoritos', subtitle: 'Conteúdos salvos', icon: Heart },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <section className="brand-card">
        <div className="brand-row">
          <div className="brand-owl" aria-hidden="true">
            🦉
          </div>

          <div>
            <h1 className="brand-name">Partilhas</h1>
            <p className="brand-tagline">Trocar saberes, transformar vidas.</p>
          </div>
        </div>
      </section>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {navItems.map(({ to, label, subtitle, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon />
            <span>
              <span className="nav-item-title">{label}</span>
              <span className="nav-item-subtitle">{subtitle}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <section className="sidebar-quote">
        <div className="quote-owl" aria-hidden="true">
          📚🦉
        </div>

        <p className="quote-text">
          “Ensinar é semear ideias que florescem para a vida.”
        </p>
      </section>
    </aside>
  )
}
