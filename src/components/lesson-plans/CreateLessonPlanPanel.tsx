import { useMemo, useState } from 'react'
import { createLessonPlan, ApiError } from '../../lib/api'
import { RichTextEditor } from '../posts/RichTextEditor'
import { isRichTextEmpty, richTextToPlainText } from '../../lib/richText'
import type { ApiCommunity, ApiLessonPlan } from '../../types/api'

interface CreateLessonPlanPanelProps {
  communities: ApiCommunity[]
  token: string
  onCreated: (lessonPlan: ApiLessonPlan) => void
}

export function CreateLessonPlanPanel({ communities, token, onCreated }: CreateLessonPlanPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    grade: '',
    subject: '',
    objectives: '',
    digitalTools: '',
    content: '',
    communityId: '',
    tags: '',
  })
  const [files, setFiles] = useState<File[]>([])

  const acceptedExtensions = useMemo(
    () => '.pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt',
    [],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (isRichTextEmpty(form.content) || richTextToPlainText(form.content).length < 10) {
      setError('Descreva como aplicar o plano com pelo menos 10 caracteres.')
      setIsSubmitting(false)
      return
    }

    const payload = new FormData()
    payload.append('title', form.title)
    payload.append('grade', form.grade)
    payload.append('subject', form.subject)
    payload.append('objectives', form.objectives)
    payload.append('digitalTools', form.digitalTools)
    payload.append('content', form.content)

    if (form.communityId) {
      payload.append('communityId', form.communityId)
    }

    if (form.tags) {
      payload.append('tags', form.tags)
    }

    files.forEach((file) => {
      payload.append('files', file)
    })

    try {
      const createdLessonPlan = await createLessonPlan(token, payload)

      setForm({
        title: '',
        grade: '',
        subject: '',
        objectives: '',
        digitalTools: '',
        content: '',
        communityId: '',
        tags: '',
      })
      setFiles([])
      onCreated(createdLessonPlan)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)
      } else {
        setError('Não foi possível publicar o plano de aula agora.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">Novo plano de aula</h2>
          <p className="section-subtitle">
            Compartilhe um plano pronto com objetivos claros e recursos digitais aplicados.
          </p>
        </div>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <label className="input-group">
          <span>Título</span>
          <input
            className="text-input"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Ex.: Produção de texto com QR Codes"
            required
          />
        </label>

        <div className="form-grid">
          <label className="input-group">
            <span>Ano/série</span>
            <input
              className="text-input"
              value={form.grade}
              onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))}
              placeholder="Ex.: 5º ano"
              required
            />
          </label>

          <label className="input-group">
            <span>Disciplina</span>
            <input
              className="text-input"
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="Ex.: Língua Portuguesa"
              required
            />
          </label>
        </div>

        <label className="input-group">
          <span>Objetivos de aprendizagem</span>
          <textarea
            className="textarea-input"
            rows={3}
            value={form.objectives}
            onChange={(event) => setForm((current) => ({ ...current, objectives: event.target.value }))}
            placeholder="O que os alunos devem aprender com essa atividade?"
            required
          />
        </label>

        <label className="input-group">
          <span>Recursos digitais utilizados</span>
          <textarea
            className="textarea-input"
            rows={2}
            value={form.digitalTools}
            onChange={(event) => setForm((current) => ({ ...current, digitalTools: event.target.value }))}
            placeholder="Ex.: Canva, Google Forms, QR Code"
            required
          />
        </label>

        <label className="input-group">
          <span>Como aplicar</span>
          <RichTextEditor
            value={form.content}
            onChange={(content) => setForm((current) => ({ ...current, content }))}
            placeholder="Descreva o passo a passo da aula, tempo estimado e avaliação."
          />
        </label>

        <div className="form-grid">
          <label className="input-group">
            <span>Comunidade (opcional)</span>
            <select
              className="text-input"
              value={form.communityId}
              onChange={(event) => setForm((current) => ({ ...current, communityId: event.target.value }))}
            >
              <option value="">Nenhuma</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>Tags</span>
            <input
              className="text-input"
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="leitura, alfabetização"
            />
          </label>
        </div>

        <label className="input-group">
          <span>Anexos (opcional)</span>
          <input
            className="text-input file-input"
            type="file"
            accept={acceptedExtensions}
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>

        {files.length > 0 ? (
          <div className="file-badges">
            {files.map((file) => (
              <span key={`${file.name}-${file.size}`} className="file-badge">
                {file.name}
              </span>
            ))}
          </div>
        ) : null}

        {error ? <p className="status-message error">{error}</p> : null}

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar plano de aula'}
          </button>
        </div>
      </form>
    </section>
  )
}
