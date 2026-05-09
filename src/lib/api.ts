import { appConfig } from './env'
import type {
  ApiCommunity,
  ApiCommunityDetail,
  ApiPost,
  AuthResponse,
  CreateCommunityPayload,
  CurrentUser,
  LoginPayload,
  PaginatedPostsResponse,
  RegisterPayload,
  UpdateProfilePayload,
} from '../types/api'

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: BodyInit | object
  token?: string | null
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers()

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  let body: BodyInit | undefined

  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const response = await fetch(`${appConfig.apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'Falha ao comunicar com a API.', response.status, payload?.details)
  }

  return payload as T
}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value)
    }
  })

  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function getMyProfile(token: string) {
  return apiRequest<CurrentUser>('/auth/me', { token })
}

export function updateMyProfile(token: string, payload: UpdateProfilePayload) {
  return apiRequest<CurrentUser>('/users/me', {
    method: 'PATCH',
    token,
    body: payload,
  })
}

export function getPosts(token: string, params: Record<string, string | undefined> = {}) {
  return apiRequest<PaginatedPostsResponse>(`/posts${buildQuery(params)}`, { token })
}

export function getPostById(postId: string, token?: string | null) {
  return apiRequest<ApiPost>(`/posts/${postId}`, { token })
}

export function createPost(token: string, formData: FormData) {
  return apiRequest<ApiPost>('/posts', {
    method: 'POST',
    token,
    body: formData,
  })
}

export function addCommentToPost(token: string, postId: string, content: string) {
  return apiRequest<ApiPost>(`/posts/${postId}/comments`, {
    method: 'POST',
    token,
    body: { content },
  })
}

export function addLikeToPost(token: string, postId: string) {
  return apiRequest<ApiPost>(`/posts/${postId}/likes`, {
    method: 'POST',
    token,
  })
}

export function removeLikeFromPost(token: string, postId: string) {
  return apiRequest<ApiPost>(`/posts/${postId}/likes`, {
    method: 'DELETE',
    token,
  })
}

export function getCommunities() {
  return apiRequest<ApiCommunity[]>('/communities')
}

export function getCommunityByIdentifier(identifier: string, token?: string | null) {
  return apiRequest<ApiCommunityDetail>(`/communities/${identifier}`, { token })
}

export function createCommunity(token: string, payload: CreateCommunityPayload) {
  return apiRequest<ApiCommunity>('/communities', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function getLibraryMaterials(token: string, params: Record<string, string | undefined> = {}) {
  return apiRequest<ApiPost[]>(`/library${buildQuery(params)}`, { token })
}

export function getFavorites(token: string) {
  return apiRequest<ApiPost[]>('/favorites', { token })
}

export function addFavorite(token: string, postId: string) {
  return apiRequest<ApiPost>(`/favorites/${postId}`, {
    method: 'POST',
    token,
  })
}

export function removeFavorite(token: string, postId: string) {
  return apiRequest<ApiPost>(`/favorites/${postId}`, {
    method: 'DELETE',
    token,
  })
}
