import { Award } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getMyCertificates, openCertificatePdf } from '../lib/api'
import { formatAbsoluteDate } from '../lib/format'
import type { ApiCertificate } from '../types/api'

export function CertificatesPage() {
  const { token } = useAuth()
  const [certificates, setCertificates] = useState<ApiCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    getMyCertificates(token)
      .then((response) => {
        setCertificates(response)
      })
      .catch(() => {
        setError('Não foi possível carregar seus certificados agora.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [token])

  async function handleDownload(certificateId: string) {
    if (!token) {
      return
    }

    setDownloadingId(certificateId)

    try {
      await openCertificatePdf(token, certificateId)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <section className="page-header">
        <div>
          <h1>Meus certificados</h1>
          <p>Certificados de conclusão dos tutoriais que você já finalizou.</p>
        </div>
      </section>

      {error ? <div className="empty-card status-message error">{error}</div> : null}
      {isLoading ? <div className="empty-card">Carregando certificados...</div> : null}
      {!isLoading && certificates.length === 0 ? (
        <div className="empty-card">
          <h2>Nenhum certificado ainda</h2>
          <p>Conclua todas as etapas de um tutorial para ganhar seu primeiro certificado.</p>
        </div>
      ) : null}

      <section className="stats-grid">
        {certificates.map((certificate) => (
          <article key={certificate.id} className="stats-card">
            <span className="eyebrow">
              <Award size={16} />
              {certificate.tutorial.tool}
            </span>
            <h3 style={{ fontSize: '1.1rem' }}>{certificate.tutorial.title}</h3>
            <p>Emitido em {formatAbsoluteDate(certificate.issuedAt)}</p>
            <p className="muted">Código: {certificate.code}</p>
            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleDownload(certificate.id)}
                disabled={downloadingId === certificate.id}
              >
                {downloadingId === certificate.id ? 'Gerando...' : 'Baixar PDF'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
