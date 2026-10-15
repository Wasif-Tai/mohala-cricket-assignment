import {
  formatOvers,
  formatBowlerOvers,
  calculateRunRate,
  calculateRequiredRunRate,
  calculateEconomy,
} from "../utils/cricketRules";

export default function Scoreboard({ matchState }) {
  if (!matchState) return null;

  const currentInningsKey = matchState.currentInnings === 1 ? "innings1" : "innings2";
  const inn = matchState[currentInningsKey];

  if (!inn) return null;

  const isSecondInnings = matchState.currentInnings === 2;
  const maxOvers = matchState.oversPerInnings;
  const totalBalls = maxOvers * 6;
  const ballsRemaining = Math.max(0, totalBalls - inn.legalBalls);
  const currentRunRate = calculateRunRate(inn.runs, inn.legalBalls);

  // Second Innings chase calculation
  let target = 0;
  let runsNeeded = 0;
  let requiredRunRate = "0.00";
  if (isSecondInnings && matchState.innings1) {
    target = matchState.innings1.runs + 1;
    runsNeeded = Math.max(0, target - inn.runs);
    requiredRunRate = calculateRequiredRunRate(runsNeeded, ballsRemaining);
  }

  // Active Batters
  const strikerName = inn.striker;
  const nonStrikerName = inn.nonStriker;
  const strikerStats = inn.batters[strikerName] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
  const nonStrikerStats = inn.batters[nonStrikerName] || { runs: 0, balls: 0, fours: 0, sixes: 0 };

  const strikerSR =
    strikerStats.balls > 0 ? ((strikerStats.runs / strikerStats.balls) * 100).toFixed(1) : "0.0";
  const nonStrikerSR =
    nonStrikerStats.balls > 0
      ? ((nonStrikerStats.runs / nonStrikerStats.balls) * 100).toFixed(1)
      : "0.0";

  // Active Bowler
  const currentBowlerName = inn.currentBowler;
  const bowlerStats = (currentBowlerName && inn.bowlers[currentBowlerName]) || {
    ballsBowled: 0,
    runsConceded: 0,
    wickets: 0,
    maidens: 0,
  };

  const bowlerOvers = formatBowlerOvers(bowlerStats.ballsBowled);
  const bowlerEconomy = calculateEconomy(bowlerStats.runsConceded, bowlerStats.ballsBowled);

  return (
    <div className="card scoreboard-card">
      {/* Top Banner: Teams & Innings indicator */}
      <div className="scoreboard-header">
        <div className="teams-matchup">
          <span className="batting-team-badge">
            {inn.battingTeam} <span className="batting-label">(Batting)</span>
          </span>
          <span className="vs-divider">vs</span>
          <span className="bowling-team-name">{inn.bowlingTeam}</span>
        </div>

        <div className="innings-indicator">
          {matchState.currentInnings === 1 ? "1st Innings" : "2nd Innings"}
        </div>
      </div>

      {/* Main Score & Overs Display */}
      <div className="main-score-row">
        <div className="score-block">
          <div className="score-numbers">
            <span className="runs-count">{inn.runs}</span>
            <span className="score-slash">/</span>
            <span className="wickets-count">{inn.wickets}</span>
          </div>
          <span className="score-subtext">
            All out at {matchState.playersPerTeam - 1} wkts
          </span>
        </div>

        <div className="overs-block">
          <div className="overs-text">
            {formatOvers(inn.legalBalls)}{" "}
            <span className="max-overs">/ {maxOvers} ov</span>
          </div>
          <div className="rate-badge">CRR: {currentRunRate}</div>
        </div>
      </div>

      {/* Target & Chase Info for 2nd Innings */}
      {isSecondInnings && (
        <div className="target-banner">
          <div className="target-stat">
            <span className="target-label">Target:</span>
            <span className="target-value">{target}</span>
          </div>
          <div className="target-status">
            {runsNeeded > 0 ? (
              <span>
                Need <strong>{runsNeeded}</strong> runs in <strong>{ballsRemaining}</strong> balls
              </span>
            ) : (
              <span className="target-achieved">Target Achieved</span>
            )}
          </div>
          <div className="target-stat">
            <span className="target-label">RRR:</span>
            <span className="target-value">{requiredRunRate}</span>
          </div>
        </div>
      )}

      {/* Current Batters & Bowler Grid */}
      <div className="live-actors-grid">
        {/* Batters Table / Card */}
        <div className="actors-card batters-card">
          <div className="actors-card-title">Batting</div>
          <div className="table-responsive">
            <table className="mini-stats-table">
              <thead>
                <tr>
                  <th className="th-name">Batter</th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {/* Striker */}
                <tr className="active-striker-row">
                  <td className="batter-name-cell">
                    <span className="strike-indicator">*</span>
                    <span className="player-name">{strikerName || "—"}</span>
                  </td>
                  <td className="stat-highlight">{strikerStats.runs}</td>
                  <td>{strikerStats.balls}</td>
                  <td>{strikerStats.fours}</td>
                  <td>{strikerStats.sixes}</td>
                  <td className="sr-cell">{strikerSR}</td>
                </tr>

                {/* Non-Striker */}
                <tr className="non-striker-row">
                  <td className="batter-name-cell">
                    <span className="strike-spacer"></span>
                    <span className="player-name">{nonStrikerName || "—"}</span>
                  </td>
                  <td>{nonStrikerStats.runs}</td>
                  <td>{nonStrikerStats.balls}</td>
                  <td>{nonStrikerStats.fours}</td>
                  <td>{nonStrikerStats.sixes}</td>
                  <td className="sr-cell">{nonStrikerSR}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bowler Card */}
        <div className="actors-card bowler-card">
          <div className="actors-card-title">Bowling</div>
          <div className="table-responsive">
            <table className="mini-stats-table">
              <thead>
                <tr>
                  <th className="th-name">Bowler</th>
                  <th>O</th>
                  <th>M</th>
                  <th>R</th>
                  <th>W</th>
                  <th>Econ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bowler-name-cell">
                    <span className="player-name">{currentBowlerName || "Select Bowler"}</span>
                  </td>
                  <td>{bowlerOvers}</td>
                  <td>{bowlerStats.maidens}</td>
                  <td>{bowlerStats.runsConceded}</td>
                  <td className="stat-highlight wickets-cell">{bowlerStats.wickets}</td>
                  <td className="sr-cell">{bowlerEconomy}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Extras summary */}
          <div className="extras-compact-strip">
            <span>
              Extras: <strong>{inn.extras.total}</strong>
            </span>
            <span className="extras-breakdown">
              (Wd {inn.extras.wides}, Nb {inn.extras.noBalls}, B {inn.extras.byes}, Lb{" "}
              {inn.extras.legByes})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
