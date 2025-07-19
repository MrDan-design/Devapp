import { useState } from 'react';
import LiveChat from './LiveChat';

const ChatWidget = ({ user }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000 }}>
      {open && (
        <div className="card shadow" style={{ width: '300px', height: '400px' }}>
          <LiveChat user={user} />
        </div>
      )}

      <button
        className="btn btn-primary rounded-circle"
        style={{ width: '50px', height: '50px' }}
        onClick={() => setOpen(!open)}
      >
        💬
      </button>
    </div>
  );
};

export default ChatWidget;
