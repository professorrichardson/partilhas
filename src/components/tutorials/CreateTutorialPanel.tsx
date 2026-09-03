import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ApiError, createTutorial } from '../../lib/api'
import type { ApiTutorialDetail, CreateTutorialStepPayload } from '../../types/api'

interface CreateTutorialPanelProps {
  token: string
  onCreated: (tutorial: ApiTutorialDetail) => void
}

function emptyStep(): CreateTutorialStepPayload {
  return { title: '', content: '', videoUrl: '' }
}

export function CreateTutorialPanel({ token, onCreated }: CreateTutorialPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    tool: '',
    coverImageUrl: '',
  })
  const [steps, setSteps] = useState<CreateTutorialStepPayload[]>([emptyStep()])

  function updateStep(index: number, patch: Partial<CreateTutorialStepPayload>) {
    setSteps((current) => current.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)))
  }

  function addStep() {
    setSteps((current) => [...current, emptyStep()])
  }

  function removeStep(index: number) {
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const createdTutorial = await createTutorial(token, {
        title: form.title,
        description: form.description,
        tool: form.tool,
        coverImageUrl: form.coverImageUrl || undefined,
        steps: steps.map((step) => ({
          title: step.title,
          content: step.content,
          videoUrl: step.videoUrl || undefined,
        })),
      })

      setForm({ title: '', description: '', tool: '', coverImageUrl: '' })
      setSteps([emptyStep()])
      onCreated(createdTutorial)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)
      } else {
        setError('Não foi possível publicar o tutorial agora.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">Novo tutorial</h2>
          <p className="section-subtitle">
            Ensine outros professores a usar uma ferramenta digital em etapas simples.
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
            placeholder="Ex.: Como criar um jogo no Wordwall"
            required
          />
        </label>

        <div className="form-grid">
          <label className="input-group">
            <span>Ferramenta</span>
            <input
              className="text-input"
              value={form.tool}
              onChange={(event) => setForm((current) => ({ ...current, tool: event.target.value }))}
              placeholder="Ex.: Wordwall"
              required
            />
          </label>

          <label className="input-group">
            <span>Capa (URL opcional)</span>
            <input
              className="text-input"
              value={form.coverImageUrl}
              onChange={(event) => setForm((current) => ({ ...current, coverImageUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>
        </div>

        <label className="input-group">
          <span>Descrição</span>
          <textarea
            className="textarea-input"
            rows={3}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="O que o professor vai aprender a fazer neste tutorial?"
            required
          />
        </label>

        <div className="stack">
          <span>Etapas do tutorial</span>

          {steps.map((step, index) => (
            <div key={index} className="panel tutorial-step-form">
              <div className="section-header">
                <strong>Etapa {index + 1}</strong>
                {steps.length > 1 ? (
                  <button type="button" className="icon-button" onClick={() => removeStep(index)}>
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>

              <label className="input-group">
                <span>Título da etapa</span>
                <input
                  className="text-input"
                  value={step.title}
                  onChange={(event) => updateStep(index, { title: event.target.value })}
                  placeholder="Ex.: Criando uma conta gratuita"
                  required
                />
              </label>

              <label className="input-group">
                <span>Explicação</span>
                <textarea
                  className="textarea-input"
                  rows={3}
                  value={step.content}
                  onChange={(event) => updateStep(index, { content: event.target.value })}
                  placeholder="Descreva o passo a passo desta etapa."
                  required
                />
              </label>

              <label className="input-group">
                <span>Vídeo (URL opcional)</span>
                <input
                  className="text-input"
                  value={step.videoUrl}
                  onChange={(event) => updateStep(index, { videoUrl: event.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
            </div>
          ))}

          <div className="button-row">
            <button type="button" className="secondary-button" onClick={addStep}>
              <Plus size={16} />
              Adicionar etapa
            </button>
          </div>
        </div>

        {error ? <p className="status-message error">{error}</p> : null}

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar tutorial'}
          </button>
        </div>
      </form>
    </section>
  )
}
