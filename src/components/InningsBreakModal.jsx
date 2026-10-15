import { useState } from "react";
import { formatOvers, calculateRunRate } from "../utils/cricketRules";

export default function InningsBreakModal({
  isOpen,
  matchState,
  onStartSecondInnings,
}) {
  const inn1 = matchState?.innings1;
  const chasingTeam = inn1?.bowlingTeam;
  const defendingTeam = inn1?.battingTeam;
  const chasingPlayers = inn1?.bowlingPlayers || [];
  const defendingPlayers = inn1?.battingPlayers || [];

  const [openingStriker, setOpeningStriker] = useState(() => chasingPlayers[0] || "");
  const [openingNonStriker, setOpeningNonStriker] = useState(() => chasingPlayers[1] || "");
  const [openingBowler, setOpeningBowler] = useState(() => defendingPlayers[0] || "");
  const [error, setError] = useState("");

  if (!isOpen || !inn1) return null;

  const target = inn1.runs + 1;
  const maxOvers = matchState.oversPerInnings;
  const requiredRR = (target / maxOvers).toFixed(2);

  const handleStart = () => {
    setError("");
    if (!openingStriker || !openingNonStriker) {
      setError("Please select both opening striker and non-striker.");
      return;
    }
    if (openingStriker === openingNonStriker) {
      setError("Opening striker and non-striker must be different players.");
      return;
    }
    if (!openingBowler) {
      setError("Please select the opening bowler for defending team.");
      return;
    }

    onStartSecondInnings({
      openingStriker,
      openingNonStriker,
      openingBowler,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container innings-break-modal">
        <div className="modal-header">
          <h3 className="modal-title">Innings Break</h3>
        </div>

        <div className="modal-body">
          {error && <div className="alert-error">{error}</div>}

          {/* 1st Innings Summary Box */}
          <div className="innings-summary-card">
            <div className="summary-team-title">{defendingTeam}</div>
            <div className="summary-score-large">
              {inn1.runs} / {inn1.wickets}
              <span className="summary-overs">
                ({formatOvers(inn1.legalBalls)} / {maxOvers} ov)
              </span>
            </div>
            <div className="summary-runrate">
              Run Rate: {calculateRunRate(inn1.runs, inn1.legalBalls)}
            </div>

            <div className="target-announcement">
              Target for <strong>{chasingTeam}</strong>: <strong>{target} runs</strong> in{" "}
              <strong>{maxOvers} overs</strong> (RRR: {requiredRR})
            </div>
          </div>

          {/* 2nd Innings Openers Setup */}
          <div className="second-innings-setup-section">
            <h4 className="sub-title">Set 2nd Innings Openers ({chasingTeam})</h4>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Opening Striker *</label>
                <select
                  className="form-select"
                  value={openingStriker}
                  onChange={(e) => setOpeningStriker(e.target.value)}
                >
                  {chasingPlayers.map((p, i) => (
                    <option key={i} value={p} disabled={p === openingNonStriker}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Opening Non-Striker *</label>
                <select
                  className="form-select"
                  value={openingNonStriker}
                  onChange={(e) => setOpeningNonStriker(e.target.value)}
                >
                  {chasingPlayers.map((p, i) => (
                    <option key={i} value={p} disabled={p === openingStriker}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Opening Bowler ({defendingTeam}) *
                </label>
                <select
                  className="form-select"
                  value={openingBowler}
                  onChange={(e) => setOpeningBowler(e.target.value)}
                >
                  {defendingPlayers.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-modal-primary btn-start-innings-2"
            onClick={handleStart}
          >
            Start 2nd Innings
          </button>
        </div>
      </div>
    </div>
  );
}
