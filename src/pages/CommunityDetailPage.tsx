import { ArrowLeft, Layers3, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { CreatePostPanel } from '../components/posts/CreatePostPanel'
import { useAuth } from '../contexts/AuthContext'
import {
  addCommentToPost,
  addFavorite,
  addLikeToPost,
  getCommunityByIdentifier,
  removeFavorite,
  removeLikeFromPost,
} from '../lib/api'
import { formatAbsoluteDate } from '../lib/format'
import type { ApiCommunityDetail, ApiPost } from '../types/api'
import { replacePostInCollection } from './helpers'

export function CommunityDetailPage() {
  const { identifier } = useParams()
  const { token } = useAuth()
  const [community, setCommunity] = useState<ApiCommunityDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComposer, setShowComposer] = useState(false)

  useEffect(() => {
    if (!identifier) {
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError('')

    getCommunityByIdentifier(identifier, token)
      .then((response) => {
        if (isMounted) {
          setCommunity(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar esta comunidade agora.')
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
  }, [identifier, token])

  function updateCommunityPosts(updatedPost: ApiPost) {
    setCommunity((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        posts: replacePostInCollection(current.posts, updatedPost),
      }
    })
  }

  async function handleToggleLike(post: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = post.viewerContext.isLiked
      ? await removeLikeFromPost(token, post.id)
      : await addLikeToPost(token, post.id)

    updateCommunityPosts(updatedPost)
  }

  async function handleToggleFavorite(post: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = post.viewerContext.isFavorited
      ? await removeFavorite(token, post.id)
      : await addFavorite(token, post.id)

    updateCommunityPosts(updatedPost)
  }

  async function handleCommentSubmit(postId: string, content: string) {
    if (!token) {
      return
    }

    const updatedPost = await addCommentToPost(token, postId, content)
    updateCommunityPosts(updatedPost)
  }

  function handlePostCreated(post: ApiPost) {
    setCommunity((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        metrics: {
          ...current.metrics,
          posts: current.metrics.posts + 1,
        },
        posts: [post, ...current.posts],
      }
    })

    setShowComposer(false)
  }

  if (isLoading) {
    return <section className="empty-card">Carregando comunidade...</section>
  }

  if (error || !community) {
    return (
      <section className="empty-card">
        <h2>Comunidade indisponível</h2>
        <p>{error || 'Não foi possível abrir a comunidade agora.'}</p>
      </section>
    )
  }

  return (
    <>
      <section className="page-header">
        <div>
          <Link to="/comunidades" className="back-link">
            <ArrowLeft size={16} />
            Voltar para comunidades
          </Link>
          <h1>{community.name}</h1>
          <p>
            Criada por <strong>{community.creator.name}</strong> em{' '}
            {formatAbsoluteDate(community.createdAt)}.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowComposer((current) => !current)}
        >
          {showComposer ? 'Fechar formulário' : 'Nova partilha na comunidade'}
        </button>
      </section>

      <section className="community-hero">
        <article className="detail-card">
          <span className="eyebrow">Comunidade aberta</span>
          <p className="detail-content">{community.description}</p>
        </article>

        <article className="detail-card summary-card">
          <div className="summary-item">
            <span className="summary-label">
              <Users size={16} />
              Membros
            </span>
            <strong>{community.metrics.members}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">
              <Layers3 size={16} />
              Partilhas
            </span>
            <strong>{community.metrics.posts}</strong>
          </div>
        </article>
      </section>

      {showComposer && token ? (
        <CreatePostPanel
          communities={[community]}
          token={token}
          onCreated={handlePostCreated}
          initialCommunityId={community.id}
          lockCommunity
        />
      ) : null}

      {community.posts.length === 0 ? (
        <section className="empty-card">
          <h2>Esta comunidade ainda não tem publicações</h2>
          <p>Use o botão acima para criar a primeira partilha diretamente nela.</p>
        </section>
      ) : (
        <section className="post-list">
          {community.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onCommentSubmit={handleCommentSubmit}
            />
          ))}
        </section>
      )}
    </>
  )
}
