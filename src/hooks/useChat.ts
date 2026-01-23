'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  userId: string
  content: string
  createdAt: string
  user: {
    id: string
    displayName: string
  }
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
}

interface ChatActions {
  sendMessage: (content: string) => Promise<boolean>
  loadMore: () => Promise<void>
  clearError: () => void
}

// Database row type from Supabase realtime
interface ChatMessageRow {
  id: string
  userId: string
  content: string
  createdAt: string
}

export function useChat(): ChatState & ChatActions {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const userCacheRef = useRef<Map<string, { displayName: string }>>(new Map())

  // Fetch user info for a message
  const fetchUserInfo = useCallback(async (userId: string): Promise<{ displayName: string } | null> => {
    // Check cache first
    if (userCacheRef.current.has(userId)) {
      return userCacheRef.current.get(userId) || null
    }

    try {
      // Fetch from API to get display name
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        const userInfo = { displayName: data.user.displayName }
        userCacheRef.current.set(userId, userInfo)
        return userInfo
      }
    } catch {
      // Fallback to unknown user
    }

    return { displayName: 'Unknown User' }
  }, [])

  // Load initial messages
  const loadMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat')
      if (!response.ok) {
        throw new Error('Failed to load messages')
      }

      const data = await response.json()
      setMessages(data.messages)
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)

      // Cache all user info
      data.messages.forEach((msg: ChatMessage) => {
        userCacheRef.current.set(msg.userId, { displayName: msg.user.displayName })
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoading) return

    try {
      const response = await fetch(`/api/chat?cursor=${nextCursor}`)
      if (!response.ok) {
        throw new Error('Failed to load more messages')
      }

      const data = await response.json()

      // Prepend older messages (they come in newest-first order from API)
      setMessages(prev => [...data.messages.reverse(), ...prev])
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)

      // Cache user info
      data.messages.forEach((msg: ChatMessage) => {
        userCacheRef.current.set(msg.userId, { displayName: msg.user.displayName })
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more messages')
    }
  }, [hasMore, nextCursor, isLoading])

  // Send a new message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim()) return false

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      // Message will be added via realtime subscription
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      return false
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Set up Supabase Realtime subscription
  useEffect(() => {
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ChatMessage',
        },
        async (payload: RealtimePostgresInsertPayload<ChatMessageRow>) => {
          const newMessage = payload.new

          // Get user info for the new message
          const userInfo = await fetchUserInfo(newMessage.userId)

          const formattedMessage: ChatMessage = {
            id: newMessage.id,
            userId: newMessage.userId,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            user: {
              id: newMessage.userId,
              displayName: userInfo?.displayName || 'Unknown User',
            },
          }

          // Add message to the end (newest)
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === formattedMessage.id)) {
              return prev
            }
            return [...prev, formattedMessage]
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [loadMessages, fetchUserInfo])

  return {
    messages,
    isLoading,
    error,
    hasMore,
    sendMessage,
    loadMore,
    clearError,
  }
}
