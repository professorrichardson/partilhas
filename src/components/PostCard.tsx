import { Bookmark, Heart, MessageCircle, Send, Share2, Images } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFileSize, formatRelativeDate, getInitials } from '../lib/format'
import {
  getAssetUrl,
  getImageFiles,
  getNonImageFiles,
  getYoutubeEmbedUrl,
} from '../lib/post'
import { isRichTextLong, sanitizeRichText } from '../lib/richText'
import type { ApiPost } from '../types/api'
import { sharePost } from '../lib/share'

interface PostCardProps {
  post: ApiPost
  onToggleLike?: (post: ApiPost) => Promise<void>
  onToggleFavorite?: (post: ApiPost) => Promise<void>
  onCommentSubmit?: (postId: string, content: string) => Promise<void>
  detailHref?: string
}

export function PostCard({
  post,
  onToggleLike,
  onToggleFavorite,
  onCommentSubmit,
  detailHref = `/partilhas/${post.id}`,
}: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [isFavoriting, setIsFavoriting] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [comment, setComment] = useState('')

  const imageFiles = getImageFiles(post)
  const otherFiles = getNonImageFiles(post)

  const previewImages = imageFiles.slice(0, 3)
  const youtubeEmbed = getYoutubeEmbedUrl(post.youtubeUrl)
  const hasMoreContent = isRichTextLong(post.content)
  const hasMaterials = post.files.length > 0

  async function handleToggleLike() {
    if (!onToggleLike) return

    setIsLiking(true)

    try {
      await onToggleLike(post)
    } finally {
      setIsLiking(false)
    }
  }

  async function handleToggleFavorite() {
    if (!onToggleFavorite) return

    setIsFavoriting(true)

    try {
      await onToggleFavorite(post)
    } finally {
      setIsFavoriting(false)
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!onCommentSubmit || !comment.trim()) return

    setIsCommenting(true)

    try {
      await onCommentSubmit(post.id, comment.trim())
      setComment('')
    } finally {
      setIsCommenting(false)
    }
  }

  async function handleShare() { 
    const result = await sharePost({ 
      postId: post.id, 
      title: post.title, 
      text: `Confira esta partilha de ${post.author.name}`, 
    }) 
    if (result.method === 'clipboard') { 
      alert('Link copiado para a área de transferência!') 
    } }

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-author">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="avatar-image avatar small"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="avatar small" aria-hidden="true">
              {getInitials(post.author.name)}
            </div>
          )}

          <div className="post-author-meta">
            <span className="eyebrow">
              {post.author.name} • {formatRelativeDate(post.createdAt)}
            </span>

            <Link to={detailHref} className="post-title-link">
              <h3>{post.title}</h3>
            </Link>

            {post.community ? (
              <p style={{ marginTop: 4 }}>
                Publicado em <strong>{post.community.name}</strong>
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={`icon-button ${post.viewerContext.isFavorited ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          disabled={isFavoriting}
        >
          <Bookmark size={18} />
        </button>
      </header>

      <div
        className={`post-excerpt rich-content ${hasMoreContent ? 'clamped' : ''}`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
      />

      {hasMoreContent ? (
        <Link to={detailHref} className="read-more-link">
          Continuar lendo
        </Link>
      ) : null}

      {/* Vídeo YouTube */}
      {youtubeEmbed ? (
        <div style={{ marginTop: 16 }}>
          <iframe
            width="100%"
            height="320"
            src={youtubeEmbed}
            title="Vídeo YouTube"
            allowFullScreen
            style={{
              border: 0,
              borderRadius: 12,
            }}
          />
        </div>
      ) : null}

      {/* Galeria de imagens */}
      {previewImages.length > 0 ? (
        <div className="post-media-grid">
          {previewImages.map((file) => (
            <img
              key={file.id}
              src={getAssetUrl(file.filePath)}
              alt={file.originalName}
              className="post-preview-image"
            />
          ))}
        </div>
      ) : null}

      {hasMaterials ? (
        <Link to={detailHref} className="secondary-button post-material-link">
          <Images size={16} />
          Ver materiais da partilha
        </Link>
      ) : null}

      {/* Outros arquivos */}
      {otherFiles.length > 0 ? (
        <div className="file-badges post-file-list">
          {otherFiles.map((file) => (
            <a
              key={file.id}
              href={getAssetUrl(file.filePath)}
              target="_blank"
              rel="noreferrer"
              className="file-badge"
            >
              {file.originalName} • {formatFileSize(file.fileSize)}
            </a>
          ))}
        </div>
      ) : null}

      {/* Tags abaixo das imagens */}
      {post.tags.length > 0 ? (
        <div className="tag-row post-tag-row">
          {post.tags.map((tag) => (
            <span key={tag.id} className="tag">
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <footer className="post-actions">
        <button 
        onClick={handleShare}
        className="action-button">
          <Share2 size={18} />
          Compartilhar
        </button>

        <button
          type="button"
          className={`action-button ${
            post.viewerContext.isLiked ? 'active' : ''
          }`}
          onClick={handleToggleLike}
          disabled={isLiking}
        >
          <Heart size={18} />
          {post.metrics.likes}
        </button>

        <span>
          <MessageCircle size={18} />
          {post.metrics.comments}
        </span>

        <span>
          <Bookmark size={18} />
          {post.metrics.favorites}
        </span>
      </footer>

      {post.comments.length > 0 ? (
        <div className="comment-list">
          {post.comments.slice(0, 2).map((commentItem) => (
            <article key={commentItem.id} className="comment-card">
              <strong>{commentItem.author.name}</strong>
              <p>{commentItem.content}</p>
            </article>
          ))}
        </div>
      ) : null}

      {onCommentSubmit ? (
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <input
            className="text-input"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Escreva um comentário rápido..."
          />

          <button
            type="submit"
            className="icon-button"
            disabled={isCommenting}
          >
            <Send size={16} />
          </button>
        </form>
      ) : null}
    </article>
  )
}
