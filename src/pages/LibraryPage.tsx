import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MaterialCard } from '../components/MaterialCard'
import { useAuth } from '../contexts/AuthContext'
import { getLibraryMaterials } from '../lib/api'
import type { ApiPost } from '../types/api'

export function LibraryPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const currentSearch = searchParams.get('search')?.trim() || ''
  const [materials, setMaterials] = useState<ApiPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError('')

    getLibraryMaterials(token, {
      search: currentSearch || undefined,
    })
      .then((response) => {
        if (isMounted) {
          setMaterials(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar a biblioteca agora.')
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
  }, [currentSearch, token])

  return (
    <>
      <section className="page-header">
        <div>
          <h1>Biblioteca de materiais</h1>
          <p>
            {currentSearch
              ? `Mostrando materiais relacionados a "${currentSearch}".`
              : 'Materiais organizados fora do feed para facilitar busca, reuso e curadoria.'}
          </p>
        </div>

        <Link to="/" className="primary-button">
          Nova partilha
        </Link>
      </section>

      {error ? <div className="empty-card status-message error">{error}</div> : null}
      {isLoading ? <div className="empty-card">Carregando biblioteca...</div> : null}
      {!isLoading && materials.length === 0 ? (
        <div className="empty-card">
          <h2>Biblioteca vazia por enquanto</h2>
          <p>
            {currentSearch
              ? 'Nenhum material combinou com essa busca.'
              : 'Assim que você publicar partilhas com anexos, elas aparecerão organizadas aqui.'}
          </p>
        </div>
      ) : null}

      <section className="library-grid">
        {materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </section>
    </>
  )
}
