'use client'

import { Card } from '@/components/ui'
import { formatCurrency, type Debt, type PaymentHandle } from '@/lib/settlement'

interface LedgerProps {
  debts: Debt[]
  isComplete: boolean
  totalInPlay: number
  hostId: string
}

function PaymentHandleLink({ handle }: { handle: PaymentHandle }) {
  const getHandleDisplay = () => {
    switch (handle.type) {
      case 'venmo':
        return {
          label: 'Venmo',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-5.25 12.75h-3l-1.5-7.5h2.625l.75 4.875 2.25-4.875h2.625l-3.75 7.5z" />
            </svg>
          ),
          className: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50',
        }
      case 'zelle':
        return {
          label: 'Zelle',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          ),
          className: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50',
        }
      case 'cash':
        return {
          label: 'Cash',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          className: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50',
        }
      default:
        return {
          label: handle.type,
          icon: null,
          className: 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700',
        }
    }
  }

  const { label, icon, className } = getHandleDisplay()

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${className} transition-colors`}
    >
      {icon}
      <span>
        {label}: {handle.handle}
      </span>
    </span>
  )
}

export function Ledger({ debts, isComplete, totalInPlay, hostId }: LedgerProps) {
  const hasDebts = debts.length > 0

  // Separate debts into "owed to bank" and "bank owes"
  const owedToBank = debts.filter((d) => d.toPlayerId === hostId)
  const bankOwes = debts.filter((d) => d.fromPlayerId === hostId)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Settlement</h2>
        {isComplete ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            Game Complete
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
            In Progress
          </span>
        )}
      </div>

      {!hasDebts ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {totalInPlay === 0
              ? 'No buy-ins recorded yet'
              : 'All settlements balanced'}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            Settlement details will appear here as the game progresses
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Players who owe the bank */}
          {owedToBank.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Owed to Bank
              </h3>
              <div className="space-y-3">
                {owedToBank.map((debt) => (
                  <DebtCard key={debt.fromPlayerId} debt={debt} direction="to-bank" />
                ))}
              </div>
            </div>
          )}

          {/* What bank owes players */}
          {bankOwes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Bank Owes
              </h3>
              <div className="space-y-3">
                {bankOwes.map((debt) => (
                  <DebtCard key={debt.toPlayerId} debt={debt} direction="from-bank" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {totalInPlay > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Total in pot:</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totalInPlay)}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}

interface DebtCardProps {
  debt: Debt
  direction: 'to-bank' | 'from-bank'
}

function DebtCard({ debt, direction }: DebtCardProps) {
  const isToBank = direction === 'to-bank'

  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {(isToBank ? debt.fromDisplayName : debt.toDisplayName)
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {isToBank ? debt.fromDisplayName : debt.toDisplayName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isToBank ? 'owes bank' : 'receives from bank'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-semibold ${
              isToBank ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}
          >
            {formatCurrency(debt.amount)}
          </p>
        </div>
      </div>

      {/* Payment handles */}
      {debt.toPaymentHandles.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Payment options:</p>
          <div className="flex flex-wrap gap-2">
            {debt.toPaymentHandles.map((handle, index) => (
              <PaymentHandleLink key={index} handle={handle} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
