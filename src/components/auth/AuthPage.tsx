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
    <section className="auth-layout">
      <div className="auth-showcase">
        <div className="brand-card">
          <div className="brand-row">
            <div className="brand-owl" aria-hidden="true">
              🦉
            </div>
            <div>
              <h1 className="brand-name">Partilhas</h1>
              <p className="brand-tagline">Trocar saberes, transformar vidas.</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <span className="eyebrow">Plataforma colaborativa</span>
          <h2 className="auth-heading">Materiais, projetos e comunidades em um só lugar.</h2>
          <p className="muted">
            Entre para publicar partilhas pedagógicas, organizar arquivos, criar comunidades
            abertas e manter um acervo acessível mesmo quando o feed crescer.
          </p>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={`filter-pill ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`filter-pill ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Criar conta
          </button>
        </div>

        <div>
          <h2 className="auth-heading">
            {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta de professor'}
          </h2>
          <p className="muted">
            {mode === 'login'
              ? 'Use seu e-mail e senha para continuar.'
              : 'O cadastro é aberto e seu perfil pode ser ajustado depois.'}
          </p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className="input-group">
              <span>Nome completo</span>
              <input
                className="text-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Prof. Ana Oliveira"
                required
              />
            </label>
          ) : null}

          <label className="input-group">
            <span>E-mail</span>
            <input
              className="text-input"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="voce@exemplo.com"
              required
            />
          </label>

          <label className="input-group">
            <span>Senha</span>
            <input
              className="text-input"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Digite sua senha"
              required
            />
          </label>

          {error ? <p className="status-message error">{error}</p> : null}

          <button type="submit" className="primary-button wide-button" disabled={isSubmitting}>
            {isSubmitting
              ? 'Enviando...'
              : mode === 'login'
                ? 'Entrar na plataforma'
                : 'Criar conta e entrar'}
          </button>
        </form>
      </div>
    </section>
  )
}

