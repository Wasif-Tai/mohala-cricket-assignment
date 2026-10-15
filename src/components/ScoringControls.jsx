export default function ScoringControls({
  onScoreRuns,
  onOpenWicketModal,
  onOpenExtrasModal,
  onOpenBowlerModal,
  onUndo,
  onSwapStrike,
  onEndInningsPrompt,
  onFinishMatchPrompt,
  canUndo,
  currentBowler,
  isOverPending,
  isMatchFinished,
}) {
  return (
    <div className="card scoring-controls-card">
      <div className="controls-header">
        <h3 className="controls-title">Score Delivery</h3>
        {isOverPending && (
          <span className="over-alert-badge">
            Over Complete — Select Next Bowler
          </span>
        )}
      </div>

      {/* Main Runs Scoring Buttons */}
      <div className="scoring-grid-runs">
        <button
          type="button"
          className="btn-score btn-score-dot"
          onClick={() => onScoreRuns(0)}
          disabled={isMatchFinished || !currentBowler}
          title="0 runs (Dot ball)"
        >
          <span className="btn-score-num">0</span>
          <span className="btn-score-label">Dot</span>
        </button>

        <button
          type="button"
          className="btn-score btn-score-run"
          onClick={() => onScoreRuns(1)}
          disabled={isMatchFinished || !currentBowler}
          title="1 run (Single)"
        >
          <span className="btn-score-num">1</span>
          <span className="btn-score-label">Single</span>
        </button>

        <button
          type="button"
          className="btn-score btn-score-run"
          onClick={() => onScoreRuns(2)}
          disabled={isMatchFinished || !currentBowler}
          title="2 runs"
        >
          <span className="btn-score-num">2</span>
          <span className="btn-score-label">Double</span>
        </button>

        <button
          type="button"
          className="btn-score btn-score-run"
          onClick={() => onScoreRuns(3)}
          disabled={isMatchFinished || !currentBowler}
          title="3 runs"
        >
          <span className="btn-score-num">3</span>
          <span className="btn-score-label">Three</span>
        </button>

        <button
          type="button"
          className="btn-score btn-score-boundary btn-score-four"
          onClick={() => onScoreRuns(4)}
          disabled={isMatchFinished || !currentBowler}
          title="4 runs (Boundary)"
        >
          <span className="btn-score-num">4</span>
          <span className="btn-score-label">Four</span>
        </button>

        <button
          type="button"
          className="btn-score btn-score-boundary btn-score-six"
          onClick={() => onScoreRuns(6)}
          disabled={isMatchFinished || !currentBowler}
          title="6 runs (Maximum)"
        >
          <span className="btn-score-num">6</span>
          <span className="btn-score-label">Six</span>
        </button>
      </div>

      {/* Extras & Wicket Scoring Grid */}
      <div className="scoring-grid-extras">
        <button
          type="button"
          className="btn-extra"
          onClick={() => onOpenExtrasModal("wide")}
          disabled={isMatchFinished || !currentBowler}
        >
          Wide
        </button>

        <button
          type="button"
          className="btn-extra"
          onClick={() => onOpenExtrasModal("no_ball")}
          disabled={isMatchFinished || !currentBowler}
        >
          No-Ball
        </button>

        <button
          type="button"
          className="btn-extra"
          onClick={() => onOpenExtrasModal("bye")}
          disabled={isMatchFinished || !currentBowler}
        >
          Bye
        </button>

        <button
          type="button"
          className="btn-extra"
          onClick={() => onOpenExtrasModal("leg_bye")}
          disabled={isMatchFinished || !currentBowler}
        >
          Leg-Bye
        </button>

        <button
          type="button"
          className="btn-extra btn-wicket"
          onClick={onOpenWicketModal}
          disabled={isMatchFinished || !currentBowler}
        >
          Wicket
        </button>
      </div>

      {/* Secondary Match Actions */}
      <div className="match-actions-bar">
        <button
          type="button"
          className="btn-action btn-undo"
          onClick={onUndo}
          disabled={!canUndo || isMatchFinished}
        >
          Undo Ball
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={onOpenBowlerModal}
          disabled={isMatchFinished}
        >
          Change Bowler
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={onSwapStrike}
          disabled={isMatchFinished}
        >
          Swap Strike
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={onEndInningsPrompt}
          disabled={isMatchFinished}
        >
          End Innings
        </button>

        <button
          type="button"
          className="btn-action btn-action-finish"
          onClick={onFinishMatchPrompt}
          disabled={isMatchFinished}
        >
          Finish Match
        </button>
      </div>
    </div>
  );
}
