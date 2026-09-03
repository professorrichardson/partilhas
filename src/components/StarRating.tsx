import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: number
}

export function StarRating({ value, onChange, size = 18 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]
  const isInteractive = Boolean(onChange)

  return (
    <div className={`star-rating ${isInteractive ? 'interactive' : ''}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star-rating-item ${star <= Math.round(value) ? 'filled' : ''}`}
          onClick={isInteractive ? () => onChange?.(star) : undefined}
          disabled={!isInteractive}
          aria-label={`${star} de 5 estrelas`}
        >
          <Star size={size} />
        </button>
      ))}
    </div>
  )
}
