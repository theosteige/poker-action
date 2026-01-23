'use client'

import { ChatRoom } from '@/components/chat'

export default function ChatPage() {
  return (
    // Use dvh (dynamic viewport height) for mobile browsers where the URL bar hides
    // Fall back to vh for browsers that don't support dvh
    <div className="h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-3.5rem)] -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
      <ChatRoom />
    </div>
  )
}
