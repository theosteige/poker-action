'use client'

import { format, isToday, isYesterday } from 'date-fns'

interface ChatMessageProps {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    displayName: string
  }
  isOwnMessage: boolean
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)

  if (isToday(date)) {
    return format(date, 'h:mm a')
  }

  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`
  }

  return format(date, 'MMM d, h:mm a')
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(userId: string): string {
  // Generate a consistent color based on user ID
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
  ]

  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export function ChatMessage({
  content,
  createdAt,
  user,
  isOwnMessage,
}: ChatMessageProps) {
  const avatarColor = getAvatarColor(user.id)
  const initials = getInitials(user.displayName)
  const timeStr = formatMessageTime(createdAt)

  return (
    <div
      className={`flex gap-3 py-2 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
        isOwnMessage ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}
      >
        <span className="text-white text-xs font-medium">{initials}</span>
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-medium text-sm ${
              isOwnMessage ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {user.displayName}
            {isOwnMessage && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-1">(you)</span>
            )}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">{timeStr}</span>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 break-words whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  )
}
