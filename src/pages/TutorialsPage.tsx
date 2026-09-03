import { GraduationCap, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreateTutorialPanel } from '../components/tutorials/CreateTutorialPanel'
import { useAuth } from '../contexts/AuthContext'
import { getTutorials } from '../lib/api'
import type { ApiTutorialDetail, ApiTutorialSummary } from '../types/api'

export function TutorialsPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const currentSearch = searchParams.get('search')?.trim() || ''
  const [tutorials, setTutorials] = useState<ApiTutorialSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')

    getTutorials({ search: currentSearch || undefined })
      .then((response) => {
        if (isMounted) {
          setTutorials(response.items)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar os tutoriais agora.')
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
  }, [currentSearch])

  function handleCreated(tutorial: ApiTutorialDetail) {
    const summary: ApiTutorialSummary = {
      id: tutorial.id,
      title: tutorial.title,
      description: tutorial.description,
      tool: tutorial.tool,
      coverImageUrl: tutorial.coverImageUrl,
      createdAt: tutorial.createdAt,
      author: tutorial.author,
      stepsCount: tutorial.steps.length,
      completionsCount: tutorial.completionsCount,
    }

    setTutorials((current) => [summary, ...current])
    setShowForm(false)
  }

  return (
    <>
      <section className="page-header">
        <div>
          <h1>Tutoriais de ferramentas digitais</h1>
          <p>Aprenda a usar Wordwall, Canva, Google Forms, QR Codes e outras ferramentas em etapas.</p>
        </div>

        {token ? (
          <button type="button" className="primary-button" onClick={() => setShowForm((current) => !current)}>
            {showForm ? 'Fechar formulário' : 'Novo tutorial'}
          </button>
        ) : null}
      </section>

      {showForm && token ? <CreateTutorialPanel token={token} onCreated={handleCreated} /> : null}

      {error ? <div className="empty-card status-message error">{error}</div> : null}
      {isLoading ? <div className="empty-card">Carregando tutoriais...</div> : null}
      {!isLoading && tutorials.length === 0 ? (
        <div className="empty-card">
          <h2>Nenhum tutorial encontrado</h2>
          <p>Seja o primeiro a ensinar uma ferramenta digital para a comunidade.</p>
        </div>
      ) : null}

      <section className="communities-grid">
        {tutorials.map((tutorial) => (
          <article key={tutorial.id} className="community-card">
            <span className="eyebrow">
              <GraduationCap size={16} />
              {tutorial.tool}
            </span>
            <h3>{tutorial.title}</h3>
            <p>{tutorial.description}</p>
            <p className="muted">
              {tutorial.stepsCount} etapa(s) • {tutorial.completionsCount} conclusão(ões)
            </p>
            <div className="button-row">
              <Link to={`/tutoriais/${tutorial.id}`} className="secondary-button">
                <PlayCircle size={16} />
                Começar tutorial
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
