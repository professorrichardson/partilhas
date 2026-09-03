export interface UserProfile {
  avatarUrl: string | null
  bio: string | null
  institution: string | null
  area: string | null
}

export interface UserStats {
  postsCount: number
  communitiesCount: number
  favoritesCount: number
  likesReceived: number
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
  profile: UserProfile | null
  stats?: UserStats
}

export interface AuthResponse {
  token: string
  user: CurrentUser
}

export interface ApiTag {
  id: string
  name: string
  slug: string
}

export interface ApiFile {
  id: string
  originalName: string
  storedName: string
  filePath: string
  mimeType: string
  fileSize: number
}

export interface ApiComment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export interface ApiPost {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  scope: 'PUBLIC' | 'COMMUNITY'
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    role: string
    avatarUrl: string | null
    institution: string | null
    area: string | null
  }
  community: {
    id: string
    name: string
    slug: string
  } | null
  files: ApiFile[]
  tags: ApiTag[]
  comments: ApiComment[]
  metrics: {
    likes: number
    comments: number
    favorites: number
    reviewsCount: number
    averageRating: number | null
  }
  viewerContext: {
    isLiked: boolean
    isFavorited: boolean
    myRating: number | null
  }
}

export interface ApiReview {
  id: string
  rating: number
  comment: string | null
  classroom: string | null
  adaptations: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export interface ReviewsResponse {
  summary: {
    count: number
    average: number
  }
  items: ApiReview[]
}

export interface UpsertReviewPayload {
  rating: number
  comment?: string
  classroom?: string
  adaptations?: string
}

export interface ApiLessonPlan {
  id: string
  title: string
  grade: string
  subject: string
  objectives: string
  digitalTools: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    avatarUrl: string | null
    institution: string | null
  }
  community: {
    id: string
    name: string
    slug: string
  } | null
  files: ApiFile[]
  tags: ApiTag[]
}

export interface PaginatedLessonPlansResponse {
  items: ApiLessonPlan[]
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface CreateLessonPlanPayload {
  title: string
  grade: string
  subject: string
  objectives: string
  digitalTools: string
  content: string
  communityId?: string
  tags?: string
}

export interface ApiTutorialStep {
  id: string
  order: number
  title: string
  content: string
  videoUrl: string | null
}

export interface ApiTutorialSummary {
  id: string
  title: string
  description: string
  tool: string
  coverImageUrl: string | null
  createdAt: string
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
  stepsCount: number
  completionsCount: number
}

export interface ApiTutorialDetail {
  id: string
  title: string
  description: string
  tool: string
  coverImageUrl: string | null
  createdAt: string
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
  steps: ApiTutorialStep[]
  completionsCount: number
  viewerContext: {
    completedStepIds: string[]
    isCompleted: boolean
    certificateId: string | null
  }
}

export interface PaginatedTutorialsResponse {
  items: ApiTutorialSummary[]
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface CreateTutorialStepPayload {
  title: string
  content: string
  videoUrl?: string
}

export interface CreateTutorialPayload {
  title: string
  description: string
  tool: string
  coverImageUrl?: string
  steps: CreateTutorialStepPayload[]
}

export interface ApiCertificate {
  id: string
  code: string
  issuedAt: string
  tutorial: {
    id: string
    title: string
    tool: string
  }
}

export interface PaginatedPostsResponse {
  items: ApiPost[]
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface ApiCommunity {
  id: string
  name: string
  slug: string
  description: string
  coverImageUrl: string | null
  createdAt: string
  creator: {
    id: string
    name: string
  }
  metrics: {
    members: number
    posts: number
  }
}

export interface ApiCommunityDetail extends ApiCommunity {
  posts: ApiPost[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export interface CreateCommunityPayload {
  name: string
  description: string
  coverImageUrl?: string
}

export interface UpdateProfilePayload {
  name?: string
  bio?: string
  institution?: string
  area?: string
  avatarUrl?: string
}
