import { appConfig } from './env'

interface SharePostParams {
  postId: string
  title: string
  text?: string
}

function buildPostUrl(postId: string) {
  return `${appConfig.appUrl}/partilhas/${postId}`
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export async function sharePost({
  postId,
  title,
  text,
}: SharePostParams) {
  const url = buildPostUrl(postId)

  const shareData = {
    title,
    text: text || title,
    url,
  }

  try {
    // Mobile → abre compartilhamento nativo
    if (navigator.share && isMobileDevice()) {
      await navigator.share(shareData)

      return {
        success: true,
        method: 'native-share',
      }
    }

    // Desktop → copia link
    await navigator.clipboard.writeText(url)

    return {
      success: true,
      method: 'clipboard',
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error)

    return {
      success: false,
      method: 'error',
    }
  }
}

