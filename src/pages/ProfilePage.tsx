import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ApiError, updateMyProfile } from '../lib/api'
import { getInitials } from '../lib/format'

export function ProfilePage() {
  const { token, user, replaceUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    institution: '',
    area: '',
    bio: '',
    avatarUrl: '',
  })

  useEffect(() => {
    setForm({
      name: user?.name || '',
      institution: user?.profile?.institution || '',
      area: user?.profile?.area || '',
      bio: user?.profile?.bio || '',
      avatarUrl: user?.profile?.avatarUrl || '',
    })
  }, [user])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      return
    }

    setIsSubmitting(true)
    setMessage('')
    setError('')

    try {
      const updatedUser = await updateMyProfile(token, form)
      replaceUser(updatedUser)
      setMessage('Perfil atualizado com sucesso.')
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)
      } else {
        setError('Não foi possível salvar seu perfil agora.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="profile-card">
        <div className="profile-summary">
          <div className="avatar large" aria-hidden="true">
            {getInitials(user?.name || 'Professor')}
          </div>

          <div>
            <span className="eyebrow">{user?.role}</span>
            <h2>{user?.name}</h2>
            <p>
              {user?.profile?.institution || 'Instituição não informada'} •{' '}
              {user?.profile?.area || 'Área não informada'}
            </p>
            <p>{user?.profile?.bio || 'Adicione uma breve descrição para apresentar seu trabalho.'}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <h2 className="section-title">Editar perfil</h2>
            <p className="section-subtitle">
              Esses dados alimentam o topo da aplicação e seus cartões de partilha.
            </p>
          </div>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="input-group">
              <span>Nome</span>
              <input
                className="text-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <label className="input-group">
              <span>Avatar (URL)</span>
              <input
                className="text-input"
                value={form.avatarUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="input-group">
              <span>Instituição</span>
              <input
                className="text-input"
                value={form.institution}
                onChange={(event) =>
                  setForm((current) => ({ ...current, institution: event.target.value }))
                }
              />
            </label>

            <label className="input-group">
              <span>Área</span>
              <input
                className="text-input"
                value={form.area}
                onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))}
              />
            </label>
          </div>

          <label className="input-group">
            <span>Bio</span>
            <textarea
              className="textarea-input"
              rows={4}
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            />
          </label>

          {message ? <p className="status-message success">{message}</p> : null}
          {error ? <p className="status-message error">{error}</p> : null}

          <div className="button-row">
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </form>
      </section>

      <section className="stats-grid">
        <article className="stats-card">
          <span className="eyebrow">Resumo</span>
          <h3>{user?.stats?.postsCount ?? 0}</h3>
          <p>Partilhas publicadas</p>
        </article>

        <article className="stats-card">
          <span className="eyebrow">Resumo</span>
          <h3>{user?.stats?.communitiesCount ?? 0}</h3>
          <p>Comunidades criadas</p>
        </article>

        <article className="stats-card">
          <span className="eyebrow">Resumo</span>
          <h3>{user?.stats?.favoritesCount ?? 0}</h3>
          <p>Materiais salvos</p>
        </article>

        <article className="stats-card">
          <span className="eyebrow">Resumo</span>
          <h3>{user?.stats?.likesReceived ?? 0}</h3>
          <p>Curtidas recebidas</p>
        </article>
      </section>
    </>
  )
}
