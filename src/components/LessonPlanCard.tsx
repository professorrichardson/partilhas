import { GraduationCap, Layers, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getRichTextExcerpt } from '../lib/richText'
import type { ApiLessonPlan } from '../types/api'

interface LessonPlanCardProps {
  lessonPlan: ApiLessonPlan
}

export function LessonPlanCard({ lessonPlan }: LessonPlanCardProps) {
  return (
    <article className="library-card">
      <span className="eyebrow">
        <GraduationCap size={16} />
        {lessonPlan.grade} • {lessonPlan.subject}
      </span>

      <h3>{lessonPlan.title}</h3>
      <p>{getRichTextExcerpt(lessonPlan.objectives, 160)}</p>

      <div className="material-meta">
        <span className="metric">
          <Layers size={14} />
          {lessonPlan.digitalTools}
        </span>
      </div>

      {lessonPlan.tags.length > 0 ? (
        <div className="tag-row">
          {lessonPlan.tags.map((tag) => (
            <span key={tag.id} className="tag">
              <Tag size={14} />
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="material-meta">
        <span className="metric">Autor: {lessonPlan.author.name}</span>
        <span className="metric">
          Comunidade: {lessonPlan.community?.name || 'Aberto a todos'}
        </span>
      </div>

      <div className="button-row">
        <Link to={`/planos-de-aula/${lessonPlan.id}`} className="secondary-button">
          Ver plano completo
        </Link>
      </div>
    </article>
  )
}
