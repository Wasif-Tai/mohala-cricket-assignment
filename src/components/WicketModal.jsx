import { useState } from "react";

export default function WicketModal({
  isOpen,
  onClose,
  onConfirmWicket,
  striker,
  nonStriker,
  currentBowler,
  availableBatters,
  bowlingPlayers,
  isAllOutNext,
}) {
  const [dismissalType, setDismissalType] = useState("bowled");
  const [outBatterRole, setOutBatterRole] = useState("striker"); // "striker" | "nonStriker"
  const [fielder, setFielder] = useState("");
  const [runsCompleted, setRunsCompleted] = useState(0);
  const [newBatter, setNewBatter] = useState(availableBatters[0] || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const requiresFielder = dismissalType === "caught" || dismissalType === "stumped";
  const isRunOut = dismissalType === "run_out";

  const handleConfirm = () => {
    setError("");

    if ((requiresFielder || isRunOut) && fielder.trim() === "") {
      setError("Please select or enter the fielder / wicketkeeper name.");
      return;
    }

    if (!isAllOutNext && !newBatter && availableBatters.length > 0) {
      setError("Please select the incoming batter.");
      return;
    }

    onConfirmWicket({
      dismissalType,
      outBatterRole: isRunOut ? outBatterRole : "striker",
      fielder: fielder.trim(),
      runsCompleted: isRunOut ? Number(runsCompleted) : 0,
      newBatter: isAllOutNext ? null : newBatter,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container wicket-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Record Wicket</h3>
            <span className="modal-subtitle">
              Bowler: {currentBowler} • Facing: {striker}
            </span>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert-error">{error}</div>}

          {/* Dismissal Type Options */}
          <div className="form-group">
            <label className="form-label">How was the batter dismissed? *</label>
            <div className="dismissal-options-grid">
              {[
                { type: "bowled", label: "Bowled" },
                { type: "caught", label: "Caught" },
                { type: "run_out", label: "Run Out" },
                { type: "stumped", label: "Stumped" },
                { type: "lbw", label: "LBW" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className={`btn-dismissal-choice ${
                    dismissalType === item.type ? "active" : ""
                  }`}
                  onClick={() => {
                    setDismissalType(item.type);
                    if (item.type !== "run_out") {
                      setOutBatterRole("striker");
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional: Run Out - Who was dismissed? */}
          {isRunOut && (
            <div className="form-group highlighted-field-group">
              <label className="form-label">Which batter is Run Out? *</label>
              <div className="radio-pill-group">
                <button
                  type="button"
                  className={`radio-pill ${outBatterRole === "striker" ? "active" : ""}`}
                  onClick={() => setOutBatterRole("striker")}
                >
                  Striker: <strong>{striker}</strong>
                </button>
                <button
                  type="button"
                  className={`radio-pill ${outBatterRole === "nonStriker" ? "active" : ""}`}
                  onClick={() => setOutBatterRole("nonStriker")}
                >
                  Non-Striker: <strong>{nonStriker}</strong>
                </button>
              </div>

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label className="form-label">Runs completed before Run Out:</label>
                <select
                  className="form-select"
                  value={runsCompleted}
                  onChange={(e) => setRunsCompleted(Number(e.target.value))}
                >
                  <option value={0}>0 runs completed</option>
                  <option value={1}>1 run completed</option>
                  <option value={2}>2 runs completed</option>
                </select>
              </div>
            </div>
          )}

          {/* Conditional: Fielder Selection */}
          {(requiresFielder || isRunOut) && (
            <div className="form-group">
              <label className="form-label">
                {dismissalType === "stumped"
                  ? "Wicketkeeper / Fielder Name *"
                  : "Fielder Name *"}
              </label>
              <div className="fielder-selection-box">
                <select
                  className="form-select"
                  value={fielder}
                  onChange={(e) => setFielder(e.target.value)}
                >
                  <option value="">Select Fielder from {bowlingPlayers.length} players</option>
                  {bowlingPlayers.map((player, i) => (
                    <option key={i} value={player}>
                      {player}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: "8px" }}
                  placeholder="Or type custom fielder name"
                  value={fielder}
                  onChange={(e) => setFielder(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Incoming Batter Selection */}
          {!isAllOutNext ? (
            <div className="form-group incoming-batter-group">
              <label className="form-label">Incoming Batter (New Batter) *</label>
              {availableBatters.length === 0 ? (
                <p className="note-text">No remaining bench batters available.</p>
              ) : (
                <select
                  className="form-select select-incoming-batter"
                  value={newBatter}
                  onChange={(e) => setNewBatter(e.target.value)}
                  required
                >
                  {availableBatters.map((player, idx) => (
                    <option key={idx} value={player}>
                      {player}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="alert-all-out-warning">
              This wicket will make the team <strong>all out</strong>. The innings will end.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-modal-danger" onClick={handleConfirm}>
            Confirm Wicket
          </button>
        </div>
      </div>
    </div>
  );
}
