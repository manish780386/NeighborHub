import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { getInitials, timeAgo } from '../lib/utils'
import { ArrowLeft, Send, Loader2, SmilePlus } from 'lucide-react'
import api from '../lib/api'

export default function ChatRoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user, accessToken } = useAuthStore()
  const { messages, setMessages, connectSocket, disconnectSocket, sendMessage, sendTyping, typing } = useChatStore()
  const [room, setRoom] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()
  const typingTimer = useRef()

  useEffect(() => {
    const init = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([
          api.get(`/chat/rooms/${roomId}/`),
          api.get(`/chat/rooms/${roomId}/messages/`),
        ])
        setRoom(roomRes.data)
        setMessages(roomId, (msgRes.data.results || msgRes.data).reverse())
      } catch {
        navigate('/chat')
      } finally {
        setLoading(false)
      }
    }
    init()
    connectSocket(roomId, accessToken)
    return () => disconnectSocket()
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[roomId]])

  const getRoomName = () => {
    if (!room) return '...'
    if (room.is_group) return room.name
    const other = room.members?.find(m => m.id !== user?.id)
    return other ? `${other.first_name} ${other.last_name}` : 'Chat'
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    sendMessage(text)
    setTimeout(() => setSending(false), 300)
  }

  const handleTyping = (e) => {
    setInput(e.target.value)
    sendTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => sendTyping(false), 1500)
  }

  const roomMessages = messages[roomId] || []
  const isTyping = (typing[roomId] || []).filter(id => id !== user?.id).length > 0

  const groupedMessages = roomMessages.reduce((acc, msg, i) => {
    const prev = roomMessages[i - 1]
    const showAvatar = !prev || prev.sender_id !== msg.sender_id
    acc.push({ ...msg, showAvatar })
    return acc
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={22} className="animate-spin text-surface-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-surface-200 mb-0">
        <button onClick={() => navigate('/chat')} className="p-2 rounded-xl hover:bg-surface-100 text-surface-500">
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {getInitials(getRoomName())}
        </div>
        <div>
          <p className="text-sm font-medium text-surface-900">{getRoomName()}</p>
          <p className="text-xs text-surface-400">
            {isTyping ? 'typing...' : room?.is_group ? `${room.members?.length} members` : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 pr-1">
        {groupedMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <SmilePlus size={22} className="text-surface-400" />
              </div>
              <p className="text-surface-500 text-sm">No messages yet</p>
              <p className="text-surface-400 text-xs mt-0.5">Say hi!</p>
            </div>
          </div>
        )}

        {groupedMessages.map((msg) => {
          const isMine = msg.sender_id === user?.id
          return (
            <div
              key={msg.message_id || msg.id}
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
            >
              {!isMine && (
                <div className={`w-6 h-6 rounded-lg bg-surface-200 flex items-center justify-center text-[10px] font-semibold text-surface-600 flex-shrink-0 ${msg.showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                  {getInitials(msg.sender_name || '?')}
                </div>
              )}
              <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMine && msg.showAvatar && (
                  <span className="text-xs text-surface-400 ml-1">{msg.sender_name}</span>
                )}
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-surface-900 text-white rounded-br-md'
                    : 'bg-white border border-surface-100 text-surface-800 rounded-bl-md shadow-soft'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-surface-400 mx-1">
                  {msg.timestamp ? timeAgo(msg.timestamp) : ''}
                </span>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-lg bg-surface-200 flex-shrink-0" />
            <div className="bg-white border border-surface-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
              <div className="flex gap-1 items-center h-4">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-pulse-soft"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="pt-3 border-t border-surface-200">
        <div className="flex items-center gap-2">
          <input
            className="input-base flex-1"
            placeholder="Type a message..."
            value={input}
            onChange={handleTyping}
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-surface-900 text-white rounded-xl flex items-center justify-center hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  )
}