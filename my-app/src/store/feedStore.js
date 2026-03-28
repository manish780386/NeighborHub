import { create } from 'zustand'

export const useFeedStore = create((set, get) => ({
  posts:      [],
  loading:    false,
  hasMore:    true,
  cursor:     null,
  filter:     'all',   // all | help | lost | event | sale | alert
  radius:     2,

  setPosts:   (posts)   => set({ posts }),
  appendPosts:(posts)   => set(s => ({ posts: [...s.posts, ...posts] })),
  setLoading: (v)       => set({ loading: v }),
  setHasMore: (v)       => set({ hasMore: v }),
  setCursor:  (v)       => set({ cursor: v }),
  setFilter:  (filter)  => set({ filter, posts: [], cursor: null, hasMore: true }),
  setRadius:  (radius)  => set({ radius, posts: [], cursor: null, hasMore: true }),

  addPost:    (post)    => set(s => ({ posts: [post, ...s.posts] })),
  removePost: (id)      => set(s => ({ posts: s.posts.filter(p => p.id !== id) })),
  toggleUpvote: (id, userId) =>
    set(s => ({
      posts: s.posts.map(p =>
        p.id === id
          ? {
              ...p,
              upvotes_count: p.upvotes_count + (p.is_upvoted ? -1 : 1),
              is_upvoted: !p.is_upvoted,
            }
          : p
      ),
    })),
}))