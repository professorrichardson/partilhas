import { ArrowLeft, Award, Check, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getTutorialById,
  markTutorialStepComplete,
  openCertificatePdf,
  unmarkTutorialStepComplete,
} from '../lib/api'
import { sanitizeRichText } from '../lib/richText'
import type { ApiTutorialDetail } from '../types/api'

export function TutorialDetailPage() {
  const { tutorialId } = useParams()
  const { token } = useAuth()
  const [tutorial, setTutorial] = useState<ApiTutorialDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingStepId, setPendingStepId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!tutorialId) {
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError('')

    getTutorialById(tutorialId, token)
      .then((response) => {
        if (isMounted) {
          setTutorial(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar este tutorial.')
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
  }, [tutorialId, token])

  async function handleToggleStep(stepId: string, isCompleted: boolean) {
    if (!token || !tutorialId) {
      return
    }

    setPendingStepId(stepId)

    try {
      const updatedTutorial = isCompleted
        ? await unmarkTutorialStepComplete(token, tutorialId, stepId)
        : await markTutorialStepComplete(token, tutorialId, stepId)

      setTutorial(updatedTutorial)
    } finally {
      setPendingStepId(null)
    }
  }

  async function handleDownloadCertificate() {
    if (!token || !tutorial?.viewerContext.certificateId) {
      return
    }

    setIsDownloading(true)

    try {
      await openCertificatePdf(token, tutorial.viewerContext.certificateId)
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return <section className="empty-card">Carregando tutorial...</section>
  }

  if (error || !tutorial) {
    return (
      <section className="empty-card">
        <h2>Não encontramos este tutorial</h2>
        <p>{error || 'Ele pode ter sido removido ou ainda não estar disponível.'}</p>
      </section>
    )
  }

  return (
    <>
      <section className="page-header">
        <div>
          <Link to="/tutoriais" className="back-link">
            <ArrowLeft size={16} />
            Voltar para tutoriais
          </Link>
          <h1>{tutorial.title}</h1>
          <p>
            Por <strong>{tutorial.author.name}</strong> • Ferramenta: {tutorial.tool}
          </p>
        </div>
      </section>

      <section className="detail-layout">
        <div className="detail-main">
          <article className="detail-card">
            <p>{tutorial.description}</p>

            {tutorial.viewerContext.isCompleted ? (
              <div className="empty-card compact status-message success">
                <p>
                  <Award size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Você concluiu este tutorial!
                </p>
                {tutorial.viewerContext.certificateId ? (
                  <div className="button-row">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleDownloadCertificate}
                      disabled={isDownloading}
                    >
                      {isDownloading ? 'Gerando certificado...' : 'Baixar certificado em PDF'}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="stack" style={{ marginTop: 20 }}>
              {tutorial.steps.map((step) => {
                const isCompleted = tutorial.viewerContext.completedStepIds.includes(step.id)

                return (
                  <article key={step.id} className="panel tutorial-step-card">
                    <div className="section-header">
                      <div>
                        <span className="eyebrow">Etapa {step.order}</span>
                        <h3 style={{ margin: '4px 0' }}>{step.title}</h3>
                      </div>

                      {token ? (
                        <button
                          type="button"
                          className={`icon-button ${isCompleted ? 'active' : ''}`}
                          onClick={() => handleToggleStep(step.id, isCompleted)}
                          disabled={pendingStepId === step.id}
                          aria-label={isCompleted ? 'Marcar como não concluída' : 'Marcar como concluída'}
                        >
                          <Check size={18} />
                        </button>
                      ) : null}
                    </div>

                    <div
                      className="rich-content"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichText(step.content) }}
                    />

                    {step.videoUrl ? (
                      <a href={step.videoUrl} target="_blank" rel="noreferrer" className="external-link">
                        <PlayCircle size={16} />
                        Assistir vídeo desta etapa
                      </a>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </article>
        </div>

        <aside className="detail-sidebar">
          <section className="detail-card">
            <h2 className="section-title">Progresso</h2>
            <div className="summary-list">
              <div className="summary-item">
                <span className="summary-label">Etapas concluídas</span>
                <strong>
                  {tutorial.viewerContext.completedStepIds.length} de {tutorial.steps.length}
                </strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total de conclusões</span>
                <strong>{tutorial.completionsCount}</strong>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </>
  )
}
