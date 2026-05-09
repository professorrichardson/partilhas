import { useMemo, useState } from 'react'
import { createPost, ApiError } from '../../lib/api'
import { isRichTextEmpty, richTextToPlainText } from '../../lib/richText'
import type { ApiCommunity, ApiPost } from '../../types/api'
import { RichTextEditor } from './RichTextEditor'

interface CreatePostPanelProps {
  communities: ApiCommunity[]
  token: string
  onCreated: (post: ApiPost) => void
  initialCommunityId?: string
  lockCommunity?: boolean
}

export function CreatePostPanel({
  communities,
  token,
  onCreated,
  initialCommunityId = '',
  lockCommunity = false,
}: CreatePostPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    content: '',
    communityId: initialCommunityId,
    youtubeUrl: '',
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
      setError('Escreva uma descrição com pelo menos 10 caracteres.')
      setIsSubmitting(false)
      return
    }

    const payload = new FormData()

    // O FormData replica o formato que o Express espera para upload multipart.
    payload.append('title', form.title)
    payload.append('content', form.content)

    if (form.communityId) {
      payload.append('communityId', form.communityId)
    }

    if (form.youtubeUrl) {
      payload.append('youtubeUrl', form.youtubeUrl)
    }

    if (form.tags) {
      payload.append('tags', form.tags)
    }

    files.forEach((file) => {
      payload.append('files', file)
    })

    try {
      const createdPost = await createPost(token, payload)

      setForm({
        title: '',
        content: '',
        communityId: initialCommunityId,
        youtubeUrl: '',
        tags: '',
      })
      setFiles([])
      onCreated(createdPost)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)
      } else {
        setError('Não foi possível publicar a partilha agora.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">Nova partilha</h2>
          <p className="section-subtitle">
            Publique texto, anexos pedagógicos e link do YouTube quando fizer sentido.
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
            placeholder="Ex.: Sequência didática de leitura"
            required
          />
        </label>

        <label className="input-group">
          <span>Descrição da partilha</span>
          <RichTextEditor
            value={form.content}
            onChange={(content) => setForm((current) => ({ ...current, content }))}
            placeholder="Conte o objetivo, a turma, como aplicou e quais materiais está compartilhando."
          />
        </label>

        <div className="form-grid">
          <label className="input-group">
            <span>Comunidade</span>
            <select
              className="text-input"
              value={form.communityId}
              disabled={lockCommunity}
              onChange={(event) =>
                setForm((current) => ({ ...current, communityId: event.target.value }))
              }
            >
              <option value="">Feed geral</option>
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
              placeholder="Projetos, alfabetização, leitura"
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="input-group">
            <span>Link do YouTube</span>
            <input
              className="text-input"
              value={form.youtubeUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, youtubeUrl: event.target.value }))
              }
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>

          <label className="input-group">
            <span>Anexos</span>
            <input
              className="text-input file-input"
              type="file"
              accept={acceptedExtensions}
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>
        </div>

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
            {isSubmitting ? 'Publicando...' : 'Publicar partilha'}
          </button>
        </div>
      </form>
    </section>
  )
}
