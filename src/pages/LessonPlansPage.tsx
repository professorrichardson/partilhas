import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LessonPlanCard } from '../components/LessonPlanCard'
import { CreateLessonPlanPanel } from '../components/lesson-plans/CreateLessonPlanPanel'
import { useAuth } from '../contexts/AuthContext'
import { getCommunities, getLessonPlans } from '../lib/api'
import type { ApiCommunity, ApiLessonPlan } from '../types/api'

export function LessonPlansPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const currentSearch = searchParams.get('search')?.trim() || ''
  const [lessonPlans, setLessonPlans] = useState<ApiLessonPlan[]>([])
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')

    Promise.all([
      getLessonPlans({
        search: currentSearch || undefined,
        grade: grade || undefined,
        subject: subject || undefined,
      }),
      getCommunities(),
    ])
      .then(([lessonPlansResponse, communitiesResponse]) => {
        if (isMounted) {
          setLessonPlans(lessonPlansResponse.items)
          setCommunities(communitiesResponse)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar os planos de aula agora.')
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
  }, [currentSearch, grade, subject])

  function handleCreated(lessonPlan: ApiLessonPlan) {
    setLessonPlans((current) => [lessonPlan, ...current])
    setShowForm(false)
  }

  return (
    <>
      <section className="page-header">
        <div>
          <h1>Planos de aula prontos</h1>
          <p>
            Planos com objetivos claros, ano, disciplina e recursos digitais já aplicados por
            outros professores.
          </p>
        </div>

        {token ? (
          <button type="button" className="primary-button" onClick={() => setShowForm((current) => !current)}>
            {showForm ? 'Fechar formulário' : 'Novo plano de aula'}
          </button>
        ) : null}
      </section>

      {showForm && token ? (
        <CreateLessonPlanPanel communities={communities} token={token} onCreated={handleCreated} />
      ) : null}

      <section className="filter-row">
        <input
          className="text-input"
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
          placeholder="Filtrar por ano/série"
        />
        <input
          className="text-input"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Filtrar por disciplina"
        />
      </section>

      {error ? <div className="empty-card status-message error">{error}</div> : null}
      {isLoading ? <div className="empty-card">Carregando planos de aula...</div> : null}
      {!isLoading && lessonPlans.length === 0 ? (
        <div className="empty-card">
          <h2>Nenhum plano de aula encontrado</h2>
          <p>Tente outro filtro ou publique o primeiro plano.</p>
        </div>
      ) : null}

      <section className="library-grid">
        {lessonPlans.map((lessonPlan) => (
          <LessonPlanCard key={lessonPlan.id} lessonPlan={lessonPlan} />
        ))}
      </section>
    </>
  )
}
