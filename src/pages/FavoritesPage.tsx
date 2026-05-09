import { useEffect, useState } from 'react'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../contexts/AuthContext'
import {
  addCommentToPost,
  addFavorite,
  addLikeToPost,
  getFavorites,
  removeFavorite,
  removeLikeFromPost,
} from '../lib/api'
import type { ApiPost } from '../types/api'
import { replacePostInCollection } from './helpers'

export function FavoritesPage() {
  const { token } = useAuth()
  const [favorites, setFavorites] = useState<ApiPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }

    getFavorites(token)
      .then((response) => {
        setFavorites(response)
      })
      .catch(() => {
        setError('Não foi possível carregar seus favoritos agora.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [token])

  async function handleToggleLike(post: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = post.viewerContext.isLiked
      ? await removeLikeFromPost(token, post.id)
      : await addLikeToPost(token, post.id)

    setFavorites((current) => replacePostInCollection(current, updatedPost))
  }

  async function handleToggleFavorite(post: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = post.viewerContext.isFavorited
      ? await removeFavorite(token, post.id)
      : await addFavorite(token, post.id)

    if (!updatedPost.viewerContext.isFavorited) {
      setFavorites((current) => current.filter((item) => item.id !== updatedPost.id))
      return
    }

    setFavorites((current) => replacePostInCollection(current, updatedPost))
  }

  async function handleCommentSubmit(postId: string, content: string) {
    if (!token) {
      return
    }

    const updatedPost = await addCommentToPost(token, postId, content)
    setFavorites((current) => replacePostInCollection(current, updatedPost))
  }

  return (
    <>
      <section className="page-header">
        <div>
          <h1>Favoritos</h1>
          <p>
            Aqui ficam as partilhas que você quer reencontrar rápido, sem depender do
            feed principal.
          </p>
        </div>
      </section>

      {error ? <div className="empty-card status-message error">{error}</div> : null}
      {isLoading ? <div className="empty-card">Carregando favoritos...</div> : null}
      {!isLoading && favorites.length === 0 ? (
        <section className="empty-card">
          <h2>Nenhum favorito salvo</h2>
          <p>Quando você salvar uma partilha no feed, ela aparecerá aqui.</p>
        </section>
      ) : null}

      <section className="favorites-grid">
        {favorites.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            onCommentSubmit={handleCommentSubmit}
          />
        ))}
      </section>
    </>
  )
}
