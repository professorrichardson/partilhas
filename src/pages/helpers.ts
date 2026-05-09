import type { ApiPost } from '../types/api'

export function replacePostInCollection(posts: ApiPost[], updatedPost: ApiPost) {
  return posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
}
