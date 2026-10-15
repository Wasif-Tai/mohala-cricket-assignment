import { useState } from "react";
import { formatBowlerOvers } from "../utils/cricketRules";

export default function BowlerModal({
  isOpen,
  onClose,
  onSelectBowler,
  bowlingPlayers,
  previousBowler,
  currentBowler,
  bowlersStats = {},
  isOverChange = false,
}) {
  const [selectedBowler, setSelectedBowler] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedBowler) {
      setError("Please select a bowler.");
      return;
    }
    if (isOverChange && selectedBowler === previousBowler) {
      setError(`${previousBowler} bowled the previous over. In cricket, a bowler cannot bowl two consecutive overs!`);
      return;
    }

    onSelectBowler(selectedBowler);
  };

  return (
    <div className="modal-overlay" onClick={isOverChange ? undefined : onClose}>
      <div
        className="modal-container bowler-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {isOverChange ? "Over Complete — Select Next Bowler" : "Change Current Bowler"}
          </h3>
          {!isOverChange && (
            <button type="button" className="btn-modal-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        <div className="modal-body">
          {error && <div className="alert-error">{error}</div>}

          {previousBowler && isOverChange && (
            <div className="note-box">
              <strong>{previousBowler}</strong> bowled the previous over and cannot bowl consecutively.
            </div>
          )}

          <div className="bowlers-pick-list">
            {bowlingPlayers.map((player) => {
              const isPrev = isOverChange && player === previousBowler;
              const isCurr = !isOverChange && player === currentBowler;
              const stats = bowlersStats[player] || {
                ballsBowled: 0,
                runsConceded: 0,
                wickets: 0,
              };

              return (
                <div
                  key={player}
                  className={`bowler-option-card ${
                    selectedBowler === player ? "selected" : ""
                  } ${isPrev ? "disabled-card" : ""}`}
                  onClick={() => {
                    if (!isPrev) {
                      setSelectedBowler(player);
                      setError("");
                    }
                  }}
                >
                  <div className="bowler-option-info">
                    <span className="bowler-name">{player}</span>
                    {isPrev && <span className="badge-consecutive">Just Bowled</span>}
                    {isCurr && <span className="badge-current">Current Bowler</span>}
                  </div>
                  <div className="bowler-stats-chip">
                    {formatBowlerOvers(stats.ballsBowled)} ov • {stats.runsConceded} r •{" "}
                    {stats.wickets} w
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          {!isOverChange && (
            <button type="button" className="btn-modal-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="btn-modal-primary"
            onClick={handleConfirm}
            disabled={!selectedBowler}
          >
            Confirm Bowler
          </button>
        </div>
      </div>
    </div>
  );
}
