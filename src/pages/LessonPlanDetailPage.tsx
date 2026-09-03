import { ArrowLeft, ExternalLink, FileText, GraduationCap, Layers3, Tag, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLessonPlanById } from '../lib/api'
import { formatAbsoluteDate, formatFileSize } from '../lib/format'
import { getAssetUrl } from '../lib/post'
import { sanitizeRichText } from '../lib/richText'
import type { ApiLessonPlan } from '../types/api'

export function LessonPlanDetailPage() {
  const { lessonPlanId } = useParams()
  const [lessonPlan, setLessonPlan] = useState<ApiLessonPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!lessonPlanId) {
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError('')

    getLessonPlanById(lessonPlanId)
      .then((response) => {
        if (isMounted) {
          setLessonPlan(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar este plano de aula.')
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
  }, [lessonPlanId])

  if (isLoading) {
    return <section className="empty-card">Carregando plano de aula...</section>
  }

  if (error || !lessonPlan) {
    return (
      <section className="empty-card">
        <h2>Não encontramos este plano de aula</h2>
        <p>{error || 'Ele pode ter sido removido ou ainda não estar disponível.'}</p>
      </section>
    )
  }

  return (
    <>
      <section className="page-header">
        <div>
          <Link to="/planos-de-aula" className="back-link">
            <ArrowLeft size={16} />
            Voltar para planos de aula
          </Link>
          <h1>{lessonPlan.title}</h1>
          <p>
            Publicado por <strong>{lessonPlan.author.name}</strong> em{' '}
            {formatAbsoluteDate(lessonPlan.createdAt)}.
          </p>
        </div>
      </section>

      <section className="detail-layout">
        <div className="detail-main">
          <article className="detail-card">
            <div className="detail-topline">
              <span className="eyebrow">
                <GraduationCap size={16} />
                {lessonPlan.grade} • {lessonPlan.subject}
              </span>
            </div>

            <section className="detail-section">
              <h2 className="section-title">
                <Target size={18} />
                Objetivos de aprendizagem
              </h2>
              <p>{lessonPlan.objectives}</p>
            </section>

            <section className="detail-section">
              <h2 className="section-title">
                <Layers3 size={18} />
                Recursos digitais
              </h2>
              <p>{lessonPlan.digitalTools}</p>
            </section>

            <section className="detail-section">
              <h2 className="section-title">Como aplicar</h2>
              <div
                className="detail-content rich-content"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(lessonPlan.content) }}
              />
            </section>

            {lessonPlan.files.length > 0 ? (
              <section className="detail-section">
                <h2 className="section-title">
                  <FileText size={18} />
                  Materiais anexados
                </h2>

                <div className="detail-file-list">
                  {lessonPlan.files.map((file) => (
                    <a
                      key={file.id}
                      href={getAssetUrl(file.filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="detail-file-card"
                    >
                      <div>
                        <strong>{file.originalName}</strong>
                        <span>{formatFileSize(file.fileSize)}</span>
                      </div>
                      <ExternalLink size={18} />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {lessonPlan.tags.length > 0 ? (
              <div className="tag-row" style={{ marginTop: '18px' }}>
                {lessonPlan.tags.map((tag) => (
                  <span key={tag.id} className="tag">
                    <Tag size={14} />
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        </div>

        <aside className="detail-sidebar">
          <section className="detail-card">
            <h2 className="section-title">Resumo</h2>
            <div className="summary-list">
              <div className="summary-item">
                <span className="summary-label">Autor</span>
                <strong>{lessonPlan.author.name}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Comunidade</span>
                <strong>{lessonPlan.community?.name || 'Aberto a todos'}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Ano/série</span>
                <strong>{lessonPlan.grade}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Disciplina</span>
                <strong>{lessonPlan.subject}</strong>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </>
  )
}
