import { appConfig } from './env'
import type {
  ApiCertificate,
  ApiCommunity,
  ApiCommunityDetail,
  ApiLessonPlan,
  ApiPost,
  ApiTutorialDetail,
  AuthResponse,
  CreateCommunityPayload,
  CreateTutorialPayload,
  CurrentUser,
  LoginPayload,
  PaginatedLessonPlansResponse,
  PaginatedPostsResponse,
  PaginatedTutorialsResponse,
  RegisterPayload,
  ReviewsResponse,
  UpdateProfilePayload,
  UpsertReviewPayload,
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

export function getPostReviews(postId: string) {
  return apiRequest<ReviewsResponse>(`/reviews/posts/${postId}`)
}

export function upsertPostReview(token: string, postId: string, payload: UpsertReviewPayload) {
  return apiRequest<ReviewsResponse['items'][number]>(`/reviews/posts/${postId}`, {
    method: 'POST',
    token,
    body: payload,
  })
}

export function removePostReview(token: string, postId: string) {
  return apiRequest<{ message: string }>(`/reviews/posts/${postId}`, {
    method: 'DELETE',
    token,
  })
}

export function getLessonPlans(params: Record<string, string | undefined> = {}) {
  return apiRequest<PaginatedLessonPlansResponse>(`/lesson-plans${buildQuery(params)}`)
}

export function getLessonPlanById(lessonPlanId: string) {
  return apiRequest<ApiLessonPlan>(`/lesson-plans/${lessonPlanId}`)
}

export function createLessonPlan(token: string, formData: FormData) {
  return apiRequest<ApiLessonPlan>('/lesson-plans', {
    method: 'POST',
    token,
    body: formData,
  })
}

export function getTutorials(params: Record<string, string | undefined> = {}) {
  return apiRequest<PaginatedTutorialsResponse>(`/tutorials${buildQuery(params)}`)
}

export function getTutorialById(tutorialId: string, token?: string | null) {
  return apiRequest<ApiTutorialDetail>(`/tutorials/${tutorialId}`, { token })
}

export function createTutorial(token: string, payload: CreateTutorialPayload) {
  return apiRequest<ApiTutorialDetail>('/tutorials', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function markTutorialStepComplete(token: string, tutorialId: string, stepId: string) {
  return apiRequest<ApiTutorialDetail>(`/tutorials/${tutorialId}/steps/${stepId}/complete`, {
    method: 'POST',
    token,
  })
}

export function unmarkTutorialStepComplete(token: string, tutorialId: string, stepId: string) {
  return apiRequest<ApiTutorialDetail>(`/tutorials/${tutorialId}/steps/${stepId}/complete`, {
    method: 'DELETE',
    token,
  })
}

export function getMyCertificates(token: string) {
  return apiRequest<ApiCertificate[]>('/certificates', { token })
}

export async function openCertificatePdf(token: string, certificateId: string) {
  const response = await fetch(`${appConfig.apiUrl}/certificates/${certificateId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new ApiError('Não foi possível gerar o certificado agora.', response.status)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
}
