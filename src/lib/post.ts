import { appConfig } from './env'
import type { ApiFile, ApiPost } from '../types/api'

export function getAssetUrl(filePath: string) {
  return `${appConfig.assetUrl}${filePath}`
}

export function getYoutubeEmbedUrl(url: string | null) {
  if (!url) {
    return null
  }

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    const id = parsed.searchParams.get('v')
    return id ? `https://www.youtube.com/embed/${id}` : null
  } catch {
    return null
  }
}

export function getImageFiles(post: ApiPost) {
  return post.files.filter((file) => file.mimeType?.startsWith('image/'))
}

export function getNonImageFiles(post: ApiPost) {
  return post.files.filter((file) => !file.mimeType?.startsWith('image/'))
}

export function describeMaterialTypes(post: ApiPost) {
  const items = post.files.map((file) => file.originalName)

  if (post.youtubeUrl) {
    items.push('Link do YouTube')
  }

  return items
}

export function countMaterials(post: ApiPost) {
  return post.files.length + (post.youtubeUrl ? 1 : 0)
}

export function fileIsImage(file: ApiFile) {
  return file.mimeType?.startsWith('image/')
}
