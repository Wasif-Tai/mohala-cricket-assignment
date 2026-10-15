import { useState } from "react";

export default function ExtrasModal({ isOpen, onClose, onConfirmExtra, defaultType = "wide" }) {
  const [extraType, setExtraType] = useState(defaultType);
  const [additionalRuns, setAdditionalRuns] = useState(0); // for wide or no-ball
  const [isByeOnNoBall, setIsByeOnNoBall] = useState(false);
  const [byeRuns, setByeRuns] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (extraType === "wide") {
      onConfirmExtra({
        type: "wide",
        additionalRuns: Number(additionalRuns),
      });
    } else if (extraType === "no_ball") {
      onConfirmExtra({
        type: "no_ball",
        batRuns: Number(additionalRuns),
        isBye: isByeOnNoBall,
      });
    } else if (extraType === "bye" || extraType === "leg_bye") {
      onConfirmExtra({
        type: extraType,
        runs: Number(byeRuns),
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container extras-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Record Extra Delivery</h3>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Extra Type Selector */}
          <div className="form-group">
            <label className="form-label">Extra Delivery Type</label>
            <div className="extra-type-toggle-group">
              {[
                { type: "wide", label: "Wide (Wd)" },
                { type: "no_ball", label: "No-Ball (Nb)" },
                { type: "bye", label: "Bye (B)" },
                { type: "leg_bye", label: "Leg-Bye (Lb)" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className={`btn-extra-toggle ${extraType === item.type ? "active" : ""}`}
                  onClick={() => {
                    setExtraType(item.type);
                    setAdditionalRuns(0);
                    setByeRuns(1);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wide options */}
          {extraType === "wide" && (
            <div className="extra-details-panel">
              <p className="extra-info-text">
                Wide adds <strong>1 penalty run</strong> to team score & bowler figures. It does
                NOT count as a legal ball.
              </p>
              <div className="form-group">
                <label className="form-label">Additional Runs (overthrow / running):</label>
                <div className="runs-pill-group">
                  {[0, 1, 2, 3, 4].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`run-pill ${additionalRuns === r ? "active" : ""}`}
                      onClick={() => setAdditionalRuns(r)}
                    >
                      +{r} run{r !== 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>
              <div className="calc-summary-badge">
                Total Runs Recorded: <strong>{1 + Number(additionalRuns)} Wd</strong>
              </div>
            </div>
          )}

          {/* No-ball options */}
          {extraType === "no_ball" && (
            <div className="extra-details-panel">
              <p className="extra-info-text">
                No-ball adds <strong>1 penalty run</strong> to the team. It does NOT count as a
                legal ball.
              </p>
              <div className="form-group">
                <label className="form-label">Runs scored on No-ball:</label>
                <div className="runs-pill-group">
                  {[0, 1, 2, 3, 4, 6].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`run-pill ${additionalRuns === r ? "active" : ""}`}
                      onClick={() => setAdditionalRuns(r)}
                    >
                      {r === 0 ? "0 (Only 1 Nb)" : `+${r} ${r >= 4 ? "Boundary" : "Runs"}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isByeOnNoBall}
                    onChange={(e) => setIsByeOnNoBall(e.target.checked)}
                  />
                  <span>These runs were Byes/Leg-byes (not off the bat)</span>
                </label>
              </div>

              <div className="calc-summary-badge">
                Total Team Runs: <strong>{1 + Number(additionalRuns)}</strong> (1 Nb +{" "}
                {additionalRuns} {isByeOnNoBall ? "Byes" : "off bat"})
              </div>
            </div>
          )}

          {/* Bye & Leg-bye options */}
          {(extraType === "bye" || extraType === "leg_bye") && (
            <div className="extra-details-panel">
              <p className="extra-info-text">
                {extraType === "bye" ? "Byes" : "Leg-byes"} count as a{" "}
                <strong>legal delivery</strong> and 1 ball faced by the batter. Runs are credited
                to extras (not bowler, not batter).
              </p>
              <div className="form-group">
                <label className="form-label">Runs completed:</label>
                <div className="runs-pill-group">
                  {[1, 2, 3, 4].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`run-pill ${byeRuns === r ? "active" : ""}`}
                      onClick={() => setByeRuns(r)}
                    >
                      {r} {extraType === "bye" ? "Bye" : "Leg-bye"}
                      {r > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-modal-primary" onClick={handleConfirm}>
            Record Extra
          </button>
        </div>
      </div>
    </div>
  );
}
