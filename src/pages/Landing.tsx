import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Live Poker Tools</h1>
        <p>Tools for running live poker games</p>
      </header>

      <div className="tools-grid">
        <Link to="/poker-clock" className="tool-card">
          <div className="tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="tool-card-content">
            <h2>Poker Clock</h2>
            <p>Track action times and penalties</p>
          </div>
          <svg className="tool-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        <Link to="/poker-bank" className="tool-card">
          <div className="tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="6" y1="14" x2="10" y2="14" />
            </svg>
          </div>
          <div className="tool-card-content">
            <h2>Poker Bank</h2>
            <p>Manage buy-ins and settle up</p>
          </div>
          <svg className="tool-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default Landing;
