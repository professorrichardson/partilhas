import { useEffect, useState } from 'react'
import { getPostReviews, removePostReview, upsertPostReview } from '../../lib/api'
import { formatRelativeDate } from '../../lib/format'
import { StarRating } from '../StarRating'
import type { ApiPost, ReviewsResponse } from '../../types/api'

interface ReviewsSectionProps {
  post: ApiPost
  token: string | null
  onReviewed: () => void
}

export function ReviewsSection({ post, token, onReviewed }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    rating: post.viewerContext.myRating || 0,
    comment: '',
    classroom: '',
    adaptations: '',
  })

  useEffect(() => {
    let isMounted = true

    getPostReviews(post.id)
      .then((response) => {
        if (isMounted) {
          setReviews(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar as avaliações agora.')
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
  }, [post.id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token || form.rating === 0) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await upsertPostReview(token, post.id, {
        rating: form.rating,
        comment: form.comment || undefined,
        classroom: form.classroom || undefined,
        adaptations: form.adaptations || undefined,
      })
      const response = await getPostReviews(post.id)
      setReviews(response)
      setForm({ rating: form.rating, comment: '', classroom: '', adaptations: '' })
      onReviewed()
    } catch {
      setError('Não foi possível enviar sua avaliação agora.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemove() {
    if (!token) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await removePostReview(token, post.id)
      const response = await getPostReviews(post.id)
      setReviews(response)
      setForm({ rating: 0, comment: '', classroom: '', adaptations: '' })
      onReviewed()
    } catch {
      setError('Não foi possível remover sua avaliação agora.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="detail-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Avaliações do material</h2>
          <p className="section-subtitle">
            {reviews && reviews.summary.count > 0
              ? `Nota média ${reviews.summary.average.toFixed(1)} de ${reviews.summary.count} avaliação(ões).`
              : 'Ainda não há avaliações para este material.'}
          </p>
        </div>
      </div>

      {token ? (
        <form className="stack review-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <span>Sua nota</span>
            <StarRating value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} />
          </div>

          <div className="form-grid">
            <label className="input-group">
              <span>Turma em que aplicou (opcional)</span>
              <input
                className="text-input"
                value={form.classroom}
                onChange={(event) => setForm((current) => ({ ...current, classroom: event.target.value }))}
                placeholder="Ex.: 5º ano B"
              />
            </label>

            <label className="input-group">
              <span>Adaptações feitas (opcional)</span>
              <input
                className="text-input"
                value={form.adaptations}
                onChange={(event) => setForm((current) => ({ ...current, adaptations: event.target.value }))}
                placeholder="Ex.: reduzi o tempo da atividade"
              />
            </label>
          </div>

          <label className="input-group">
            <span>Comentário (opcional)</span>
            <textarea
              className="textarea-input"
              rows={3}
              value={form.comment}
              onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
              placeholder="Conte como funcionou na prática."
            />
          </label>

          {error ? <p className="status-message error">{error}</p> : null}

          <div className="button-row">
            <button type="submit" className="primary-button" disabled={isSubmitting || form.rating === 0}>
              {post.viewerContext.myRating ? 'Atualizar avaliação' : 'Enviar avaliação'}
            </button>

            {post.viewerContext.myRating ? (
              <button type="button" className="secondary-button" onClick={handleRemove} disabled={isSubmitting}>
                Remover minha avaliação
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {isLoading ? <div className="empty-card compact">Carregando avaliações...</div> : null}

      {!isLoading && reviews && reviews.items.length === 0 ? (
        <div className="empty-card compact">
          <p>Seja o primeiro a avaliar este material.</p>
        </div>
      ) : null}

      {reviews && reviews.items.length > 0 ? (
        <div className="comment-list">
          {reviews.items.map((review) => (
            <article key={review.id} className="comment-card review-card">
              <div className="review-card-header">
                <strong>{review.author.name}</strong>
                <StarRating value={review.rating} size={14} />
              </div>
              <span className="muted">{formatRelativeDate(review.createdAt)}</span>
              {review.classroom ? <p className="muted">Turma: {review.classroom}</p> : null}
              {review.comment ? <p>{review.comment}</p> : null}
              {review.adaptations ? <p className="muted">Adaptações: {review.adaptations}</p> : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
