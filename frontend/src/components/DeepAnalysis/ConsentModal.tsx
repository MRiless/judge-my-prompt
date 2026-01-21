interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  return (
    <div className="modal-overlay" onClick={onDecline}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Deep Analysis - Privacy Notice</h2>
        </div>

        <div className="modal-body">
          <p>
            <strong>Your privacy matters.</strong> Deep Analysis uses an AI service to provide
            detailed, contextual feedback on your prompt.
          </p>

          <p>This means your prompt will be sent to an external AI API. Here's what you should know:</p>

          <ul>
            <li>Your prompt text will leave your browser</li>
            <li>It will be processed by the configured AI service</li>
            <li>We don't store or log your prompts on our servers</li>
            <li>This is the only time your data leaves your device</li>
          </ul>

          <p>
            If you're working with sensitive information, you may want to use only the
            local evaluation features instead.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onDecline}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onAccept}>
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsentModal;
