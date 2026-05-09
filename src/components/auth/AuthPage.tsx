import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ApiError } from '../../lib/api'

type Mode = 'login' | 'register'

export function AuthPage() {
  const navigate = useNavigate()
  const { user, loginUser, registerUser } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (mode === 'login') {
        await loginUser({
          email: form.email,
          password: form.password,
        })
      } else {
        await registerUser(form)
      }

      navigate('/', { replace: true })
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)
      } else {
        setError('Não foi possível concluir a autenticação agora.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-background-glow glow-left" />
      <div className="auth-background-glow glow-right" />

      <div className="auth-layout">
        {/* Lado esquerdo - só aparece em desktop */}
        <div className="auth-showcase">
          <div className="brand-card auth-hero-card">
            <div className="brand-row">
              <div className="brand-owl" aria-hidden="true">
                🦉
              </div>

              <div>
                <h1 className="brand-name">Partilhas</h1>

                <p className="brand-tagline">
                  Plataforma colaborativa para educadores.
                </p>
              </div>
            </div>
          </div>

          <div className="panel auth-panel">
            <span className="eyebrow">Conecte professores</span>

            <h2 className="auth-heading">
              Compartilhe materiais, ideias e projetos pedagógicos.
            </h2>

            <p className="muted">
              Crie comunidades, publique conteúdos, organize materiais e
              mantenha tudo acessível em um ambiente moderno e colaborativo.
            </p>
          </div>
        </div>

        {/* Card do formulário - agora com a logo incluída para mobile */}
        <div className="auth-card auth-glass-card">
          {/* Logo MOBILE - aparece apenas no mobile, DENTRO do card */}
          <div className="auth-mobile-brand-inside">
            <div className="brand-owl">🦉</div>
            <div>
              <h1 className="brand-name">Partilhas</h1>
              <p className="brand-tagline">Trocar saberes, transformar vidas.</p>
            </div>
          </div>

          <div className="auth-segmented">
            <button
              type="button"
              className={`auth-segment ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Entrar
            </button>

            <button
              type="button"
              className={`auth-segment ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Criar conta
            </button>
          </div>

          <div className="auth-copy">
            <h2 className="auth-heading">
              {mode === 'login'
                ? 'Bem-vindo de volta'
                : 'Crie sua conta'}
            </h2>

            <p className="muted">
              {mode === 'login'
                ? 'Entre para acessar suas partilhas e comunidades.'
                : 'Seu perfil pode ser personalizado depois.'}
            </p>
          </div>

          <form className="stack" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <label className="input-group">
                <span>Nome completo</span>

                <input
                  className="text-input auth-input"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Prof. Ana Oliveira"
                  required
                />
              </label>
            ) : null}

            <label className="input-group">
              <span>E-mail</span>

              <input
                className="text-input auth-input"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="voce@exemplo.com"
                required
              />
            </label>

            <label className="input-group">
              <span>Senha</span>

              <input
                className="text-input auth-input"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Digite sua senha"
                required
              />
            </label>

            {error ? (
              <p className="status-message error">{error}</p>
            ) : null}

            <button
              type="submit"
              className="primary-button wide-button auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Entrando...'
                : mode === 'login'
                  ? 'Entrar na plataforma'
                  : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}