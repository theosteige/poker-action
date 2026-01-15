import { useState } from 'react';
import type { Game } from '../types';
import { calculateSettlements, getTotalBuyIns, getPlayerBalance } from '../settlement';

interface LedgerProps {
  game: Game;
  onBack: () => void;
  onSettle: () => void;
  onReopen: () => void;
}

export function Ledger({ game, onBack, onSettle, onReopen }: LedgerProps) {
  const [copied, setCopied] = useState(false);
  const bankPlayer = game.players.find((p) => p.isBank);

  // Check if all players are cashed out
  const playersNotCashedOut = game.players.filter((p) => p.cashOut === null);
  const allCashedOut = playersNotCashedOut.length === 0;
  const cashedOutPlayers = game.players.filter((p) => p.cashOut !== null);

  // Only calculate settlements for cashed out players
  const settlements = calculateSettlements(cashedOutPlayers);

  // Sort players by balance (winners first), cashed out players first
  const sortedPlayers = [...game.players].sort((a, b) => {
    // Not cashed out goes to the bottom
    if (a.cashOut === null && b.cashOut !== null) return 1;
    if (a.cashOut !== null && b.cashOut === null) return -1;
    return getPlayerBalance(b) - getPlayerBalance(a);
  });

  // Calculate totals to check for discrepancy (only for cashed out players)
  const totalBuyIns = cashedOutPlayers.reduce((sum, p) => sum + getTotalBuyIns(p), 0);
  const totalCashOuts = cashedOutPlayers.reduce((sum, p) => sum + (p.cashOut ?? 0), 0);
  const discrepancy = totalCashOuts - totalBuyIns;
  const hasDiscrepancy = allCashedOut && Math.abs(discrepancy) > 0.01;

  const generateLedgerText = () => {
    const lines: string[] = [];
    const date = new Date(game.createdAt).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    lines.push(`Poker Game - ${date}`);
    if (!allCashedOut) {
      lines.push(`(Partial - ${playersNotCashedOut.length} player${playersNotCashedOut.length !== 1 ? 's' : ''} still playing)`);
    }
    lines.push('');

    // Results (only cashed out players)
    lines.push('Results:');
    cashedOutPlayers
      .sort((a, b) => getPlayerBalance(b) - getPlayerBalance(a))
      .forEach((player) => {
        const balance = getPlayerBalance(player);
        const sign = balance >= 0 ? '+' : '';
        const bankTag = player.isBank ? ' (Bank)' : '';
        lines.push(`  ${player.name}${bankTag}: ${sign}$${balance.toFixed(2)}`);
      });
    lines.push('');

    // Settlements
    if (settlements.length === 0) {
      lines.push('No payments needed - everyone broke even!');
    } else {
      lines.push('Payments:');
      settlements.forEach((s) => {
        lines.push(`  ${s.fromName} pays ${s.toName}: $${s.amount.toFixed(2)}`);
      });
    }

    // Bank payment info
    if (bankPlayer && (game.bankPaymentInfo.venmo || game.bankPaymentInfo.zelle)) {
      lines.push('');
      lines.push(`Pay ${bankPlayer.name} via:`);
      if (game.bankPaymentInfo.venmo) {
        lines.push(`  Venmo: ${game.bankPaymentInfo.venmo}`);
      }
      if (game.bankPaymentInfo.zelle) {
        lines.push(`  Zelle: ${game.bankPaymentInfo.zelle}`);
      }
    }

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = generateLedgerText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="ledger">
      <div className="game-header">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Game
        </button>
      </div>

      <div className="ledger-title-row">
        <h2 className="ledger-title">Game Ledger</h2>
        <button className={`btn btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {!allCashedOut && (
        <div className="ledger-partial-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="partial-content">
            <strong>Partial Ledger</strong>
            <span>
              {playersNotCashedOut.length} player{playersNotCashedOut.length !== 1 ? 's' : ''} still playing: {playersNotCashedOut.map((p) => p.name).join(', ')}
            </span>
          </div>
        </div>
      )}

      {hasDiscrepancy && (
        <div className="ledger-discrepancy-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div className="discrepancy-content">
            <strong>Chip count mismatch</strong>
            <span>
              Total buy-ins: ${totalBuyIns.toFixed(2)} | Total cash-outs: ${totalCashOuts.toFixed(2)}
            </span>
            <span>
              Discrepancy: {discrepancy > 0 ? '+' : ''}${discrepancy.toFixed(2)}
              {discrepancy > 0 ? ' (more out than in)' : ' (less out than in)'}
            </span>
          </div>
        </div>
      )}

      {bankPlayer && (game.bankPaymentInfo.venmo || game.bankPaymentInfo.zelle) && (
        <div className="bank-payment-box">
          <h4>Pay {bankPlayer.name} via:</h4>
          {game.bankPaymentInfo.venmo && (
            <div className="payment-row">
              <span className="payment-label">Venmo</span>
              <span className="payment-value">{game.bankPaymentInfo.venmo}</span>
            </div>
          )}
          {game.bankPaymentInfo.zelle && (
            <div className="payment-row">
              <span className="payment-label">Zelle</span>
              <span className="payment-value">{game.bankPaymentInfo.zelle}</span>
            </div>
          )}
        </div>
      )}

      <div className="ledger-section">
        <h3>Results</h3>
        <div className="results-list">
          {sortedPlayers.map((player) => {
            const totalBuyIn = getTotalBuyIns(player);
            const balance = getPlayerBalance(player);
            const isCashedOut = player.cashOut !== null;

            return (
              <div key={player.id} className={`result-row ${!isCashedOut ? 'still-playing' : ''}`}>
                <div className="result-player">
                  <span className="result-name">
                    {player.name}
                    {player.isBank && <span className="bank-badge">Bank</span>}
                    {!isCashedOut && <span className="playing-badge">Playing</span>}
                  </span>
                  <span className="result-details">
                    {isCashedOut
                      ? `$${totalBuyIn.toFixed(2)} in / $${(player.cashOut ?? 0).toFixed(2)} out`
                      : `$${totalBuyIn.toFixed(2)} in`}
                  </span>
                </div>
                {isCashedOut ? (
                  <span className={`result-balance ${balance >= 0 ? 'positive' : 'negative'}`}>
                    {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
                  </span>
                ) : (
                  <span className="result-balance pending">--</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ledger-section">
        <h3>Settlements ({settlements.length} payment{settlements.length !== 1 ? 's' : ''})</h3>
        {settlements.length === 0 ? (
          <p className="no-settlements">No payments needed - everyone broke even!</p>
        ) : (
          <div className="settlements-list">
            {settlements.map((settlement, idx) => (
              <div key={idx} className="settlement-row">
                <div className="settlement-from">
                  <span className="settlement-name">{settlement.fromName}</span>
                  <span className="settlement-label">pays</span>
                </div>
                <div className="settlement-amount">${settlement.amount.toFixed(2)}</div>
                <div className="settlement-to">
                  <span className="settlement-label">to</span>
                  <span className="settlement-name">{settlement.toName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {allCashedOut && (
        <div className="ledger-actions">
          {game.isSettled ? (
            <button className="btn btn-secondary btn-large" onClick={onReopen}>
              Reopen Game
            </button>
          ) : (
            <button className="btn btn-success btn-large" onClick={onSettle}>
              Mark as Settled
            </button>
          )}
        </div>
      )}
    </div>
  );
}
