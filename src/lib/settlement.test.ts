import { describe, it, expect } from 'vitest'
import {
  calculatePlayerSettlement,
  calculateGameSettlement,
  formatCurrency,
  formatNetAmount,
  type PlayerGameData,
} from './settlement'

describe('calculatePlayerSettlement', () => {
  it('should calculate basic settlement for a winning player who paid all buy-ins', () => {
    const player: PlayerGameData = {
      playerId: 'player1',
      displayName: 'Alice',
      paymentHandles: [{ type: 'venmo', handle: '@alice' }],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
      ],
      cashOut: { amount: 150 },
    }

    const result = calculatePlayerSettlement(player)

    expect(result.playerId).toBe('player1')
    expect(result.displayName).toBe('Alice')
    expect(result.totalBuyIns).toBe(100)
    expect(result.unpaidBuyIns).toBe(0)
    expect(result.cashOut).toBe(150)
    expect(result.netChips).toBe(50) // Won 50
    expect(result.settlement).toBe(150) // Bank owes 150 (cash-out - unpaid = 150 - 0)
    expect(result.hasCashedOut).toBe(true)
  })

  it('should calculate settlement for a losing player who paid all buy-ins', () => {
    const player: PlayerGameData = {
      playerId: 'player2',
      displayName: 'Bob',
      paymentHandles: [],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
      ],
      cashOut: { amount: 50 },
    }

    const result = calculatePlayerSettlement(player)

    expect(result.netChips).toBe(-50) // Lost 50
    expect(result.settlement).toBe(50) // Bank owes 50 (player paid 100, cashes out 50)
  })

  it('should calculate settlement for a player with unpaid buy-ins', () => {
    const player: PlayerGameData = {
      playerId: 'player3',
      displayName: 'Charlie',
      paymentHandles: [],
      buyIns: [
        { amount: 100, paidToBank: false, approved: true }, // Didn't pay yet
      ],
      cashOut: { amount: 80 },
    }

    const result = calculatePlayerSettlement(player)

    expect(result.totalBuyIns).toBe(100)
    expect(result.unpaidBuyIns).toBe(100)
    expect(result.cashOut).toBe(80)
    expect(result.netChips).toBe(-20) // Lost 20 in chips
    // settlement = cashOut - unpaidBuyIns = 80 - 100 = -20
    // Negative means player owes bank 20
    expect(result.settlement).toBe(-20)
  })

  it('should calculate settlement with mixed paid/unpaid buy-ins', () => {
    const player: PlayerGameData = {
      playerId: 'player4',
      displayName: 'Diana',
      paymentHandles: [],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
        { amount: 50, paidToBank: false, approved: true }, // Second buy-in not paid
      ],
      cashOut: { amount: 200 },
    }

    const result = calculatePlayerSettlement(player)

    expect(result.totalBuyIns).toBe(150)
    expect(result.unpaidBuyIns).toBe(50)
    expect(result.cashOut).toBe(200)
    expect(result.netChips).toBe(50) // Won 50 in chips
    // settlement = cashOut - unpaidBuyIns = 200 - 50 = 150
    // Positive means bank owes player 150
    expect(result.settlement).toBe(150)
  })

  it('should handle player with no cash-out (still playing)', () => {
    const player: PlayerGameData = {
      playerId: 'player5',
      displayName: 'Eve',
      paymentHandles: [],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
      ],
      cashOut: null,
    }

    const result = calculatePlayerSettlement(player)

    expect(result.totalBuyIns).toBe(100)
    expect(result.cashOut).toBe(0)
    expect(result.netChips).toBe(-100)
    expect(result.settlement).toBe(0) // No settlement yet
    expect(result.hasCashedOut).toBe(false)
  })

  it('should ignore unapproved buy-ins', () => {
    const player: PlayerGameData = {
      playerId: 'player6',
      displayName: 'Frank',
      paymentHandles: [],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
        { amount: 50, paidToBank: false, approved: false }, // Pending, not approved
      ],
      cashOut: { amount: 120 },
    }

    const result = calculatePlayerSettlement(player)

    expect(result.totalBuyIns).toBe(100) // Only the approved one
    expect(result.unpaidBuyIns).toBe(0) // Unapproved doesn't count
    expect(result.netChips).toBe(20) // 120 - 100
    expect(result.settlement).toBe(120) // Bank owes 120
  })

  it('should handle player with no buy-ins', () => {
    const player: PlayerGameData = {
      playerId: 'player7',
      displayName: 'Grace',
      paymentHandles: [],
      buyIns: [],
      cashOut: null,
    }

    const result = calculatePlayerSettlement(player)

    expect(result.totalBuyIns).toBe(0)
    expect(result.unpaidBuyIns).toBe(0)
    expect(result.cashOut).toBe(0)
    expect(result.netChips).toBe(0)
    expect(result.settlement).toBe(0)
    expect(result.hasCashedOut).toBe(false)
  })

  it('should handle exact break-even scenario', () => {
    const player: PlayerGameData = {
      playerId: 'player8',
      displayName: 'Henry',
      paymentHandles: [],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
      ],
      cashOut: { amount: 100 },
    }

    const result = calculatePlayerSettlement(player)

    expect(result.netChips).toBe(0)
    expect(result.settlement).toBe(100) // Bank owes what they cashed out
  })

  it('should handle multiple buy-ins from same player', () => {
    const player: PlayerGameData = {
      playerId: 'player9',
      displayName: 'Ivy',
      paymentHandles: [
        { type: 'venmo', handle: '@ivy' },
        { type: 'zelle', handle: 'ivy@email.com' },
      ],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
        { amount: 100, paidToBank: true, approved: true },
        { amount: 100, paidToBank: true, approved: true },
      ],
      cashOut: { amount: 400 },
    }

    const result = calculatePlayerSettlement(player)

    expect(result.totalBuyIns).toBe(300)
    expect(result.netChips).toBe(100) // Won 100
    expect(result.settlement).toBe(400) // Bank owes 400
    expect(result.paymentHandles).toHaveLength(2)
  })
})

describe('calculateGameSettlement', () => {
  const hostId = 'host1'

  it('should calculate game settlement with all players paid and cashed out', () => {
    const players: PlayerGameData[] = [
      {
        playerId: hostId,
        displayName: 'Host',
        paymentHandles: [{ type: 'venmo', handle: '@host' }],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 80 },
      },
      {
        playerId: 'player1',
        displayName: 'Alice',
        paymentHandles: [{ type: 'zelle', handle: 'alice@email.com' }],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 120 },
      },
    ]

    const result = calculateGameSettlement(players, hostId)

    expect(result.isComplete).toBe(true)
    expect(result.totalInPlay).toBe(200)
    expect(result.players).toHaveLength(2)

    // Host doesn't have debts with themselves
    // Alice has positive settlement (120) - bank owes her
    expect(result.debts).toHaveLength(1)
    expect(result.debts[0].fromPlayerId).toBe(hostId) // Bank owes
    expect(result.debts[0].toPlayerId).toBe('player1')
    expect(result.debts[0].amount).toBe(120)
  })

  it('should calculate game settlement with unpaid buy-ins', () => {
    const players: PlayerGameData[] = [
      {
        playerId: hostId,
        displayName: 'Host',
        paymentHandles: [{ type: 'cash', handle: 'Cash only' }],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 150 },
      },
      {
        playerId: 'player1',
        displayName: 'Alice',
        paymentHandles: [{ type: 'venmo', handle: '@alice' }],
        buyIns: [{ amount: 100, paidToBank: false, approved: true }], // Didn't pay
        cashOut: { amount: 50 },
      },
    ]

    const result = calculateGameSettlement(players, hostId)

    expect(result.isComplete).toBe(true)

    // Alice: settlement = cashOut - unpaidBuyIns = 50 - 100 = -50
    // She owes bank 50
    const aliceDebt = result.debts.find(d => d.fromPlayerId === 'player1')
    expect(aliceDebt).toBeDefined()
    expect(aliceDebt!.amount).toBe(50)
    expect(aliceDebt!.toPlayerId).toBe(hostId)
    expect(aliceDebt!.toPaymentHandles[0].type).toBe('cash')
  })

  it('should identify incomplete game when not all players cashed out', () => {
    const players: PlayerGameData[] = [
      {
        playerId: hostId,
        displayName: 'Host',
        paymentHandles: [],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 100 },
      },
      {
        playerId: 'player1',
        displayName: 'Alice',
        paymentHandles: [],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: null, // Still playing
      },
    ]

    const result = calculateGameSettlement(players, hostId)

    expect(result.isComplete).toBe(false)
  })

  it('should handle complex multi-player scenario', () => {
    const players: PlayerGameData[] = [
      {
        playerId: hostId,
        displayName: 'Host',
        paymentHandles: [{ type: 'venmo', handle: '@host' }],
        buyIns: [{ amount: 200, paidToBank: true, approved: true }],
        cashOut: { amount: 100 }, // Lost 100
      },
      {
        playerId: 'player1',
        displayName: 'Alice',
        paymentHandles: [{ type: 'zelle', handle: 'alice@email.com' }],
        buyIns: [
          { amount: 100, paidToBank: true, approved: true },
          { amount: 100, paidToBank: false, approved: true }, // Second buy-in unpaid
        ],
        cashOut: { amount: 300 }, // Won 100 in chips
      },
      {
        playerId: 'player2',
        displayName: 'Bob',
        paymentHandles: [],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 0 }, // Lost everything
      },
    ]

    const result = calculateGameSettlement(players, hostId)

    expect(result.isComplete).toBe(true)
    expect(result.totalInPlay).toBe(500) // 200 + 200 + 100

    // Alice: settlement = 300 - 100 (unpaid) = 200, bank owes her 200
    const aliceSettlement = result.players.find(p => p.playerId === 'player1')
    expect(aliceSettlement!.settlement).toBe(200)

    // Bob: settlement = 0 - 0 = 0, already paid, cashed out 0
    const bobSettlement = result.players.find(p => p.playerId === 'player2')
    expect(bobSettlement!.settlement).toBe(0)

    // Debts: only Alice's positive settlement
    expect(result.debts).toHaveLength(1)
    expect(result.debts[0].fromPlayerId).toBe(hostId)
    expect(result.debts[0].toPlayerId).toBe('player1')
    expect(result.debts[0].amount).toBe(200)
  })

  it('should handle zero settlement (even)', () => {
    const players: PlayerGameData[] = [
      {
        playerId: hostId,
        displayName: 'Host',
        paymentHandles: [],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 100 },
      },
      {
        playerId: 'player1',
        displayName: 'Alice',
        paymentHandles: [],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 100 }, // Break even
      },
    ]

    const result = calculateGameSettlement(players, hostId)

    // Alice paid 100, cashes out 100, settlement = 100 - 0 = 100
    // Bank owes her 100
    expect(result.debts).toHaveLength(1)
    expect(result.debts[0].amount).toBe(100)
  })

  it('should handle empty game', () => {
    const result = calculateGameSettlement([], hostId)

    expect(result.isComplete).toBe(true)
    expect(result.totalInPlay).toBe(0)
    expect(result.debts).toHaveLength(0)
    expect(result.players).toHaveLength(0)
  })
})

describe('formatCurrency', () => {
  it('should format positive amounts correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00')
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
    expect(formatCurrency(0.5)).toBe('$0.50')
  })

  it('should format negative amounts correctly', () => {
    expect(formatCurrency(-100)).toBe('-$100.00')
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
  })

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('should handle large amounts', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })
})

describe('formatNetAmount', () => {
  it('should format positive amounts with plus sign', () => {
    const result = formatNetAmount(100)
    expect(result.text).toBe('+$100.00')
    expect(result.isPositive).toBe(true)
    expect(result.isNegative).toBe(false)
    expect(result.isZero).toBe(false)
  })

  it('should format negative amounts with minus sign', () => {
    const result = formatNetAmount(-100)
    expect(result.text).toBe('-$100.00')
    expect(result.isPositive).toBe(false)
    expect(result.isNegative).toBe(true)
    expect(result.isZero).toBe(false)
  })

  it('should format zero without sign', () => {
    const result = formatNetAmount(0)
    expect(result.text).toBe('$0.00')
    expect(result.isPositive).toBe(false)
    expect(result.isNegative).toBe(false)
    expect(result.isZero).toBe(true)
  })
})

describe('Edge Cases', () => {
  it('should handle very small amounts', () => {
    const player: PlayerGameData = {
      playerId: 'player1',
      displayName: 'Test',
      paymentHandles: [],
      buyIns: [{ amount: 0.01, paidToBank: true, approved: true }],
      cashOut: { amount: 0.02 },
    }

    const result = calculatePlayerSettlement(player)
    expect(result.netChips).toBeCloseTo(0.01)
    expect(result.settlement).toBeCloseTo(0.02)
  })

  it('should handle Decimal type amounts (from Prisma)', () => {
    // Simulate Prisma Decimal by using an object with toNumber method
    const mockDecimal = {
      toNumber: () => 100,
    }

    const player: PlayerGameData = {
      playerId: 'player1',
      displayName: 'Test',
      paymentHandles: [],
      buyIns: [{ amount: mockDecimal as any, paidToBank: true, approved: true }],
      cashOut: { amount: mockDecimal as any },
    }

    const result = calculatePlayerSettlement(player)
    expect(result.totalBuyIns).toBe(100)
    expect(result.cashOut).toBe(100)
    expect(result.netChips).toBe(0)
  })

  it('should handle player busting out completely (cash out = 0)', () => {
    const player: PlayerGameData = {
      playerId: 'player1',
      displayName: 'Bust',
      paymentHandles: [{ type: 'venmo', handle: '@bust' }],
      buyIns: [
        { amount: 100, paidToBank: true, approved: true },
        { amount: 100, paidToBank: true, approved: true },
      ],
      cashOut: { amount: 0 }, // Lost everything
    }

    const result = calculatePlayerSettlement(player)
    expect(result.totalBuyIns).toBe(200)
    expect(result.cashOut).toBe(0)
    expect(result.netChips).toBe(-200)
    expect(result.settlement).toBe(0) // No settlement needed, they paid and lost
  })

  it('should handle big winner scenario', () => {
    const players: PlayerGameData[] = [
      {
        playerId: 'host',
        displayName: 'Host',
        paymentHandles: [{ type: 'cash', handle: 'Cash' }],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 0 },
      },
      {
        playerId: 'loser1',
        displayName: 'Loser1',
        paymentHandles: [],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 0 },
      },
      {
        playerId: 'loser2',
        displayName: 'Loser2',
        paymentHandles: [],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 0 },
      },
      {
        playerId: 'winner',
        displayName: 'Winner',
        paymentHandles: [{ type: 'venmo', handle: '@winner' }],
        buyIns: [{ amount: 100, paidToBank: true, approved: true }],
        cashOut: { amount: 400 }, // Won everything
      },
    ]

    const result = calculateGameSettlement(players, 'host')

    expect(result.totalInPlay).toBe(400)
    expect(result.isComplete).toBe(true)

    // Winner's settlement = 400 - 0 = 400, bank owes them
    const winnerDebt = result.debts.find(d => d.toPlayerId === 'winner')
    expect(winnerDebt).toBeDefined()
    expect(winnerDebt!.amount).toBe(400)
  })
})
