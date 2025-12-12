import { useState, useCallback } from 'react';
import type { PlayerCount, TimeStructure, StraddleType } from './types';
import { STREET_LABELS, STRADDLE_LABELS } from './types';
import { TIME_STRUCTURES } from './utils/timeStructures';
import { useGameState } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import {
  TimerDisplay,
  PlayerChips,
  Controls,
  ActionButtons,
  PenaltyModal,
  CustomTimeStructureModal,
} from './components';
import './App.css';

function App() {
  const [playerCount, setPlayerCount] = useState<PlayerCount>(6);
  const [timeStructure, setTimeStructure] = useState<TimeStructure>(TIME_STRUCTURES[0]);
  const [customTimeStructure, setCustomTimeStructure] = useState<TimeStructure | null>(null);
  const [straddle, setStraddle] = useState<StraddleType>('none');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const {
    players,
    currentPlayerIndex,
    isHandActive,
    isPaused,
    penalties,
    currentStreet,
    isWaitingForStreet,
    nextStreet,
    currentStraddle,
    startNewHand,
    handleAction,
    handleRaise,
    handleFold,
    beginStreet,
    togglePause,
    selectPlayer,
    endHand,
  } = useGameState();

  const { elapsedSeconds, reset: resetTimer } = useTimer({
    isRunning: isHandActive && !isWaitingForStreet,
    isPaused,
  });

  const currentPlayer = players[currentPlayerIndex]?.position ?? null;
  const activePlayers = players.filter((p) => !p.folded);

  const onNewHand = useCallback(() => {
    startNewHand(playerCount, straddle);
    resetTimer();
    setShowPenaltyModal(false);
  }, [playerCount, straddle, startNewHand, resetTimer]);

  const finishHand = useCallback(() => {
    endHand();
    setShowPenaltyModal(true);
  }, [endHand]);

  const onAction = useCallback(() => {
    const result = handleAction(elapsedSeconds, timeStructure);

    if (result === 'hand_over') {
      finishHand();
    } else if (result === 'street_complete') {
      // Timer stops, waiting for dealer to begin next street
      resetTimer();
    } else {
      resetTimer();
    }
  }, [handleAction, elapsedSeconds, timeStructure, finishHand, resetTimer]);

  const onRaise = useCallback(() => {
    handleRaise(elapsedSeconds, timeStructure);
    resetTimer();
  }, [handleRaise, elapsedSeconds, timeStructure, resetTimer]);

  const onFold = useCallback(() => {
    const result = handleFold(elapsedSeconds, timeStructure);

    if (result === 'hand_over') {
      finishHand();
    } else if (result === 'street_complete') {
      // Timer stops, waiting for dealer to begin next street
      resetTimer();
    } else {
      resetTimer();
    }
  }, [handleFold, elapsedSeconds, timeStructure, finishHand, resetTimer]);

  const onBeginStreet = useCallback(() => {
    if (nextStreet) {
      beginStreet(nextStreet);
      resetTimer();
    }
  }, [nextStreet, beginStreet, resetTimer]);

  const onEndHand = useCallback(() => {
    finishHand();
  }, [finishHand]);

  const onSelectPlayer = useCallback(
    (index: number) => {
      selectPlayer(index);
      resetTimer();
    },
    [selectPlayer, resetTimer]
  );

  const handleSaveCustomStructure = useCallback((structure: TimeStructure) => {
    setCustomTimeStructure(structure);
    setTimeStructure(structure);
  }, []);

  const cycleStraddle = useCallback(() => {
    const order: StraddleType[] = ['none', 'single', 'double', 'triple'];
    const currentIndex = order.indexOf(straddle);
    const nextIndex = (currentIndex + 1) % order.length;
    setStraddle(order[nextIndex]);
  }, [straddle]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAction,
    onRaise,
    onFold,
    onNewHand,
    onPause: togglePause,
    onBeginStreet,
    onEndHand,
    onStraddleCycle: cycleStraddle,
    isHandActive,
    isWaitingForStreet,
    isModalOpen: showPenaltyModal || showCustomModal,
  });

  const getStatusText = () => {
    if (!isHandActive) {
      return 'Waiting for new hand...';
    }
    if (isWaitingForStreet && nextStreet) {
      return `${STREET_LABELS[currentStreet]} complete · Waiting to deal ${STREET_LABELS[nextStreet]}`;
    }
    const straddleText = currentStraddle !== 'none' ? ` · ${STRADDLE_LABELS[currentStraddle]}` : '';
    return `${STREET_LABELS[currentStreet]} · ${activePlayers.length} players${straddleText}`;
  };

  return (
    <div className={`container ${isFocusMode ? 'focus-mode' : ''}`}>
      <div className="header-row">
        <button
          className={`focus-mode-toggle ${isFocusMode ? 'active' : ''}`}
          onClick={() => setIsFocusMode(!isFocusMode)}
        >
          {isFocusMode ? 'Exit Focus' : 'Focus'}
        </button>
      </div>

      {!isFocusMode && (
        <Controls
          playerCount={playerCount}
          timeStructure={timeStructure}
          straddle={straddle}
          isHandActive={isHandActive}
          customTimeStructure={customTimeStructure}
          onPlayerCountChange={setPlayerCount}
          onTimeStructureChange={setTimeStructure}
          onStraddleChange={setStraddle}
          onOpenCustomModal={() => setShowCustomModal(true)}
        />
      )}

      <TimerDisplay
        currentPlayer={isWaitingForStreet ? null : currentPlayer}
        elapsedSeconds={isWaitingForStreet ? 0 : elapsedSeconds}
        timeStructure={timeStructure}
        isHandActive={isHandActive && !isWaitingForStreet}
      />

      {!isFocusMode && <div className="status-bar">{getStatusText()}</div>}

      <PlayerChips
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        penalties={penalties}
        isHandActive={isHandActive && !isWaitingForStreet}
        onSelectPlayer={onSelectPlayer}
        isFocusMode={isFocusMode}
      />

      <ActionButtons
        isHandActive={isHandActive}
        isPaused={isPaused}
        isWaitingForStreet={isWaitingForStreet}
        nextStreet={nextStreet}
        onAction={onAction}
        onRaise={onRaise}
        onFold={onFold}
        onBeginStreet={onBeginStreet}
        onPause={togglePause}
        onNewHand={onNewHand}
        onEndHand={onEndHand}
        isFocusMode={isFocusMode}
      />

      {!isFocusMode && (
        <div className="instructions">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcuts-grid">
            {Object.entries(KEYBOARD_SHORTCUTS).map(([key, action]) => (
              <div key={key} className="shortcut-item">
                <kbd>{key}</kbd>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <PenaltyModal
        isOpen={showPenaltyModal}
        penalties={penalties}
        onClose={() => setShowPenaltyModal(false)}
      />

      <CustomTimeStructureModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={handleSaveCustomStructure}
      />
    </div>
  );
}

export default App;
