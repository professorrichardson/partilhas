import { Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ApiError, createCommunity, getCommunities } from '../lib/api'
import type { ApiCommunity } from '../types/api'

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

export function CommunitiesPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const currentSearch = searchParams.get('search')?.trim() || ''
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    coverImageUrl: '',
  })

  useEffect(() => {
    let isMounted = true

    getCommunities()
      .then((response) => {
        if (isMounted) {
          setCommunities(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar as comunidades agora.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredCommunities = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(currentSearch)

    if (!normalizedSearch) {
      return communities
    }

    return communities.filter((community) =>
      [community.name, community.description, community.creator.name].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [communities, currentSearch])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const createdCommunity = await createCommunity(token, form)
      setCommunities((current) => [createdCommunity, ...current])
      setForm({
        name: '',
        description: '',
        coverImageUrl: '',
      })
      setShowForm(false)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)
      } else {
        setError('Não foi possível criar a comunidade agora.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="page-header">
        <div>
          <h1>Comunidades abertas</h1>
          <p>
            {currentSearch
              ? `Filtrando comunidades relacionadas a "${currentSearch}".`
              : 'Professores podem criar e participar de comunidades temáticas para organizar conteúdos por área, etapa ou projeto.'}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? 'Fechar formulário' : 'Criar comunidade'}
        </button>
      </section>

      {showForm ? (
        <section className="panel">
          <form className="stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="input-group">
                <span>Nome</span>
                <input
                  className="text-input"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ex.: Educação inclusiva"
                  required
                />
              </label>

              <label className="input-group">
                <span>Capa (URL opcional)</span>
                <input
                  className="text-input"
                  value={form.coverImageUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, coverImageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="input-group">
              <span>Descrição</span>
              <textarea
                className="textarea-input"
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Explique o foco da comunidade e o tipo de material esperado."
                required
              />
            </label>

            <div className="button-row">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Salvar comunidade'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {error ? <div className="empty-card status-message error">{error}</div> : null}
      {isLoading ? <div className="empty-card">Carregando comunidades...</div> : null}
      {!isLoading && filteredCommunities.length === 0 ? (
        <div className="empty-card">
          <h2>Nenhuma comunidade encontrada</h2>
          <p>Tente outro termo na busca ou crie uma nova comunidade.</p>
        </div>
      ) : null}

      <section className="communities-grid">
        {filteredCommunities.map((community) => (
          <article key={community.id} className="community-card">
            <span className="eyebrow">
              <Users size={16} />
              {community.metrics.members} membros
            </span>
            <h3>{community.name}</h3>
            <p>{community.description}</p>
            <p className="muted">Partilhas na comunidade: {community.metrics.posts}</p>
            <div className="button-row">
              <span className="config-pill">Comunidade aberta</span>
              <Link to={`/comunidades/${community.slug}`} className="secondary-button">
                Ver comunidade
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
