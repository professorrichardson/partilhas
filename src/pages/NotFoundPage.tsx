import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="empty-card not-found">
      <h1>Página não encontrada</h1>
      <p>A rota que você tentou abrir ainda não foi criada nesta base do projeto.</p>
      <div className="button-row" style={{ justifyContent: 'center' }}>
        <Link to="/" className="primary-button">
          Voltar para o início
        </Link>
      </div>
    </section>
  )
}
