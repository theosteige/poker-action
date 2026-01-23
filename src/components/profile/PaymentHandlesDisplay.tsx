'use client'

import type { PaymentHandle, PaymentHandleType } from '@/lib/validations/payment-handles'

interface PaymentHandlesDisplayProps {
  handles: PaymentHandle[]
  displayName?: string
  compact?: boolean
}

const HANDLE_TYPE_LABELS: Record<PaymentHandleType, string> = {
  venmo: 'Venmo',
  zelle: 'Zelle',
  cash: 'Cash Only',
}

const HANDLE_TYPE_ICONS: Record<PaymentHandleType, string> = {
  venmo: 'V',
  zelle: 'Z',
  cash: '$',
}

const HANDLE_TYPE_COLORS: Record<PaymentHandleType, string> = {
  venmo: 'bg-blue-100 text-blue-800',
  zelle: 'bg-purple-100 text-purple-800',
  cash: 'bg-green-100 text-green-800',
}

export function PaymentHandlesDisplay({
  handles,
  displayName,
  compact = false,
}: PaymentHandlesDisplayProps) {
  if (handles.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        {displayName ? `${displayName} has no payment handles set up` : 'No payment handles'}
      </p>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {handles.map((handle, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${HANDLE_TYPE_COLORS[handle.type]}`}
            title={`${HANDLE_TYPE_LABELS[handle.type]}: ${handle.handle}`}
          >
            {HANDLE_TYPE_ICONS[handle.type]}
            {handle.handle && ` ${handle.handle}`}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayName && (
        <p className="text-sm font-medium text-gray-700">{displayName}&apos;s Payment Methods</p>
      )}
      <ul className="space-y-1">
        {handles.map((handle, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${HANDLE_TYPE_COLORS[handle.type]}`}
            >
              {HANDLE_TYPE_ICONS[handle.type]}
            </span>
            <span className="text-gray-600">{HANDLE_TYPE_LABELS[handle.type]}:</span>
            <span className="text-gray-900 font-medium">
              {handle.handle || '(no handle)'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
