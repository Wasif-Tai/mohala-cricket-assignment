export default function Header({ matchStatus, cloudSynced, onResetMatch, isMatchActive }) {
  const getStatusBadge = () => {
    switch (matchStatus) {
      case "setup":
        return <span className="status-badge status-setup">Setup</span>;
      case "live":
        return <span className="status-badge status-live">Live</span>;
      case "innings_break":
        return <span className="status-badge status-break">Innings Break</span>;
      case "finished":
        return <span className="status-badge status-finished">Finished</span>;
      default:
        return null;
    }
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <h1 className="brand-title">Mohalla Cricket</h1>
        <span className="brand-divider">/</span>
        <span className="brand-subtitle">Scorer</span>
      </div>

      <div className="header-actions">
        {getStatusBadge()}

        <span
          className={`cloud-sync-badge ${cloudSynced ? "synced" : "offline"}`}
          title={cloudSynced ? "Synced to Cloud" : "Saved in Local Storage (Offline)"}
        >
          <span className="sync-dot"></span>
          {cloudSynced ? "Cloud" : "Offline"}
        </span>

        {isMatchActive && (
          <button
            type="button"
            className="btn-reset-match"
            onClick={onResetMatch}
            title="Start a new match"
          >
            New Match
          </button>
        )}
      </div>
    </header>
  );
}
