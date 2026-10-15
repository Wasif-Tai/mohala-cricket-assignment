// Cricket Scoring Logic and State Management

/**
 * Format legal balls count to cricket overs notation (e.g. 15 -> "2.3")
 * @param {number} legalBalls
 * @returns {string}
 */
export function formatOvers(legalBalls = 0) {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
}

/**
 * Format bowler figures overs (e.g. 10 balls -> "1.4")
 * @param {number} balls
 * @returns {string}
 */
export function formatBowlerOvers(balls = 0) {
  const overs = Math.floor(balls / 6);
  const rem = balls % 6;
  return `${overs}.${rem}`;
}

/**
 * Calculate Current Run Rate (CRR)
 * @param {number} runs
 * @param {number} legalBalls
 * @returns {string}
 */
export function calculateRunRate(runs = 0, legalBalls = 0) {
  if (legalBalls === 0) return "0.00";
  const overs = legalBalls / 6;
  return (runs / overs).toFixed(2);
}

/**
 * Calculate Required Run Rate (RRR)
 * @param {number} runsNeeded
 * @param {number} ballsRemaining
 * @returns {string}
 */
export function calculateRequiredRunRate(runsNeeded = 0, ballsRemaining = 0) {
  if (runsNeeded <= 0) return "0.00";
  if (ballsRemaining <= 0) return "∞";
  const oversRemaining = ballsRemaining / 6;
  return (runsNeeded / oversRemaining).toFixed(2);
}

/**
 * Calculate Bowler Economy Rate
 * @param {number} runsConceded
 * @param {number} ballsBowled
 * @returns {string}
 */
export function calculateEconomy(runsConceded = 0, ballsBowled = 0) {
  if (ballsBowled === 0) return "0.00";
  const overs = ballsBowled / 6;
  return (runsConceded / overs).toFixed(2);
}

/**
 * Helper to initialize player stats structure
 */
function createBatterStats(name, isOpening = false) {
  return {
    name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    dismissal: "", // e.g. "b Usman", "c Babar b Shaheen"
    hasBatted: isOpening,
  };
}

function createBowlerStats(name) {
  return {
    name,
    ballsBowled: 0, // legal deliveries
    runsConceded: 0,
    wickets: 0,
    maidens: 0,
    wides: 0,
    noBalls: 0,
  };
}

/**
 * Initialize a brand new cricket match
 */
export function createInitialMatchState(config) {
  const {
    teamAName,
    teamBName,
    oversPerInnings,
    playersPerTeam,
    tossWinner,
    tossDecision,
    teamAPlayers,
    teamBPlayers,
    openingStriker,
    openingNonStriker,
    openingBowler,
  } = config;

  const isTeamABatting =
    (tossWinner === teamAName && tossDecision === "bat") ||
    (tossWinner === teamBName && tossDecision === "bowl");

  const battingTeamName = isTeamABatting ? teamAName : teamBName;
  const bowlingTeamName = isTeamABatting ? teamBName : teamAName;
  const battingPlayers = isTeamABatting ? [...teamAPlayers] : [...teamBPlayers];
  const bowlingPlayers = isTeamABatting ? [...teamBPlayers] : [...teamAPlayers];

  const initialBatters = {};
  battingPlayers.forEach((player) => {
    const isOpening = player === openingStriker || player === openingNonStriker;
    initialBatters[player] = createBatterStats(player, isOpening);
  });

  const initialBowlers = {};
  bowlingPlayers.forEach((player) => {
    initialBowlers[player] = createBowlerStats(player);
  });

  const innings1 = {
    battingTeam: battingTeamName,
    bowlingTeam: bowlingTeamName,
    battingPlayers,
    bowlingPlayers,
    runs: 0,
    wickets: 0,
    legalBalls: 0,
    striker: openingStriker,
    nonStriker: openingNonStriker,
    currentBowler: openingBowler,
    previousBowler: null,
    batters: initialBatters,
    bowlers: initialBowlers,
    extras: {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      total: 0,
    },
    currentOver: {
      overNumber: 1,
      bowler: openingBowler,
      deliveries: [],
      runsConceded: 0,
      legalBallsInOver: 0,
    },
    oversHistory: [],
    allDeliveries: [],
    isCompleted: false,
  };

  return {
    id: "match_" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "live", // "setup" | "live" | "innings_break" | "finished"
    currentInnings: 1,
    oversPerInnings: Number(oversPerInnings),
    playersPerTeam: Number(playersPerTeam),
    teamA: {
      name: teamAName,
      players: teamAPlayers,
    },
    teamB: {
      name: teamBName,
      players: teamBPlayers,
    },
    toss: {
      winner: tossWinner,
      decision: tossDecision,
    },
    innings1,
    innings2: null,
    history: [], // snapshot stack for reliable undo
    needsNewBowler: false,
    needsNewBatter: false,
    dismissedBatterRole: null, // "striker" | "nonStriker"
    result: null, // { winner: string, margin: string, description: string }
  };
}

/**
 * Record a scoring delivery and return updated match state
 * @param {Object} state - Current match state
 * @param {Object} delivery - Delivery details
 * @returns {Object} Updated match state
 */
export function recordDelivery(state, delivery) {
  // Deep clone current state to save in history stack for flawless undo
  const previousState = JSON.parse(JSON.stringify(state));
  delete previousState.history; // Avoid memory explosion in snapshot

  const newState = JSON.parse(JSON.stringify(state));
  const currentInningsKey = newState.currentInnings === 1 ? "innings1" : "innings2";
  const inn = newState[currentInningsKey];

  if (!inn || inn.isCompleted || newState.status === "finished") {
    return state;
  }

  const { striker, nonStriker, currentBowler } = inn;

  // Ensure current batter & bowler stats exist
  if (!inn.batters[striker]) inn.batters[striker] = createBatterStats(striker, true);
  if (!inn.batters[nonStriker]) inn.batters[nonStriker] = createBatterStats(nonStriker, true);
  if (!inn.bowlers[currentBowler]) inn.bowlers[currentBowler] = createBowlerStats(currentBowler);

  const strikerStats = inn.batters[striker];
  const bowlerStats = inn.bowlers[currentBowler];

  let isLegal;
  let runsAddedToTeam = 0;
  let runsConcededByBowler = 0;
  let shouldRotateStrike = false;
  let wicketEvent = null;
  let ballLabel;
  let commentary = "";

  switch (delivery.type) {
    case "runs": {
      const runs = Number(delivery.runs);
      isLegal = true;
      runsAddedToTeam = runs;
      runsConcededByBowler = runs;

      strikerStats.runs += runs;
      strikerStats.balls += 1;
      if (runs === 4) strikerStats.fours += 1;
      if (runs === 6) strikerStats.sixes += 1;

      ballLabel = runs === 0 ? "0" : `${runs}`;
      commentary =
        runs === 0
          ? `${currentBowler} to ${striker}: dot ball.`
          : runs === 4
          ? `${currentBowler} to ${striker}: FOUR runs!`
          : runs === 6
          ? `${currentBowler} to ${striker}: SIX runs! Massive hit!`
          : `${currentBowler} to ${striker}: ${runs} run${runs > 1 ? "s" : ""}.`;

      if (runs % 2 === 1) {
        shouldRotateStrike = true;
      }
      break;
    }

    case "wide": {
      // Wide is illegal, default 1 run + any extras
      isLegal = false;
      const extraRuns = Number(delivery.additionalRuns || 0);
      const totalWideRuns = 1 + extraRuns;

      runsAddedToTeam = totalWideRuns;
      runsConcededByBowler = totalWideRuns;

      inn.extras.wides += totalWideRuns;
      inn.extras.total += totalWideRuns;
      bowlerStats.wides += 1;

      ballLabel = totalWideRuns === 1 ? "Wd" : `${totalWideRuns}Wd`;
      commentary = `${currentBowler} bowls a Wide! (+${totalWideRuns} run${totalWideRuns > 1 ? "s" : ""})`;

      // If odd running runs occurred on wide
      if (extraRuns % 2 === 1) {
        shouldRotateStrike = true;
      }
      break;
    }

    case "no_ball": {
      // No-ball is illegal, 1 penalty + runs off bat / byes
      isLegal = false;
      const batRuns = Number(delivery.batRuns || 0);
      const isByeOrLegBye = delivery.isBye || false;
      const totalNbRuns = 1 + batRuns;

      runsAddedToTeam = totalNbRuns;
      inn.extras.noBalls += 1;
      inn.extras.total += 1;
      bowlerStats.noBalls += 1;

      if (!isByeOrLegBye && batRuns > 0) {
        // Runs off bat
        runsConcededByBowler = totalNbRuns;
        strikerStats.runs += batRuns;
        strikerStats.balls += 1;
        if (batRuns === 4) strikerStats.fours += 1;
        if (batRuns === 6) strikerStats.sixes += 1;
      } else if (isByeOrLegBye && batRuns > 0) {
        // Byes off no-ball
        runsConcededByBowler = 1;
        inn.extras.byes += batRuns;
        inn.extras.total += batRuns;
        strikerStats.balls += 1;
      } else {
        // Pure No-ball
        runsConcededByBowler = 1;
      }

      ballLabel = batRuns > 0 ? `${totalNbRuns}Nb` : "Nb";
      commentary = `${currentBowler} bowls a No-ball! (+${totalNbRuns} run${totalNbRuns > 1 ? "s" : ""})`;

      if (batRuns % 2 === 1) {
        shouldRotateStrike = true;
      }
      break;
    }

    case "bye":
    case "leg_bye": {
      // Legal ball, added to extras, not credited to batter, not charged to bowler
      isLegal = true;
      const runs = Number(delivery.runs || 1);
      runsAddedToTeam = runs;
      strikerStats.balls += 1;

      if (delivery.type === "bye") {
        inn.extras.byes += runs;
        ballLabel = runs === 1 ? "B" : `${runs}B`;
        commentary = `${currentBowler} to ${striker}: ${runs} Bye${runs > 1 ? "s" : ""}.`;
      } else {
        inn.extras.legByes += runs;
        ballLabel = runs === 1 ? "Lb" : `${runs}Lb`;
        commentary = `${currentBowler} to ${striker}: ${runs} Leg-bye${runs > 1 ? "s" : ""}.`;
      }
      inn.extras.total += runs;

      if (runs % 2 === 1) {
        shouldRotateStrike = true;
      }
      break;
    }

    case "wicket": {
      // Wicket delivery
      isLegal = true; // standard dismissal on legal ball
      const dismissalType = delivery.dismissalType || "bowled";
      const fielder = delivery.fielder || "";
      const outBatterRole = delivery.outBatterRole || "striker"; // "striker" | "nonStriker"
      const runsCompleted = Number(delivery.runsCompleted || 0);

      const dismissedPlayerName = outBatterRole === "striker" ? striker : nonStriker;
      const dismissedStats = inn.batters[dismissedPlayerName] || strikerStats;

      if (outBatterRole === "striker") {
        dismissedStats.balls += 1;
      }

      // If runs were completed (e.g. on Run Out)
      if (runsCompleted > 0) {
        runsAddedToTeam += runsCompleted;
        if (outBatterRole === "striker") {
          dismissedStats.runs += runsCompleted;
        } else {
          strikerStats.runs += runsCompleted;
        }
        if (dismissalType !== "run_out") {
          runsConcededByBowler += runsCompleted;
        }
        if (runsCompleted % 2 === 1) {
          shouldRotateStrike = true;
        }
      }

      // Mark batter out
      dismissedStats.isOut = true;

      // Format dismissal string
      let dismissalText = "";
      if (dismissalType === "bowled") {
        dismissalText = `b ${currentBowler}`;
        bowlerStats.wickets += 1;
        commentary = `OUT! ${striker} is Bowled by ${currentBowler}! Clean bowled!`;
      } else if (dismissalType === "caught") {
        dismissalText = fielder ? `c ${fielder} b ${currentBowler}` : `c & b ${currentBowler}`;
        bowlerStats.wickets += 1;
        commentary = `OUT! ${striker} is Caught${fielder ? " by " + fielder : ""} off ${currentBowler}!`;
      } else if (dismissalType === "lbw") {
        dismissalText = `lbw b ${currentBowler}`;
        bowlerStats.wickets += 1;
        commentary = `OUT! ${striker} is LBW to ${currentBowler}! Dead in front!`;
      } else if (dismissalType === "stumped") {
        dismissalText = fielder ? `st ${fielder} b ${currentBowler}` : `st b ${currentBowler}`;
        bowlerStats.wickets += 1;
        commentary = `OUT! ${striker} is Stumped${fielder ? " by " + fielder : ""} off ${currentBowler}!`;
      } else if (dismissalType === "run_out") {
        dismissalText = fielder ? `run out (${fielder})` : `run out`;
        // Bowler does NOT get wicket credit in cricket for run outs
        commentary = `OUT! ${dismissedPlayerName} is Run Out${fielder ? " by " + fielder : ""}!`;
      }

      dismissedStats.dismissal = dismissalText;
      inn.wickets += 1;
      ballLabel = "W";

      wicketEvent = {
        dismissalType,
        dismissedPlayer: dismissedPlayerName,
        dismissedRole: outBatterRole,
        fielder,
        bowler: currentBowler,
        description: dismissalText,
      };

      // Check if team is all out
      const maxWickets = newState.playersPerTeam - 1;
      if (inn.wickets < maxWickets) {
        // Need incoming batter
        newState.needsNewBatter = true;
        newState.dismissedBatterRole = outBatterRole;
        if (delivery.newBatter) {
          // If caller already supplied incoming batter
          assignNewBatter(newState, delivery.newBatter, outBatterRole);
          newState.needsNewBatter = false;
          newState.dismissedBatterRole = null;
        }
      }
      break;
    }

    default:
      return state;
  }

  // Update team totals
  inn.runs += runsAddedToTeam;
  bowlerStats.runsConceded += runsConcededByBowler;

  if (isLegal) {
    inn.legalBalls += 1;
    bowlerStats.ballsBowled += 1;
    inn.currentOver.legalBallsInOver += 1;
  }

  inn.currentOver.runsConceded += runsAddedToTeam;

  // Record this individual delivery
  const deliveryRecord = {
    id: "ball_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    ballNumber: inn.legalBalls,
    overNumber: inn.currentOver.overNumber,
    ballInOver: inn.currentOver.legalBallsInOver,
    isLegal,
    type: delivery.type,
    label: ballLabel,
    runs: runsAddedToTeam,
    striker,
    nonStriker,
    bowler: currentBowler,
    wicket: wicketEvent,
    commentary,
  };

  inn.currentOver.deliveries.push(deliveryRecord);
  inn.allDeliveries.push(deliveryRecord);

  // Check strike rotation from running runs
  if (shouldRotateStrike) {
    const temp = inn.striker;
    inn.striker = inn.nonStriker;
    inn.nonStriker = temp;
  }

  // Check over completion (6 legal balls in current over)
  if (inn.currentOver.legalBallsInOver === 6) {

    // Check maiden over
    if (inn.currentOver.runsConceded === 0) {
      bowlerStats.maidens += 1;
    }

    // Push completed over to oversHistory
    inn.oversHistory.push({
      ...inn.currentOver,
      bowler: currentBowler,
    });

    // In cricket, strike changes at end of over
    const temp = inn.striker;
    inn.striker = inn.nonStriker;
    inn.nonStriker = temp;

    // Prepare next over container if innings not done
    const nextOverNumber = inn.currentOver.overNumber + 1;
    inn.currentOver = {
      overNumber: nextOverNumber,
      bowler: "",
      deliveries: [],
      runsConceded: 0,
      legalBallsInOver: 0,
    };

    inn.previousBowler = currentBowler;
    inn.currentBowler = "";
    newState.needsNewBowler = true;
  }

  // Save previous state to history stack for UNDO
  newState.history = [...(state.history || []), previousState];

  // Check for innings end or match end
  checkMatchStatus(newState);

  return newState;
}

/**
 * Assign incoming batter after a wicket
 */
export function assignNewBatter(state, newBatterName, outBatterRole = "striker") {
  const currentInningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
  const inn = state[currentInningsKey];
  if (!inn) return state;

  if (!inn.batters[newBatterName]) {
    inn.batters[newBatterName] = createBatterStats(newBatterName, true);
  } else {
    inn.batters[newBatterName].hasBatted = true;
  }

  if (outBatterRole === "striker") {
    inn.striker = newBatterName;
  } else {
    inn.nonStriker = newBatterName;
  }

  state.needsNewBatter = false;
  state.dismissedBatterRole = null;
  return state;
}

/**
 * Assign new bowler for the over or bowler change
 */
export function assignNewBowler(state, newBowlerName) {
  const currentInningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
  const inn = state[currentInningsKey];
  if (!inn) return state;

  inn.currentBowler = newBowlerName;
  inn.currentOver.bowler = newBowlerName;
  if (!inn.bowlers[newBowlerName]) {
    inn.bowlers[newBowlerName] = createBowlerStats(newBowlerName);
  }

  state.needsNewBowler = false;
  return state;
}

/**
 * Check match status: innings 1 completion, 2nd innings chase, tie, all out, overs complete
 */
export function checkMatchStatus(state) {
  const maxOvers = state.oversPerInnings;
  const maxLegalBalls = maxOvers * 6;
  const maxWickets = state.playersPerTeam - 1;

  if (state.currentInnings === 1) {
    const inn1 = state.innings1;
    const isAllOut = inn1.wickets >= maxWickets;
    const isOversFinished = inn1.legalBalls >= maxLegalBalls;

    if (isAllOut || isOversFinished || inn1.isDeclaredOrEnded) {
      inn1.isCompleted = true;
      state.status = "innings_break";
      state.needsNewBowler = false;
      state.needsNewBatter = false;
    }
  } else if (state.currentInnings === 2) {
    const inn1 = state.innings1;
    const inn2 = state.innings2;
    if (!inn2) return;

    const target = inn1.runs + 1;
    const isAllOut = inn2.wickets >= maxWickets;
    const isOversFinished = inn2.legalBalls >= maxLegalBalls;

    // Check if target is achieved by chasing team
    if (inn2.runs >= target) {
      inn2.isCompleted = true;
      state.status = "finished";
      const remainingWickets = maxWickets - inn2.wickets;
      state.result = {
        winner: inn2.battingTeam,
        margin: `${remainingWickets} wicket${remainingWickets > 1 ? "s" : ""}`,
        description: `${inn2.battingTeam} won by ${remainingWickets} wicket${remainingWickets > 1 ? "s" : ""}!`,
        isTie: false,
      };
      state.needsNewBowler = false;
      state.needsNewBatter = false;
      return;
    }

    // Check if innings ended (all out or overs finished)
    if (isAllOut || isOversFinished || inn2.isDeclaredOrEnded) {
      inn2.isCompleted = true;
      state.status = "finished";
      state.needsNewBowler = false;
      state.needsNewBatter = false;

      if (inn2.runs === inn1.runs) {
        state.result = {
          winner: "Tied",
          margin: "Match Tied",
          description: `Scores are level (${inn1.runs} - ${inn2.runs}). The match is Tied!`,
          isTie: true,
        };
      } else if (inn2.runs < inn1.runs) {
        const runDiff = inn1.runs - inn2.runs;
        state.result = {
          winner: inn1.battingTeam,
          margin: `${runDiff} run${runDiff > 1 ? "s" : ""}`,
          description: `${inn1.battingTeam} won by ${runDiff} run${runDiff > 1 ? "s" : ""}!`,
          isTie: false,
        };
      }
    }
  }
}

/**
 * Start 2nd innings
 */
export function startSecondInnings(state, { openingStriker, openingNonStriker, openingBowler }) {
  const inn1 = state.innings1;
  const battingTeamName = inn1.bowlingTeam;
  const bowlingTeamName = inn1.battingTeam;
  const battingPlayers = [...inn1.bowlingPlayers];
  const bowlingPlayers = [...inn1.battingPlayers];

  const initialBatters = {};
  battingPlayers.forEach((player) => {
    const isOpening = player === openingStriker || player === openingNonStriker;
    initialBatters[player] = createBatterStats(player, isOpening);
  });

  const initialBowlers = {};
  bowlingPlayers.forEach((player) => {
    initialBowlers[player] = createBowlerStats(player);
  });

  state.currentInnings = 2;
  state.status = "live";
  state.needsNewBowler = false;
  state.needsNewBatter = false;

  state.innings2 = {
    battingTeam: battingTeamName,
    bowlingTeam: bowlingTeamName,
    battingPlayers,
    bowlingPlayers,
    runs: 0,
    wickets: 0,
    legalBalls: 0,
    target: inn1.runs + 1,
    striker: openingStriker,
    nonStriker: openingNonStriker,
    currentBowler: openingBowler,
    previousBowler: null,
    batters: initialBatters,
    bowlers: initialBowlers,
    extras: {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      total: 0,
    },
    currentOver: {
      overNumber: 1,
      bowler: openingBowler,
      deliveries: [],
      runsConceded: 0,
      legalBallsInOver: 0,
    },
    oversHistory: [],
    allDeliveries: [],
    isCompleted: false,
  };

  return { ...state };
}

/**
 * Undo last scored delivery
 */
export function undoLastDelivery(state) {
  if (!state.history || state.history.length === 0) {
    return state;
  }

  // Pop last snapshot
  const newHistory = [...state.history];
  const previousState = newHistory.pop();

  return {
    ...previousState,
    history: newHistory,
  };
}
