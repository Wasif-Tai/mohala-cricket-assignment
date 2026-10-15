import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import MatchSetup from "./components/MatchSetup";
import Scoreboard from "./components/Scoreboard";
import ScoringControls from "./components/ScoringControls";
import OverHistory from "./components/OverHistory";
import WicketModal from "./components/WicketModal";
import ExtrasModal from "./components/ExtrasModal";
import BowlerModal from "./components/BowlerModal";
import InningsBreakModal from "./components/InningsBreakModal";
import MatchSummaryModal from "./components/MatchSummaryModal";
import ConfirmModal from "./components/ConfirmModal";

import {
  createInitialMatchState,
  recordDelivery,
  assignNewBowler,
  startSecondInnings,
  undoLastDelivery,
} from "./utils/cricketRules";

import {
  saveMatch,
  loadActiveMatchLocal,
  clearActiveMatchLocal,
} from "./services/storageService";

import "./App.css";

export default function App() {
  const [matchState, setMatchState] = useState(() => loadActiveMatchLocal());
  const [cloudSynced, setCloudSynced] = useState(false);
  const [isSetupCollapsed, setIsSetupCollapsed] = useState(true);

  // Modal States
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [extrasModalType, setExtrasModalType] = useState("wide");
  const [isBowlerModalOpen, setIsBowlerModalOpen] = useState(false);
  const [isMatchSummaryOpen, setIsMatchSummaryOpen] = useState(false);
  const [isMatchSummaryDismissed, setIsMatchSummaryDismissed] = useState(false);

  // Confirmation Dialog States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Test cloud connection on mount if match exists
  useEffect(() => {
    const saved = loadActiveMatchLocal();
    if (saved && saved.id) {
      saveMatch(saved).then((res) => setCloudSynced(res.cloudSynced));
    }
  }, []);

  // Sync to Storage whenever matchState changes
  const persistState = useCallback(async (state) => {
    if (!state) return;
    const res = await saveMatch(state);
    setCloudSynced(res.cloudSynced);
  }, []);

  const updateStateAndPersist = (updater) => {
    setMatchState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistState(next);
      return next;
    });
  };

  // Start New Match from Setup Form
  const handleStartMatch = (config) => {
    const initial = createInitialMatchState(config);
    updateStateAndPersist(initial);
    setIsSetupCollapsed(true);
  };

  // Record Standard Runs (0, 1, 2, 3, 4, 6)
  const handleScoreRuns = (runs) => {
    if (!matchState) return;
    updateStateAndPersist((curr) => recordDelivery(curr, { type: "runs", runs }));
  };

  // Record Extras (Wide, No-ball, Bye, Leg-bye)
  const handleConfirmExtra = (extraData) => {
    if (!matchState) return;
    updateStateAndPersist((curr) => recordDelivery(curr, extraData));
    setIsExtrasModalOpen(false);
  };

  // Record Wicket
  const handleConfirmWicket = (wicketDetails) => {
    if (!matchState) return;
    updateStateAndPersist((curr) =>
      recordDelivery(curr, {
        type: "wicket",
        ...wicketDetails,
      })
    );
    setIsWicketModalOpen(false);
  };

  // Bowler Selection (Over Complete or Manual Switch)
  const handleSelectBowler = (bowlerName) => {
    if (!matchState) return;
    updateStateAndPersist((curr) => assignNewBowler(curr, bowlerName));
    setIsBowlerModalOpen(false);
  };

  // Manual Strike Swap (if scorers need to adjust who is facing)
  const handleSwapStrike = () => {
    if (!matchState) return;
    updateStateAndPersist((curr) => {
      const copy = JSON.parse(JSON.stringify(curr));
      const key = copy.currentInnings === 1 ? "innings1" : "innings2";
      const inn = copy[key];
      if (inn) {
        const temp = inn.striker;
        inn.striker = inn.nonStriker;
        inn.nonStriker = temp;
      }
      return copy;
    });
  };

  // Undo Last Delivery
  const handleUndo = () => {
    if (!matchState) return;
    updateStateAndPersist((curr) => undoLastDelivery(curr));
  };

  // Start Second Innings
  const handleStartSecondInnings = (lineup) => {
    if (!matchState) return;
    updateStateAndPersist((curr) => startSecondInnings(curr, lineup));
  };

  // End Current Innings Prompt
  const handleEndInningsPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: "End Current Innings?",
      message:
        matchState?.currentInnings === 1
          ? "Are you sure you want to end the 1st innings? This will set the target and advance to Innings Break."
          : "Are you sure you want to declare / end the 2nd innings? This will conclude the match.",
      confirmVariant: "warning",
      onConfirm: () => {
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        updateStateAndPersist((curr) => {
          const copy = JSON.parse(JSON.stringify(curr));
          const key = copy.currentInnings === 1 ? "innings1" : "innings2";
          if (copy[key]) {
            copy[key].isDeclaredOrEnded = true;
          }
          if (copy.currentInnings === 1) {
            copy.status = "innings_break";
          } else {
            copy.status = "finished";
          }
          return copy;
        });
      },
    });
  };

  // Finish Match Prompt
  const handleFinishMatchPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Conclude Match?",
      message:
        "Are you sure you want to finish the match? The final winner and scorecard will be presented.",
      confirmVariant: "danger",
      onConfirm: () => {
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        updateStateAndPersist((curr) => {
          const copy = JSON.parse(JSON.stringify(curr));
          copy.status = "finished";
          if (!copy.result) {
            copy.result = {
              winner: "Match Concluded",
              margin: "",
              description: "Match was officially finished by scorer.",
              isTie: false,
            };
          }
          return copy;
        });
        setIsMatchSummaryOpen(true);
      },
    });
  };

  // Reset Match to Setup Screen
  const handleResetMatchPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Start a New Match?",
      message:
        "This will clear the current match from local and cloud storage. Are you sure you want to reset?",
      confirmVariant: "danger",
      onConfirm: () => {
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        clearActiveMatchLocal();
        setMatchState(null);
        setIsSetupCollapsed(false);
      },
    });
  };

  // Derived Modal Open States
  const showBowlerModal =
    isBowlerModalOpen || Boolean(matchState?.needsNewBowler && matchState?.status === "live");
  const showMatchSummary =
    isMatchSummaryOpen || Boolean(matchState?.status === "finished" && !isMatchSummaryDismissed);

  // Current active innings data
  const currentInningsKey = matchState?.currentInnings === 1 ? "innings1" : "innings2";
  const activeInnings = matchState?.[currentInningsKey];

  // Batters remaining on bench for incoming wicket
  const availableBatters = [];
  if (activeInnings && matchState) {
    const allBattingPlayers = activeInnings.battingPlayers || [];
    allBattingPlayers.forEach((player) => {
      const stats = activeInnings.batters[player];
      const isCurrentlyBatting =
        player === activeInnings.striker || player === activeInnings.nonStriker;
      if (!isCurrentlyBatting && (!stats || !stats.isOut)) {
        availableBatters.push(player);
      }
    });
  }

  const isAllOutNext =
    activeInnings &&
    activeInnings.wickets + 1 >= (matchState?.playersPerTeam || 11) - 1;

  const canUndo = (matchState?.history && matchState.history.length > 0) || false;

  return (
    <div className="cricket-app-layout">
      {/* App Header */}
      <Header
        matchStatus={matchState ? matchState.status : "setup"}
        cloudSynced={cloudSynced}
        onResetMatch={handleResetMatchPrompt}
        isMatchActive={Boolean(matchState)}
      />

      <main className="main-container">
        {/* Match Setup Form (Shown if no active match or expanded) */}
        {(!matchState || !isSetupCollapsed) && (
          <MatchSetup
            onStartMatch={handleStartMatch}
            isCollapsed={Boolean(matchState && isSetupCollapsed)}
            onToggleCollapse={() => setIsSetupCollapsed(!isSetupCollapsed)}
          />
        )}

        {/* Collapsed Bar if match is active */}
        {matchState && isSetupCollapsed && (
          <div className="setup-collapsed-bar">
            <div className="setup-collapsed-info">
              <span>
                🏏 <strong>{matchState.teamA.name}</strong> vs{" "}
                <strong>{matchState.teamB.name}</strong> ({matchState.oversPerInnings} Overs,{" "}
                {matchState.playersPerTeam} Players)
              </span>
            </div>
            <button
              type="button"
              className="btn-toggle-setup"
              onClick={() => setIsSetupCollapsed(false)}
            >
              View Setup Details
            </button>
          </div>
        )}

        {/* Live Scoring View */}
        {matchState && (
          <>
            {/* 1. Scoreboard Card */}
            <Scoreboard matchState={matchState} />

            {/* 2. Ball-by-Ball Scoring Controls */}
            <ScoringControls
              onScoreRuns={handleScoreRuns}
              onOpenWicketModal={() => setIsWicketModalOpen(true)}
              onOpenExtrasModal={(type) => {
                setExtrasModalType(type);
                setIsExtrasModalOpen(true);
              }}
              onOpenBowlerModal={() => setIsBowlerModalOpen(true)}
              onUndo={handleUndo}
              onSwapStrike={handleSwapStrike}
              onEndInningsPrompt={handleEndInningsPrompt}
              onFinishMatchPrompt={handleFinishMatchPrompt}
              canUndo={canUndo}
              currentBowler={activeInnings?.currentBowler}
              isOverPending={Boolean(matchState.needsNewBowler)}
              isMatchFinished={matchState.status === "finished"}
            />

            {/* 3. Over History & Timeline */}
            <OverHistory
              currentOver={activeInnings?.currentOver || { deliveries: [] }}
              oversHistory={activeInnings?.oversHistory || []}
              onUndo={handleUndo}
              canUndo={canUndo}
            />
          </>
        )}
      </main>

      {/* Contextual Modals */}
      {/* 1. Wicket Modal */}
      {isWicketModalOpen && activeInnings && (
        <WicketModal
          isOpen={isWicketModalOpen}
          onClose={() => setIsWicketModalOpen(false)}
          onConfirmWicket={handleConfirmWicket}
          striker={activeInnings.striker}
          nonStriker={activeInnings.nonStriker}
          currentBowler={activeInnings.currentBowler}
          availableBatters={availableBatters}
          bowlingPlayers={activeInnings.bowlingPlayers || []}
          isAllOutNext={isAllOutNext}
        />
      )}

      {/* 2. Extras Modal */}
      {isExtrasModalOpen && (
        <ExtrasModal
          isOpen={isExtrasModalOpen}
          onClose={() => setIsExtrasModalOpen(false)}
          onConfirmExtra={handleConfirmExtra}
          defaultType={extrasModalType}
        />
      )}

      {/* 3. Bowler Selection Modal */}
      {showBowlerModal && activeInnings && (
        <BowlerModal
          isOpen={showBowlerModal}
          onClose={() => setIsBowlerModalOpen(false)}
          onSelectBowler={handleSelectBowler}
          bowlingPlayers={activeInnings.bowlingPlayers || []}
          previousBowler={activeInnings.previousBowler}
          currentBowler={activeInnings.currentBowler}
          bowlersStats={activeInnings.bowlers || {}}
          isOverChange={Boolean(matchState?.needsNewBowler)}
        />
      )}

      {/* 4. Innings Break Modal */}
      {matchState?.status === "innings_break" && (
        <InningsBreakModal
          isOpen={true}
          matchState={matchState}
          onStartSecondInnings={handleStartSecondInnings}
        />
      )}

      {/* 5. Match Summary & Result Modal */}
      {showMatchSummary && matchState && (
        <MatchSummaryModal
          isOpen={showMatchSummary}
          matchState={matchState}
          onClose={() => {
            setIsMatchSummaryOpen(false);
            setIsMatchSummaryDismissed(true);
          }}
          onNewMatch={() => {
            setIsMatchSummaryOpen(false);
            setIsMatchSummaryDismissed(true);
            handleResetMatchPrompt();
          }}
        />
      )}

      {/* 6. Confirmation Modal */}
      {confirmDialog.isOpen && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmVariant={confirmDialog.confirmVariant}
          onConfirm={confirmDialog.onConfirm}
          onClose={() =>
            setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })
          }
        />
      )}
    </div>
  );
}
