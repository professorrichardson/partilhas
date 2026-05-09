import { HeartHandshake, MessagesSquare, Sparkles, Star } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { CreatePostPanel } from '../components/posts/CreatePostPanel'
import { useAuth } from '../contexts/AuthContext'
import {
  addCommentToPost,
  addFavorite,
  addLikeToPost,
  getCommunities,
  getLibraryMaterials,
  getPosts,
  removeFavorite,
  removeLikeFromPost,
} from '../lib/api'
import { richTextToPlainText } from '../lib/richText'
import type { ApiCommunity, ApiPost } from '../types/api'
import { replacePostInCollection } from './helpers'

const filters = ['Todas', 'Atividades', 'Projetos', 'Dicas', 'Reflexões']
const POSTS_PER_PAGE = 10

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function matchesPostSearch(post: ApiPost, searchTerm: string) {
  const normalizedSearch = normalizeSearchValue(searchTerm)

  if (!normalizedSearch) {
    return true
  }

  const searchableParts = [
    post.title,
    richTextToPlainText(post.content),
    post.author.name,
    post.community?.name || '',
    ...post.tags.map((tag) => tag.name),
  ]

  return searchableParts.some((value) => value.toLowerCase().includes(normalizedSearch))
}

function matchesCommunitySearch(community: ApiCommunity, searchTerm: string) {
  const normalizedSearch = normalizeSearchValue(searchTerm)

  if (!normalizedSearch) {
    return true
  }

  return [community.name, community.description, community.creator.name].some((value) =>
    value.toLowerCase().includes(normalizedSearch),
  )
}

export function HomePage() {
  const { token, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentSearch = searchParams.get('search')?.trim() || ''
  const showComposer = searchParams.get('compose') === '1'
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const [activeFilter, setActiveFilter] = useState('Todas')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(false)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const [materials, setMaterials] = useState<ApiPost[]>([])

  function updateComposerState(nextOpen: boolean) {
    const nextParams = new URLSearchParams(searchParams)

    if (nextOpen) {
      nextParams.set('compose', '1')
    } else {
      nextParams.delete('compose')
    }

    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    if (!token) {
      return
    }

    const authToken = token
    let isMounted = true

    async function loadInitialData() {
      setIsLoading(true)
      setError('')

      try {
        const [postsResponse, communitiesResponse, materialsResponse] = await Promise.all([
          getPosts(authToken, {
            search: currentSearch || undefined,
            page: '1',
            limit: String(POSTS_PER_PAGE),
          }),
          getCommunities(),
          getLibraryMaterials(authToken, {
            search: currentSearch || undefined,
          }),
        ])

        if (!isMounted) {
          return
        }

        setPosts(postsResponse.items)
        setPage(postsResponse.meta.page)
        setHasMorePosts(postsResponse.meta.hasMore)
        setCommunities(communitiesResponse)
        setMaterials(materialsResponse)
      } catch {
        if (!isMounted) {
          return
        }

        setError('Não foi possível carregar o feed agora.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      isMounted = false
    }
  }, [currentSearch, token])

  const loadMorePosts = useCallback(async () => {
    if (!token || isLoading || isLoadingMore || !hasMorePosts) {
      return
    }

    const authToken = token
    const nextPage = page + 1
    setIsLoadingMore(true)

    try {
      const response = await getPosts(authToken, {
        search: currentSearch || undefined,
        page: String(nextPage),
        limit: String(POSTS_PER_PAGE),
      })

      setPosts((current) => {
        const knownIds = new Set(current.map((post) => post.id))
        const incomingPosts = response.items.filter((post) => !knownIds.has(post.id))
        return [...current, ...incomingPosts]
      })
      setPage(response.meta.page)
      setHasMorePosts(response.meta.hasMore)
    } catch {
      setError('Não foi possível carregar mais partilhas agora.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentSearch, hasMorePosts, isLoading, isLoadingMore, page, token])

  useEffect(() => {
    const element = loadMoreRef.current

    if (!element || !hasMorePosts || isLoading) {
      return
    }

    // O observer mantém o feed leve no mobile, pedindo só mais 10 itens quando o fim se aproxima.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMorePosts()
        }
      },
      {
        rootMargin: '320px 0px',
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasMorePosts, isLoading, loadMorePosts])

  const visiblePosts = useMemo(() => {
    if (activeFilter === 'Todas') {
      return posts
    }

    const normalizedFilter = activeFilter.toLowerCase()

    return posts.filter((post) => {
      return (
        post.tags.some((tag) => tag.name.toLowerCase().includes(normalizedFilter)) ||
        post.title.toLowerCase().includes(normalizedFilter)
      )
    })
  }, [activeFilter, posts])

  const featuredCommunities = useMemo(() => {
    return communities.filter((community) => matchesCommunitySearch(community, currentSearch)).slice(0, 4)
  }, [communities, currentSearch])

  function handlePostCreated(post: ApiPost) {
    if (currentSearch && !matchesPostSearch(post, currentSearch)) {
      updateComposerState(false)
      return
    }

    setPosts((current) => [post, ...current])

    if (post.files.length > 0) {
      setMaterials((current) => [post, ...current])
    }

    updateComposerState(false)
  }

  function handlePostUpdated(updatedPost: ApiPost) {
    setPosts((current) => replacePostInCollection(current, updatedPost))
    setMaterials((current) => replacePostInCollection(current, updatedPost))
  }

  async function handleToggleLike(post: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = post.viewerContext.isLiked
      ? await removeLikeFromPost(token, post.id)
      : await addLikeToPost(token, post.id)

    handlePostUpdated(updatedPost)
  }

  async function handleToggleFavorite(post: ApiPost) {
    if (!token) {
      return
    }

    const updatedPost = post.viewerContext.isFavorited
      ? await removeFavorite(token, post.id)
      : await addFavorite(token, post.id)

    handlePostUpdated(updatedPost)
  }

  async function handleCommentSubmit(postId: string, content: string) {
    if (!token) {
      return
    }

    const updatedPost = await addCommentToPost(token, postId, content)
    handlePostUpdated(updatedPost)
  }

  return (
    <div className="home-grid">
      <div className="content-column">
        <section className="panel hero-panel">
          <div>
            <h1>Bem-vinda, {user?.name}!</h1>
            <p>
              Que bom ter você aqui. Compartilhe, aprenda e inspire outros professores
              todos os dias com atividades, projetos e materiais pedagógicos.
            </p>

            <div className="button-row">
              <button
                type="button"
                className="primary-button"
                onClick={() => updateComposerState(!showComposer)}
              >
                {showComposer ? 'Fechar formulário' : 'Nova Partilha'}
              </button>
              <Link to="/biblioteca" className="secondary-button">
                Explorar Biblioteca
              </Link>
            </div>
          </div>

          <div className="hero-illustration" aria-hidden="true">
            <div className="floating-note left">
              <HeartHandshake />
            </div>
            <div className="floating-note right">
              <Sparkles />
            </div>
            <div className="floating-note bottom">
              <MessagesSquare />
            </div>
            <div className="hero-owl">🦉</div>
          </div>
        </section>

        {showComposer && token ? (
          <CreatePostPanel communities={communities} token={token} onCreated={handlePostCreated} />
        ) : null}

        {!showComposer ? (
          <>
            {error ? <div className="empty-card status-message error">{error}</div> : null}

            {isLoading ? <div className="empty-card">Carregando partilhas...</div> : null}

            {!isLoading && visiblePosts.length === 0 ? (
              <div className="empty-card">
                <h2>Nenhuma partilha encontrada</h2>
                <p>
                  {currentSearch
                    ? 'Tente outra busca ou publique um conteúdo com esse tema.'
                    : 'Seu banco já está conectado. O próximo passo é publicar a primeira partilha usando o formulário acima.'}
                </p>
              </div>
            ) : null}

            <div className="post-list">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onToggleLike={handleToggleLike}
                  onToggleFavorite={handleToggleFavorite}
                  onCommentSubmit={handleCommentSubmit}
                />
              ))}
            </div>

            {!isLoading && posts.length > 0 ? (
              <div ref={loadMoreRef} className="empty-card compact feed-loader">
                {isLoadingMore ? <p>Carregando mais partilhas...</p> : null}

                {!isLoadingMore && hasMorePosts ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => void loadMorePosts()}
                  >
                    Carregar mais 10 partilhas
                  </button>
                ) : null}

                {!hasMorePosts ? <p>Você já viu as partilhas carregadas até aqui.</p> : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {!showComposer ? (
      <aside className="aside-column">
        <section className="promo-card">
          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>
            Compartilhe atividades que inspiram.
          </h2>
          <p style={{ marginTop: '10px', maxWidth: '18rem', lineHeight: 1.7 }}>
            Organize arquivos, publique projetos e mantenha uma biblioteca acessível
            mesmo quando o feed crescer.
          </p>
          <div className="button-row">
            <Link to="/biblioteca" className="secondary-button">
              Ir para Biblioteca
            </Link>
          </div>
        </section>

        <section className="panel list-card desktop-feed-panel">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Star size={18} />
                Partilhas em destaque
              </h2>
              <p className="section-subtitle">
                {currentSearch
                  ? `Resultados para "${currentSearch}" no feed.`
                  : 'Um feed pensado para trocas rápidas e materiais que não se perdem.'}
              </p>
            </div>
          </div>

          <div className="filter-row">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="panel list-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">Comunidades em destaque</h2>
            </div>
            <Link to="/comunidades" className="ghost-button">
              Ver todas
            </Link>
          </div>

          {featuredCommunities.length === 0 ? (
            <div className="empty-card compact">
              <p>Nenhuma comunidade combinou com essa busca.</p>
            </div>
          ) : (
            <ul>
              {featuredCommunities.map((community) => (
                <li key={community.id} className="list-row">
                  <div className="list-icon">
                    <Sparkles size={18} />
                  </div>
                  <Link to={`/comunidades/${community.slug}`}>
                    <strong>{community.name}</strong>
                    <div className="muted">{community.metrics.members} membros</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel list-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">Biblioteca rápida</h2>
            </div>
          </div>

          {materials.length === 0 ? (
            <div className="empty-card compact">
              <p>Nenhum material encontrado com esse termo.</p>
            </div>
          ) : (
            <ul>
              {materials.slice(0, 3).map((material) => (
                <li key={material.id} className="list-row">
                  <div className="list-icon">📎</div>
                  <Link to={`/biblioteca/${material.id}`}>
                    <strong>{material.title}</strong>
                    <div className="muted">
                      {material.files.length > 0
                        ? material.files.map((file) => file.originalName).join(' • ')
                        : 'Link externo'}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
      ) : null}
    </div>
  )
}
