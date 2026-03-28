import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  rooms:      [],
  activeRoom: null,
  messages:   {},
  socket:     null,
  typing:     {},

  setRooms:      (rooms)     => set({ rooms }),
  setActiveRoom: (room)      => set({ activeRoom: room }),

  setMessages: (roomId, msgs) =>
    set(s => ({ messages: { ...s.messages, [roomId]: msgs } })),

  addMessage: (roomId, msg) =>
    set(s => ({
      messages: {
        ...s.messages,
        [roomId]: [...(s.messages[roomId] || []), msg],
      },
      rooms: s.rooms.map(r =>
        r.id === roomId ? { ...r, last_message: msg } : r
      ),
    })),

  setTyping: (roomId, userId, isTyping) =>
    set(s => ({
      typing: {
        ...s.typing,
        [roomId]: isTyping
          ? [...(s.typing[roomId] || []).filter(id => id !== userId), userId]
          : (s.typing[roomId] || []).filter(id => id !== userId),
      },
    })),

  connectSocket: (roomId, token) => {
    const existing = get().socket
    if (existing) existing.close()

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/chat/${roomId}/?token=${token}`
    )

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'chat_message') get().addMessage(roomId, data)
      if (data.type === 'typing')       get().setTyping(roomId, data.user_id, data.is_typing)
    }

    ws.onclose = () => set({ socket: null })
    set({ socket: ws })
  },

  sendMessage: (content) => {
    const { socket } = get()
    if (socket?.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify({ type: 'chat_message', content }))
  },

  sendTyping: (isTyping) => {
    const { socket } = get()
    if (socket?.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify({ type: 'typing', is_typing: isTyping }))
  },

  disconnectSocket: () => {
    get().socket?.close()
    set({ socket: null })
  },
}))