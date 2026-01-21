interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowHowItWorks?: () => void;
  showingHowItWorks?: boolean;
}

function Header({ theme, onToggleTheme, onShowHowItWorks, showingHowItWorks }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <a href="/" className="logo">
            <svg className="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1"/>
              <path d="M16 6L26 12V20L16 26L6 20V12L16 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M16 14V18M16 18L12 20M16 18L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="11" r="2" fill="currentColor"/>
            </svg>
            Judge My Prompt
          </a>

          <div className="privacy-badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L2 3.5V7.5C2 11.0899 4.58172 14.1274 8 15C11.4183 14.1274 14 11.0899 14 7.5V3.5L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6 8L7.5 9.5L10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Privacy-First
          </div>
        </div>

        <div className="header-right">
          {!showingHowItWorks && onShowHowItWorks && (
            <button className="how-it-works-link" onClick={onShowHowItWorks}>
              How does this work?
            </button>
          )}
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.64 5.64L4.22 4.22M19.78 19.78L18.36 18.36M5.64 18.36L4.22 19.78M19.78 4.22L18.36 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
