import { useState } from "react";

export default function MatchSetup({ onStartMatch, isCollapsed = false, onToggleCollapse }) {
  const [teamAName, setTeamAName] = useState("Bahadurabad Kings");
  const [teamBName, setTeamBName] = useState("Gulshan Gladiators");
  const [oversPerInnings, setOversPerInnings] = useState(8);
  const [playersPerTeam, setPlayersPerTeam] = useState(8);

  const [tossWinner, setTossWinner] = useState("Bahadurabad Kings");
  const [tossDecision, setTossDecision] = useState("bat"); // "bat" or "bowl"

  const [teamAPlayers, setTeamAPlayers] = useState([
    "Wasif (C)",
    "Asim Munir",
    "Ali",
    "Hamza",
    "Zeeshan",
    "Daniyal",
    "Farhan",
    "Usman",
  ]);

  const [teamBPlayers, setTeamBPlayers] = useState([
    "Babar (C)",
    "Shaheen",
    "Rizwan (wk)",
    "Shadab",
    "Fakhar",
    "Naseem",
    "Rauf",
    "Iftikhar",
  ]);

  const [customStriker, setCustomStriker] = useState("");
  const [customNonStriker, setCustomNonStriker] = useState("");
  const [customBowler, setCustomBowler] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePlayersPerTeamChange = (newCount) => {
    setPlayersPerTeam(newCount);
    setTeamAPlayers((prev) => {
      const copy = [...prev];
      while (copy.length < newCount) {
        copy.push(`Player A${copy.length + 1}`);
      }
      return copy.slice(0, newCount);
    });

    setTeamBPlayers((prev) => {
      const copy = [...prev];
      while (copy.length < newCount) {
        copy.push(`Player B${copy.length + 1}`);
      }
      return copy.slice(0, newCount);
    });
  };

  const handleTeamANameChange = (name) => {
    setTeamAName(name);
    if (tossWinner === teamAName) {
      setTossWinner(name);
    }
  };

  const handleTeamBNameChange = (name) => {
    setTeamBName(name);
    if (tossWinner === teamBName) {
      setTossWinner(name);
    }
  };

  // Determine who bats first
  const isTeamABatting =
    (tossWinner === teamAName && tossDecision === "bat") ||
    (tossWinner === teamBName && tossDecision === "bowl");

  const battingTeamName = isTeamABatting ? teamAName : teamBName;
  const bowlingTeamName = isTeamABatting ? teamBName : teamAName;
  const battingPlayers = isTeamABatting ? teamAPlayers : teamBPlayers;
  const bowlingPlayers = isTeamABatting ? teamBPlayers : teamAPlayers;

  // Derive valid opening striker, non-striker, bowler
  const openingStriker =
    customStriker && battingPlayers.includes(customStriker)
      ? customStriker
      : battingPlayers[0] || "";

  const openingNonStriker =
    customNonStriker &&
    battingPlayers.includes(customNonStriker) &&
    customNonStriker !== openingStriker
      ? customNonStriker
      : battingPlayers.find((p) => p !== openingStriker) || battingPlayers[1] || "";

  const openingBowler =
    customBowler && bowlingPlayers.includes(customBowler)
      ? customBowler
      : bowlingPlayers[0] || "";

  const handlePlayerNameChange = (team, index, value) => {
    if (team === "A") {
      const updated = [...teamAPlayers];
      updated[index] = value;
      setTeamAPlayers(updated);
    } else {
      const updated = [...teamBPlayers];
      updated[index] = value;
      setTeamBPlayers(updated);
    }
  };

  const handleFillMohallaDefaults = () => {
    const defaultA = [
      "Bilal (C)",
      "Wasif",
      "Ali",
      "Hamza",
      "Zeeshan",
      "Daniyal",
      "Farhan",
      "Usman",
      "Kashif",
      "Saad",
      "Talha",
    ];
    const defaultB = [
      "Babar (C)",
      "Shaheen",
      "Rizwan (wk)",
      "Shadab",
      "Fakhar",
      "Naseem",
      "Rauf",
      "Iftikhar",
      "Amir",
      "Imad",
      "Asim",
    ];

    setTeamAName("Bahadurabad Kings");
    setTeamBName("Gulshan Gladiators");
    setTossWinner("Bahadurabad Kings");
    setTeamAPlayers(defaultA.slice(0, playersPerTeam));
    setTeamBPlayers(defaultB.slice(0, playersPerTeam));
    setCustomStriker(defaultA[0]);
    setCustomNonStriker(defaultA[1]);
    setCustomBowler(defaultB[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validations
    if (!teamAName.trim() || !teamBName.trim()) {
      setErrorMessage("Both team names are required.");
      return;
    }
    if (teamAName.trim().toLowerCase() === teamBName.trim().toLowerCase()) {
      setErrorMessage("Team names must be different.");
      return;
    }
    if (oversPerInnings < 1 || oversPerInnings > 50) {
      setErrorMessage("Overs per innings must be between 1 and 50.");
      return;
    }
    if (playersPerTeam < 2 || playersPerTeam > 15) {
      setErrorMessage("Players per team must be between 2 and 15.");
      return;
    }

    // Check empty player names
    const emptyPlayerA = teamAPlayers.some((p) => !p.trim());
    const emptyPlayerB = teamBPlayers.some((p) => !p.trim());
    if (emptyPlayerA || emptyPlayerB) {
      setErrorMessage("All player names must be filled in.");
      return;
    }

    if (!openingStriker || !openingNonStriker) {
      setErrorMessage("Please select both opening striker and non-striker.");
      return;
    }
    if (openingStriker === openingNonStriker) {
      setErrorMessage("Opening striker and non-striker must be different players.");
      return;
    }
    if (!openingBowler) {
      setErrorMessage("Please select the opening bowler.");
      return;
    }

    // Start match
    onStartMatch({
      teamAName: teamAName.trim(),
      teamBName: teamBName.trim(),
      oversPerInnings: Number(oversPerInnings),
      playersPerTeam: Number(playersPerTeam),
      tossWinner,
      tossDecision,
      teamAPlayers: teamAPlayers.map((p) => p.trim()),
      teamBPlayers: teamBPlayers.map((p) => p.trim()),
      openingStriker,
      openingNonStriker,
      openingBowler,
    });
  };

  if (isCollapsed) {
    return (
      <div className="setup-collapsed-bar">
        <div className="setup-collapsed-info">
          <span>Match: <strong>{teamAName}</strong> vs <strong>{teamBName}</strong> ({oversPerInnings} Overs, {playersPerTeam} Players)</span>
        </div>
        <button
          type="button"
          className="btn-toggle-setup"
          onClick={onToggleCollapse}
        >
          Edit Setup
        </button>
      </div>
    );
  }

  return (
    <div className="card match-setup-card">
      <div className="setup-card-header">
        <div>
          <h2 className="setup-title">Match Setup</h2>
          <p className="setup-subtitle">Set up teams, overs, and players to begin</p>
        </div>
        <button
          type="button"
          className="btn-quick-fill"
          onClick={handleFillMohallaDefaults}
          title="Fill sample player names"
        >
          Auto-fill Sample Players
        </button>
      </div>

      {errorMessage && <div className="alert-error">{errorMessage}</div>}

      <form onSubmit={handleSubmit} className="setup-form">
        {/* Row 1: Team Names */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Team A Name *</label>
            <input
              type="text"
              className="form-input"
              value={teamAName}
              onChange={(e) => handleTeamANameChange(e.target.value)}
              placeholder="e.g. Bahadurabad Kings"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Team B Name *</label>
            <input
              type="text"
              className="form-input"
              value={teamBName}
              onChange={(e) => handleTeamBNameChange(e.target.value)}
              placeholder="e.g. Gulshan Gladiators"
              required
            />
          </div>
        </div>

        {/* Row 2: Match Limits & Toss */}
        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">Overs per Innings</label>
            <select
              className="form-select"
              value={oversPerInnings}
              onChange={(e) => setOversPerInnings(Number(e.target.value))}
            >
              {[2, 4, 5, 6, 8, 10, 12, 15, 20].map((ov) => (
                <option key={ov} value={ov}>
                  {ov} Overs
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Players per Team</label>
            <select
              className="form-select"
              value={playersPerTeam}
              onChange={(e) => handlePlayersPerTeamChange(Number(e.target.value))}
            >
              {[4, 5, 6, 7, 8, 9, 10, 11].map((cnt) => (
                <option key={cnt} value={cnt}>
                  {cnt} Players
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Toss Winner</label>
            <select
              className="form-select"
              value={tossWinner}
              onChange={(e) => setTossWinner(e.target.value)}
            >
              <option value={teamAName}>{teamAName}</option>
              <option value={teamBName}>{teamBName}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Elected To</label>
            <select
              className="form-select"
              value={tossDecision}
              onChange={(e) => setTossDecision(e.target.value)}
            >
              <option value="bat">Bat First</option>
              <option value="bowl">Bowl First</option>
            </select>
          </div>
        </div>

        {/* Match Lineup Notice */}
        <div className="toss-summary-banner">
          <strong>{battingTeamName}</strong> will bat first, <strong>{bowlingTeamName}</strong> will bowl.
        </div>

        {/* Player Names Input Columns */}
        <div className="players-grid">
          {/* Team A Players */}
          <div className="team-players-column">
            <h3 className="column-title">
              {teamAName} Lineup ({teamAPlayers.length} players)
              {isTeamABatting && <span className="bat-tag">Batting First</span>}
            </h3>
            <div className="players-list">
              {teamAPlayers.map((player, idx) => (
                <div key={idx} className="player-input-row">
                  <span className="player-number">{idx + 1}.</span>
                  <input
                    type="text"
                    className="form-input player-input"
                    value={player}
                    onChange={(e) => handlePlayerNameChange("A", idx, e.target.value)}
                    placeholder={`Player ${idx + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Team B Players */}
          <div className="team-players-column">
            <h3 className="column-title">
              {teamBName} Lineup ({teamBPlayers.length} players)
              {!isTeamABatting && <span className="bat-tag">Batting First</span>}
            </h3>
            <div className="players-list">
              {teamBPlayers.map((player, idx) => (
                <div key={idx} className="player-input-row">
                  <span className="player-number">{idx + 1}.</span>
                  <input
                    type="text"
                    className="form-input player-input"
                    value={player}
                    onChange={(e) => handlePlayerNameChange("B", idx, e.target.value)}
                    placeholder={`Player ${idx + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opening Players Selectors */}
        <div className="opening-section">
          <h3 className="section-title">Select Opening Players</h3>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Opening Striker ({battingTeamName}) *</label>
              <select
                className="form-select"
                value={openingStriker}
                onChange={(e) => setCustomStriker(e.target.value)}
                required
              >
                <option value="">Select Striker</option>
                {battingPlayers.map((name, i) => (
                  <option key={i} value={name} disabled={name === openingNonStriker}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Opening Non-Striker ({battingTeamName}) *</label>
              <select
                className="form-select"
                value={openingNonStriker}
                onChange={(e) => setCustomNonStriker(e.target.value)}
                required
              >
                <option value="">Select Non-Striker</option>
                {battingPlayers.map((name, i) => (
                  <option key={i} value={name} disabled={name === openingStriker}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Opening Bowler ({bowlingTeamName}) *</label>
              <select
                className="form-select"
                value={openingBowler}
                onChange={(e) => setCustomBowler(e.target.value)}
                required
              >
                <option value="">Select Bowler</option>
                {bowlingPlayers.map((name, i) => (
                  <option key={i} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="setup-actions">
          <button type="submit" className="btn-start-match">
            Start Match
          </button>
        </div>
      </form>
    </div>
  );
}
