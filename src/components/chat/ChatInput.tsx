'use client'

import { useState, useCallback, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => Promise<boolean>
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isSending || disabled) return

    setIsSending(true)
    const success = await onSend(trimmedMessage)

    if (success) {
      setMessage('')
    }
    setIsSending(false)
  }, [message, onSend, isSending, disabled])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Send on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const characterCount = message.length
  const maxCharacters = 1000
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="border-t border-neutral-200 bg-white p-3 sm:p-4 safe-area-bottom">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
            enterKeyHint="send"
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
            className={`
              w-full px-3 sm:px-4 py-2.5 pr-14 sm:pr-16
              border rounded-xl
              text-base sm:text-sm text-neutral-900 placeholder-neutral-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-neutral-100 disabled:cursor-not-allowed
              resize-none
              ${isOverLimit ? 'border-red-500' : 'border-neutral-300'}
            `}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
          {/* Character count */}
          <span
            className={`absolute right-3 bottom-2.5 text-xs ${
              isOverLimit ? 'text-red-500' : 'text-neutral-400'
            }`}
          >
            {characterCount > 900 && `${characterCount}/${maxCharacters}`}
          </span>
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || isSending || !message.trim() || isOverLimit}
          aria-label="Send message"
          className={`
            px-3 sm:px-4 py-2.5
            rounded-xl font-medium text-sm
            transition-colors duration-200
            flex items-center justify-center
            min-w-[44px] min-h-[44px]
            ${
              disabled || isSending || !message.trim() || isOverLimit
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950'
            }
          `}
        >
          {isSending ? (
            <svg
              className="animate-spin h-5 w-5"
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
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="hidden sm:block text-xs text-neutral-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
