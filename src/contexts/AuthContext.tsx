import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { getMyProfile, login, register } from '../lib/api'
import { clearStoredToken, getStoredToken, setStoredToken } from '../lib/storage'
import type { CurrentUser, LoginPayload, RegisterPayload } from '../types/api'

interface AuthContextValue {
  token: string | null
  user: CurrentUser | null
  isBootstrapping: boolean
  loginUser: (payload: LoginPayload) => Promise<void>
  registerUser: (payload: RegisterPayload) => Promise<void>
  logoutUser: () => void
  refreshUser: () => Promise<CurrentUser | null>
  replaceUser: (user: CurrentUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const savedToken = getStoredToken()

    if (!savedToken) {
      setIsBootstrapping(false)
      return
    }

    setToken(savedToken)

    getMyProfile(savedToken)
      .then((profile) => {
        startTransition(() => {
          setUser(profile)
        })
      })
      .catch(() => {
        clearStoredToken()
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setIsBootstrapping(false)
      })
  }, [])

  useEffect(() => {
    if (!token || !user || user.stats) {
      return
    }

    // Quando o usuário já estava logado antes de uma mudança no payload,
    // buscamos o perfil completo para manter topo e métricas sincronizados.
    getMyProfile(token)
      .then((profile) => {
        startTransition(() => {
          setUser(profile)
        })
      })
      .catch(() => {
        clearStoredToken()
        setToken(null)
        setUser(null)
      })
  }, [token, user])

  async function loginUser(payload: LoginPayload) {
    const result = await login(payload)
    setStoredToken(result.token)
    setToken(result.token)
    setUser(result.user)
  }

  async function registerUser(payload: RegisterPayload) {
    const result = await register(payload)
    setStoredToken(result.token)
    setToken(result.token)
    setUser(result.user)
  }

  function logoutUser() {
    clearStoredToken()
    setToken(null)
    setUser(null)
  }

  async function refreshUser() {
    if (!token) {
      return null
    }

    const profile = await getMyProfile(token)
    setUser(profile)
    return profile
  }

  function replaceUser(nextUser: CurrentUser) {
    setUser(nextUser)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isBootstrapping,
      loginUser,
      registerUser,
      logoutUser,
      refreshUser,
      replaceUser,
    }),
    [token, user, isBootstrapping],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
