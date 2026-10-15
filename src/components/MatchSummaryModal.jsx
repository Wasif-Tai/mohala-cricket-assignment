import { useState } from "react";
import { formatOvers, formatBowlerOvers, calculateEconomy } from "../utils/cricketRules";

export default function MatchSummaryModal({ isOpen, matchState, onClose, onNewMatch }) {
  const [activeTab, setActiveTab] = useState("innings1");

  if (!isOpen || !matchState) return null;

  const result = matchState.result || {
    winner: "Match Concluded",
    margin: "",
    description: "Match has been concluded.",
  };

  const renderInningsTable = (inn, innNumber) => {
    if (!inn) return <p className="no-data-text">Innings {innNumber} was not played.</p>;

    const battersList = Object.values(inn.batters || {}).filter((b) => b.hasBatted || b.balls > 0 || b.runs > 0);
    const bowlersList = Object.values(inn.bowlers || {}).filter((b) => b.ballsBowled > 0);

    return (
      <div className="scorecard-innings-block">
        <div className="innings-scorecard-header">
          <h4>
            {inn.battingTeam}: {inn.runs}/{inn.wickets} ({formatOvers(inn.legalBalls)} ov)
          </h4>
          <span className="extras-badge">Extras: {inn.extras.total}</span>
        </div>

        {/* Batting Table */}
        <h5 className="table-section-title">Batting</h5>
        <div className="table-responsive">
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th>Dismissal</th>
                <th>R</th>
                <th>B</th>
                <th>4s</th>
                <th>6s</th>
                <th>SR</th>
              </tr>
            </thead>
            <tbody>
              {battersList.map((b, idx) => {
                const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={idx}>
                    <td>
                      <strong>{b.name}</strong>
                    </td>
                    <td className="dismissal-cell">
                      {b.isOut ? (
                        <span className="out-text">{b.dismissal || "out"}</span>
                      ) : (
                        <span className="not-out-text">not out</span>
                      )}
                    </td>
                    <td className="score-bold">{b.runs}</td>
                    <td>{b.balls}</td>
                    <td>{b.fours}</td>
                    <td>{b.sixes}</td>
                    <td>{sr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bowling Table */}
        <h5 className="table-section-title" style={{ marginTop: "16px" }}>
          Bowling
        </h5>
        <div className="table-responsive">
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th>O</th>
                <th>M</th>
                <th>R</th>
                <th>W</th>
                <th>Econ</th>
              </tr>
            </thead>
            <tbody>
              {bowlersList.map((bw, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{bw.name}</strong>
                  </td>
                  <td>{formatBowlerOvers(bw.ballsBowled)}</td>
                  <td>{bw.maidens}</td>
                  <td>{bw.runsConceded}</td>
                  <td className="score-bold wickets-cell">{bw.wickets}</td>
                  <td>{calculateEconomy(bw.runsConceded, bw.ballsBowled)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container match-summary-modal">
        <div className="modal-header modal-header-trophy">
          <h3 className="modal-title">🏆 Match Result & Full Scorecard</h3>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Trophy & Winner Banner */}
          <div className="winner-banner-box">
            <span className="trophy-emoji">🏆</span>
            <h2 className="winner-title">{result.description}</h2>
            {result.margin && <span className="winner-margin-badge">{result.margin}</span>}
          </div>

          {/* Innings Tabs */}
          <div className="scorecard-tabs">
            <button
              type="button"
              className={`scorecard-tab-btn ${activeTab === "innings1" ? "active" : ""}`}
              onClick={() => setActiveTab("innings1")}
            >
              1st Innings ({matchState.innings1?.battingTeam})
            </button>
            <button
              type="button"
              className={`scorecard-tab-btn ${activeTab === "innings2" ? "active" : ""}`}
              onClick={() => setActiveTab("innings2")}
            >
              2nd Innings ({matchState.innings2?.battingTeam || "Chase"})
            </button>
          </div>

          {/* Active Tab Table */}
          {activeTab === "innings1"
            ? renderInningsTable(matchState.innings1, 1)
            : renderInningsTable(matchState.innings2, 2)}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-secondary" onClick={onClose}>
            View Live Screen
          </button>
          <button type="button" className="btn-modal-primary" onClick={onNewMatch}>
            🏏 Start New Match
          </button>
        </div>
      </div>
    </div>
  );
}
