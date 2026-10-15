import { useState } from "react";

export default function OverHistory({ currentOver, oversHistory, onUndo, canUndo }) {
  const [inspectedBall, setInspectedBall] = useState(null);

  const getBallBadgeClass = (ball) => {
    if (ball.wicket) return "ball-chip ball-wicket";
    if (ball.type === "wide" || ball.type === "no_ball") return "ball-chip ball-extra";
    if (ball.runs === 4 || ball.runs === 6) return "ball-chip ball-boundary";
    if (ball.runs === 0) return "ball-chip ball-dot";
    return "ball-chip ball-run";
  };

  const handleInspect = (ball) => {
    setInspectedBall(ball);
  };

  const closeInspect = () => {
    setInspectedBall(null);
  };

  return (
    <div className="card over-history-card">
      <div className="history-header">
        <h3 className="history-title">Over History</h3>
        {canUndo && (
          <button
            type="button"
            className="btn-undo-mini"
            onClick={onUndo}
            title="Undo last delivery"
          >
            Undo Last Ball
          </button>
        )}
      </div>

      {/* Current Ongoing Over */}
      <div className="current-over-box">
        <div className="over-label-row">
          <span className="over-number-tag">
            This Over (Over {currentOver.overNumber})
          </span>
          <span className="over-bowler-tag">
            Bowler: <strong>{currentOver.bowler || "Pending selection"}</strong>
          </span>
          <span className="over-runs-tag">
            {currentOver.runsConceded} runs
          </span>
        </div>

        <div className="balls-sequence">
          {currentOver.deliveries.length === 0 ? (
            <span className="empty-over-text">Over in progress... tap buttons above</span>
          ) : (
            currentOver.deliveries.map((delivery, index) => (
              <button
                key={delivery.id || index}
                type="button"
                className={getBallBadgeClass(delivery)}
                onClick={() => handleInspect(delivery)}
                title="Tap to view delivery details"
              >
                {delivery.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Previous Completed Overs */}
      <div className="previous-overs-list">
        {oversHistory.length === 0 ? (
          <p className="no-previous-overs">No completed overs yet in this innings.</p>
        ) : (
          [...oversHistory].reverse().map((over) => (
            <div key={over.overNumber} className="completed-over-row">
              <div className="completed-over-meta">
                <span className="completed-over-num">Over {over.overNumber}</span>
                <span className="completed-over-bowler">b. {over.bowler}</span>
                <span className="completed-over-total">
                  {over.runsConceded} runs {over.wickets ? `• ${over.wickets} wkt` : ""}
                </span>
              </div>

              <div className="completed-balls-sequence">
                {over.deliveries.map((delivery, dIdx) => (
                  <button
                    key={delivery.id || dIdx}
                    type="button"
                    className={getBallBadgeClass(delivery)}
                    onClick={() => handleInspect(delivery)}
                    title="Tap to view delivery details"
                  >
                    {delivery.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delivery Inspection Modal */}
      {inspectedBall && (
        <div className="modal-overlay" onClick={closeInspect}>
          <div
            className="modal-container inspect-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Ball Details</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={closeInspect}
              >
                ✕
              </button>
            </div>

            <div className="modal-body inspect-body">
              <div className="inspect-chip-hero">
                <span className={getBallBadgeClass(inspectedBall)}>
                  {inspectedBall.label}
                </span>
                <span className="inspect-hero-runs">
                  {inspectedBall.runs} run{inspectedBall.runs !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="inspect-details-grid">
                <div className="inspect-item">
                  <span className="inspect-label">Over & Ball:</span>
                  <span className="inspect-value">
                    Over {inspectedBall.overNumber}, Ball {inspectedBall.ballInOver}
                  </span>
                </div>

                <div className="inspect-item">
                  <span className="inspect-label">Striker:</span>
                  <span className="inspect-value">{inspectedBall.striker}</span>
                </div>

                <div className="inspect-item">
                  <span className="inspect-label">Non-Striker:</span>
                  <span className="inspect-value">{inspectedBall.nonStriker}</span>
                </div>

                <div className="inspect-item">
                  <span className="inspect-label">Bowler:</span>
                  <span className="inspect-value">{inspectedBall.bowler}</span>
                </div>

                <div className="inspect-item">
                  <span className="inspect-label">Type:</span>
                  <span className="inspect-value">{inspectedBall.type.replace("_", " ")}</span>
                </div>

                <div className="inspect-item">
                  <span className="inspect-label">Legal Delivery:</span>
                  <span className="inspect-value">
                    {inspectedBall.isLegal ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {inspectedBall.wicket && (
                <div className="inspect-wicket-box">
                  <strong>Wicket:</strong> {inspectedBall.wicket.dismissedPlayer} (
                  {inspectedBall.wicket.dismissalType}) - {inspectedBall.wicket.description}
                </div>
              )}

              {inspectedBall.commentary && (
                <div className="inspect-commentary-box">
                  <p>{inspectedBall.commentary}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={closeInspect}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
