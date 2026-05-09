import { FolderOpen, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { countMaterials, describeMaterialTypes } from '../lib/post'
import { getRichTextExcerpt } from '../lib/richText'
import type { ApiPost } from '../types/api'

interface MaterialCardProps {
  material: ApiPost
}

export function MaterialCard({ material }: MaterialCardProps) {
  const materialItems = describeMaterialTypes(material).slice(0, 3)

  return (
    <article className="library-card">
      <span className="eyebrow">
        <FolderOpen size={16} />
        {countMaterials(material)} materiais
      </span>

      <h3>{material.title}</h3>
      <p>{getRichTextExcerpt(material.content, 180)}</p>

      {material.tags.length > 0 ? (
        <div className="tag-row">
          {material.tags.map((tag) => (
            <span key={tag.id} className="tag">
              <Tag size={14} />
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="library-material-list">
        {materialItems.map((item) => (
          <span key={item} className="file-badge">
            {item}
          </span>
        ))}

        {describeMaterialTypes(material).length > materialItems.length ? (
          <span className="file-badge">
            +{describeMaterialTypes(material).length - materialItems.length} itens
          </span>
        ) : null}
      </div>

      <div className="material-meta">
        <span className="metric">Autor: {material.author.name}</span>
        <span className="metric">
          Comunidade: {material.community?.name || 'Feed geral'}
        </span>
      </div>

      <div className="button-row">
        <Link to={`/biblioteca/${material.id}`} className="secondary-button">
          Abrir detalhes
        </Link>
      </div>
    </article>
  )
}
