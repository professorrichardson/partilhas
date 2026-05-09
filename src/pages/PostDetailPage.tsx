import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  FileText,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  PlayCircle,
  Send,
  Tag,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  addCommentToPost,
  addFavorite,
  addLikeToPost,
  getPostById,
  getPosts,
  removeFavorite,
  removeLikeFromPost,
} from '../lib/api'
import { formatAbsoluteDate, formatFileSize } from '../lib/format'
import {
  countMaterials,
  getAssetUrl,
  getImageFiles,
  getNonImageFiles,
  getYoutubeEmbedUrl,
} from '../lib/post'
import { sanitizeRichText } from '../lib/richText'
import type { ApiPost } from '../types/api'
import { replacePostInCollection } from './helpers'

interface PostDetailPageProps {
  variant: 'partilha' | 'biblioteca'
}

export function PostDetailPage({ variant }: PostDetailPageProps) {
  const { postId } = useParams()
  const { token } = useAuth()
  const [post, setPost] = useState<ApiPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<ApiPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)

  useEffect(() => {
    if (!postId) {
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError('')

    getPostById(postId, token)
      .then(async (postResponse) => {
        if (!isMounted) {
          return
        }

        setPost(postResponse)

        if (!token) {
          setRelatedPosts([])
          return
        }

        const relatedSource = postResponse.community?.id
          ? await getPosts(token, { communityId: postResponse.community.id, limit: '4' })
          : await getPosts(token, { limit: '10' })

        if (!isMounted) {
          return
        }

        setRelatedPosts(
          relatedSource.items
            .filter((candidate) => candidate.id !== postResponse.id)
            .filter((candidate) =>
              postResponse.community?.id
                ? candidate.community?.id === postResponse.community.id
                : candidate.author.id === postResponse.author.id,
            )
            .slice(0, 3),
        )
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar os detalhes desta publicação.')
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
  }, [postId, token])

  function handlePostUpdated(updatedPost: ApiPost) {
    setPost(updatedPost)
    setRelatedPosts((current) => replacePostInCollection(current, updatedPost))
  }

  async function handleToggleLike(currentPost: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = currentPost.viewerContext.isLiked
      ? await removeLikeFromPost(token, currentPost.id)
      : await addLikeToPost(token, currentPost.id)

    handlePostUpdated(updatedPost)
  }

  async function handleToggleFavorite(currentPost: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = currentPost.viewerContext.isFavorited
      ? await removeFavorite(token, currentPost.id)
      : await addFavorite(token, currentPost.id)

    handlePostUpdated(updatedPost)
  }

  async function handleCommentSubmit(currentPostId: string, content: string) {
    if (!token) {
      return
    }

    setIsCommenting(true)

    try {
      const updatedPost = await addCommentToPost(token, currentPostId, content)
      handlePostUpdated(updatedPost)
      setComment('')
    } finally {
      setIsCommenting(false)
    }
  }

  if (isLoading) {
    return <section className="empty-card">Carregando detalhes...</section>
  }

  if (error || !post) {
    return (
      <section className="empty-card">
        <h2>Não encontramos esta publicação</h2>
        <p>{error || 'Ela pode ter sido removida ou ainda não estar disponível.'}</p>
      </section>
    )
  }

  const imageFiles = getImageFiles(post)
  const otherFiles = getNonImageFiles(post)
  const youtubeEmbed = getYoutubeEmbedUrl(post.youtubeUrl)
  const backPath = variant === 'biblioteca' ? '/biblioteca' : '/'
  const backLabel = variant === 'biblioteca' ? 'Voltar para biblioteca' : 'Voltar para partilhas'

  return (
    <>
      <section className="page-header">
        <div>
          <Link to={backPath} className="back-link">
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
          <h1>{post.title}</h1>
          <p>
            Publicado por <strong>{post.author.name}</strong> em{' '}
            {formatAbsoluteDate(post.createdAt)}.
          </p>
        </div>
      </section>

      <section className="detail-layout">
        <div className="detail-main">
          <article className="detail-card">
            <div className="detail-topline">
              <span className="eyebrow">
                <Bookmark size={16} />
                {post.community?.name || 'Feed geral'}
              </span>

              <div className="detail-metrics">
                <span>
                  <Heart size={16} />
                  {post.metrics.likes}
                </span>
                <span>
                  <MessageCircle size={16} />
                  {post.metrics.comments}
                </span>
              </div>
            </div>

            <div
              className="detail-content rich-content"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
            />

            {youtubeEmbed ? (
              <div className="video-frame">
                <iframe
                  width="100%"
                  height="420"
                  src={youtubeEmbed}
                  title={post.title}
                  allowFullScreen
                />
              </div>
            ) : null}

            {imageFiles.length > 0 ? (
              <section className="detail-section">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <ImageIcon size={18} />
                      Galeria completa
                    </h2>
                    <p className="section-subtitle">
                      Todos os materiais visuais anexados nesta publicação.
                    </p>
                  </div>
                </div>

                <div className="detail-gallery">
                  {imageFiles.map((file) => (
                    <a
                      key={file.id}
                      href={getAssetUrl(file.filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="detail-gallery-item"
                    >
                      <img src={getAssetUrl(file.filePath)} alt={file.originalName} />
                      <span>{file.originalName}</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {otherFiles.length > 0 ? (
              <section className="detail-section">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <FileText size={18} />
                      Materiais anexados
                    </h2>
                  </div>
                </div>

                <div className="detail-file-list">
                  {otherFiles.map((file) => (
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

            <section className="detail-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    <MessageCircle size={18} />
                    Comentários e interação
                  </h2>
                </div>
              </div>

              <div className="detail-actions">
                <button
                  type="button"
                  className={`action-button ${post.viewerContext.isLiked ? 'active' : ''}`}
                  onClick={() => handleToggleLike(post)}
                >
                  <Heart size={18} />
                  {post.metrics.likes} curtidas
                </button>

                <button
                  type="button"
                  className={`action-button ${post.viewerContext.isFavorited ? 'active' : ''}`}
                  onClick={() => handleToggleFavorite(post)}
                >
                  <Bookmark size={18} />
                  {post.metrics.favorites} favoritos
                </button>
              </div>

              {post.comments.length > 0 ? (
                <div className="comment-list">
                  {post.comments.map((commentItem) => (
                    <article key={commentItem.id} className="comment-card">
                      <strong>{commentItem.author.name}</strong>
                      <p>{commentItem.content}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-card compact">
                  <h2>Ainda não há comentários</h2>
                  <p>Se quiser, você pode iniciar a conversa sobre este material.</p>
                </div>
              )}

              <form
                className="comment-form"
                onSubmit={(event) => {
                  event.preventDefault()

                  if (!comment.trim()) {
                    return
                  }

                  void handleCommentSubmit(post.id, comment.trim())
                }}
              >
                <input
                  className="text-input"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Escreva um comentário sobre esta publicação..."
                />

                <button type="submit" className="icon-button" disabled={isCommenting}>
                  <Send size={16} />
                </button>
              </form>
            </section>
          </article>
        </div>

        <aside className="detail-sidebar">
          <section className="detail-card">
            <h2 className="section-title">Resumo do material</h2>
            <div className="summary-list">
              <div className="summary-item">
                <span className="summary-label">Autor</span>
                <strong>{post.author.name}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Comunidade</span>
                <strong>{post.community?.name || 'Feed geral'}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Materiais no post</span>
                <strong>{countMaterials(post)}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Vídeo</span>
                <strong>{post.youtubeUrl ? 'Sim' : 'Não'}</strong>
              </div>
            </div>

            {post.tags.length > 0 ? (
              <div className="tag-row" style={{ marginTop: '18px' }}>
                {post.tags.map((tag) => (
                  <span key={tag.id} className="tag">
                    <Tag size={14} />
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}

            {post.youtubeUrl ? (
              <a href={post.youtubeUrl} target="_blank" rel="noreferrer" className="external-link">
                <PlayCircle size={16} />
                Abrir vídeo no YouTube
              </a>
            ) : null}
          </section>

          {relatedPosts.length > 0 ? (
            <section className="detail-card">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Mais conteúdos relacionados</h2>
                  <p className="section-subtitle">
                    Outras publicações da mesma comunidade ou do mesmo autor.
                  </p>
                </div>
              </div>

              <div className="detail-related-list">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/partilhas/${relatedPost.id}`}
                    className="related-post-link"
                  >
                    <strong>{relatedPost.title}</strong>
                    <span>{relatedPost.author.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </>
  )
}
