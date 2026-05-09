import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute() {
  const { isBootstrapping, user } = useAuth()

  if (isBootstrapping) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <span className="eyebrow">Carregando sessão</span>
          <h1>Preparando seu ambiente</h1>
          <p>Estamos validando sua sessão para abrir a plataforma com segurança.</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}

