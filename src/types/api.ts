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
  }
  viewerContext: {
    isLiked: boolean
    isFavorited: boolean
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
