// Toda URL crítica do frontend fica centralizada aqui para facilitar troca de ambiente.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

export const appConfig = {
  apiUrl,
  appUrl,
  assetUrl: apiUrl.replace(/\/api\/?$/, ''),
}
