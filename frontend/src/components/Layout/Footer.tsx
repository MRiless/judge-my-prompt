import { primarySupportLink } from '../../config/affiliates';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          All prompt evaluation happens in your browser. Your prompts never leave your device unless you choose Deep Analysis.
        </p>
        <a
          href={primarySupportLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="support-button"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748z"/>
          </svg>
          Support this project
        </a>
      </div>
    </footer>
  );
}

export default Footer;
