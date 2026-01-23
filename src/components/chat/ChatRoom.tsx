'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useChat } from '@/hooks/useChat'
import { useAuthContext } from '@/contexts/AuthContext'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

export function ChatRoom() {
  const { user } = useAuthContext()
  const {
    messages,
    isLoading,
    error,
    hasMore,
    sendMessage,
    loadMore,
    clearError,
  } = useChat()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const previousScrollHeightRef = useRef<number>(0)
  const isAtBottomRef = useRef(true)

  // Check if user is scrolled to bottom
  const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return true

    const threshold = 100 // pixels from bottom
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold

    isAtBottomRef.current = isAtBottom
    return isAtBottom
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  // Auto-scroll when new messages arrive (only if at bottom)
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // Maintain scroll position when loading older messages
  const handleLoadMore = useCallback(async () => {
    const container = messagesContainerRef.current
    if (!container) return

    previousScrollHeightRef.current = container.scrollHeight
    await loadMore()

    // Restore scroll position after new messages are prepended
    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight
      const scrollDiff = newScrollHeight - previousScrollHeightRef.current
      container.scrollTop = scrollDiff
    })
  }, [loadMore])

  // Handle scroll for infinite scroll
  const handleScroll = useCallback(() => {
    checkIfAtBottom()

    const container = messagesContainerRef.current
    if (!container || isLoading || !hasMore) return

    // Load more when scrolled near top
    if (container.scrollTop < 100) {
      handleLoadMore()
    }
  }, [checkIfAtBottom, isLoading, hasMore, handleLoadMore])

  // Initial scroll to bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom('auto')
    }
  }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-50">
        <p className="text-neutral-500">Please log in to view chat</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-white px-4 py-3">
        <h2 className="text-lg font-semibold text-neutral-900">Community Chat</h2>
        <p className="text-sm text-neutral-500">
          Chat with other players in the community
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {/* Load More Indicator */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="text-sm text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-8 w-8 text-neutral-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-neutral-500">Loading messages...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">
                No messages yet
              </h3>
              <p className="text-sm text-neutral-500">
                Be the first to say something!
              </p>
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.length > 0 && (
          <div className="py-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                createdAt={message.createdAt}
                user={message.user}
                isOwnMessage={message.userId === user.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading && messages.length === 0}
      />
    </div>
  )
}
