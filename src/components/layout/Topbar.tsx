
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  MessageCircleMore,
  Plus,
  Search,
  UserRound,
} from 'lucide-react'

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import { getInitials } from '../../lib/format'
import { navItems } from './Sidebar'

export function Topbar() {
  const { user, logoutUser } = useAuth()

  const location = useLocation()
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const desktopMenuRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)

  const currentSearch = searchParams.get('search') || ''

  const [searchValue, setSearchValue] = useState(currentSearch)

  const deferredSearch = useDeferredValue(searchValue)

  const isSearchEnabled = useMemo(() => {
    return (
      location.pathname === '/' ||
      location.pathname === '/partilhas' ||
      location.pathname === '/biblioteca' ||
      location.pathname === '/comunidades'
    )
  }, [location.pathname])

  const mobileNavItems = useMemo(() => {
    return navItems.filter((item) => item.to !== '/perfil')
  }, [])

  useEffect(() => {
    setSearchValue(currentSearch)
  }, [currentSearch])

  useEffect(() => {
    if (!isSearchEnabled) {
      return
    }

    if (deferredSearch.trim() === currentSearch) {
      return
    }

    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams)

      if (deferredSearch.trim()) {
        nextParams.set('search', deferredSearch.trim())
      } else {
        nextParams.delete('search')
      }

      startTransition(() => {
        setSearchParams(nextParams, { replace: true })
      })
    }, 250)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [
    currentSearch,
    deferredSearch,
    isSearchEnabled,
    searchParams,
    setSearchParams,
  ])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node

      if (
        !desktopMenuRef.current?.contains(target) &&
        !mobileMenuRef.current?.contains(target)
      ) {
        setIsProfileMenuOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  function handleOpenComposer() {
    const nextParams = new URLSearchParams()

    if (currentSearch.trim() && location.pathname === '/') {
      nextParams.set('search', currentSearch.trim())
    }

    nextParams.set('compose', '1')

    navigate(
      {
        pathname: '/',
        search: `?${nextParams.toString()}`,
      },
      { replace: false },
    )
  }

  function closeMenus() {
    setIsProfileMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="topbar">
        <div className="mobile-topbar-brand">
          <div className="brand-owl mobile-brand-owl">🦉</div>

          <div>
            <strong>Partilhas</strong>

            <span className="muted">
              Trocar saberes, transformar vidas.
            </span>
          </div>
        </div>

        <div
          className="mobile-menu-wrapper topbar-mobile-menu"
          ref={mobileMenuRef}
        >
          <button
            type="button"
            className={`icon-button mobile-menu-trigger ${
              isMobileMenuOpen ? 'active' : ''
            }`}
            aria-label="Abrir menu"
            onClick={() =>
              setIsMobileMenuOpen((current) => !current)
            }
          >
            <Menu size={18} />
          </button>

          {isMobileMenuOpen ? (
            <div className="mobile-dropdown">
              <nav
                className="mobile-dropdown-nav"
                aria-label="Menu mobile"
              >
                {mobileNavItems.map(
                  ({ to, label, icon: Icon, end }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`dropdown-item ${
                        location.pathname === to ||
                        (end && location.pathname === '/')
                          ? 'active'
                          : ''
                      }`}
                      onClick={closeMenus}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ),
                )}
              </nav>

              <div className="mobile-account-card">
                <div className="profile-chip mobile-profile-chip">
                  <div className="avatar" aria-hidden="true">
                    {getInitials(user?.name || 'Professor')}
                  </div>

                  <div className="profile-meta">
                    <strong>{user?.name}</strong>

                    <span className="muted">
                      {user?.profile?.institution ||
                        user?.role?.toLowerCase() ||
                        'Professor'}
                    </span>
                  </div>
                </div>

                <Link
                  to="/perfil"
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                  <UserRound size={16} />
                  Meu perfil
                </Link>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    closeMenus()
                    logoutUser()
                  }}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* DESKTOP SEARCH */}
        <label
          className="search-box desktop-search"
          htmlFor="global-search"
        >
          <Search />

          <input
            id="global-search"
            name="global-search"
            value={searchValue}
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
            disabled={!isSearchEnabled}
            placeholder="Buscar por temas, atividades ou pessoas..."
          />
        </label>

        {/* DESKTOP ACTIONS */}
        <div className="topbar-actions desktop-actions">
          <button
            type="button"
            className="icon-button"
            aria-label="Notificações"
          >
            <Bell size={18} />
            <span className="icon-badge">3</span>
          </button>

          <button
            type="button"
            className="icon-button"
            aria-label="Mensagens internas"
          >
            <MessageCircleMore size={18} />
          </button>

          <div className="profile-menu" ref={desktopMenuRef}>
            <button
              type="button"
              className="profile-chip profile-trigger"
              onClick={() =>
                setIsProfileMenuOpen((current) => !current)
              }
            >
              <div className="avatar" aria-hidden="true">
                {getInitials(user?.name || 'Professor')}
              </div>

              <div className="profile-meta">
                <strong>{user?.name}</strong>

                <span className="muted">
                  {user?.profile?.institution ||
                    user?.role?.toLowerCase() ||
                    'Ver perfil'}
                </span>
              </div>

              <ChevronDown size={16} />
            </button>

            {isProfileMenuOpen ? (
              <div className="profile-dropdown">
                <Link
                  to="/perfil"
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                  <UserRound size={16} />
                  Meu perfil
                </Link>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    closeMenus()
                    logoutUser()
                  }}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* MOBILE FOOTER */}
      <div className="mobile-quickbar">
        {isSearchEnabled ? (
          <label
            className="search-box mobile-search-box"
            htmlFor="mobile-global-search"
          >
            <Search size={16} />

            <input
              id="mobile-global-search"
              name="mobile-global-search"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
              placeholder="Buscar..."
            />
          </label>
        ) : null}

        <button
          type="button"
          className="primary-button mobile-compose-button"
          onClick={handleOpenComposer}
        >
          <Plus size={16} />
          Nova
        </button>
      </div>
    </>
  )
}

