import { useEffect, useRef, useState } from 'react';
import './ChatWidget.css';

const LiveChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize chat with welcome message
  useEffect(() => {
    if (!user?.id) {
      console.log("No user ID available for chat:", user);
      return;
    }

    // Load existing messages from localStorage
    const storageKey = `chat_messages_${user.id}`;
    const savedMessages = localStorage.getItem(storageKey);
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        content: "Welcome to Tesla Wallet Support! How can we help you today?",
        sender_id: 'admin',
        timestamp: new Date().toISOString(),
        sender_name: 'Support Team'
      };
      setMessages([welcomeMessage]);
      localStorage.setItem(storageKey, JSON.stringify([welcomeMessage]));
    }
    
    setIsConnected(true);
  }, [user]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      const storageKey = `chat_messages_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, user]);

  const sendMessage = async () => {
    console.log("Send message clicked");
    console.log("Input:", input);
    console.log("User:", user);
    
    if (!input.trim()) {
      console.log("Input is empty, returning");
      return;
    }
    
    if (!user?.id) {
      console.warn("User ID missing", { userId: user?.id });
      return;
    }

    const messageContent = input.trim();
    setInput(''); // Clear input immediately

    // Create user message
    const userMessage = {
      id: Date.now(),
      content: messageContent,
      sender_id: user.id,
      timestamp: new Date().toISOString(),
      sender_name: user.fullname || user.email || 'You'
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);

    // Simulate admin response after 1-2 seconds
    setTimeout(() => {
      const responses = [
        "Thank you for your message. Our support team will assist you shortly.",
        "I understand your concern. Let me help you with that.",
        "That's a great question! Let me check that for you.",
        "I see what you mean. Here's what I can help you with...",
        "Thanks for reaching out! I'm here to help with any Tesla Wallet questions.",
        "Let me connect you with the right specialist for this inquiry."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const adminMessage = {
        id: Date.now() + 1,
        content: randomResponse,
        sender_id: 'admin',
        timestamp: new Date().toISOString(),
        sender_name: 'Support Agent'
      };
      
      setMessages(prev => [...prev, adminMessage]);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isConnected) {
    return (
      <div className="live-chat">
        <div className="chat-box d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Connecting to support...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-chat">
      <div className="chat-header bg-primary text-white p-2">
        <h6 className="mb-0">💬 Tesla Wallet Support</h6>
        <small>Connected - Online Support</small>
      </div>
      
      <div className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message mb-2 ${msg.sender_id === user.id ? 'user-message' : 'admin-message'}`}
          >
            <div className={`message-bubble ${msg.sender_id === user.id ? 'bg-primary text-white ms-auto' : 'bg-light'}`}>
              <p className="mb-1">{msg.content}</p>
              <small className={`d-block ${msg.sender_id === user.id ? 'text-white-50' : 'text-muted'}`}>
                {msg.sender_name} • {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input d-flex border-top">
        <input
          type="text"
          placeholder="Type your message..."
          className="form-control border-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ fontSize: '14px' }}
        />
        <button 
          className="btn btn-primary border-0 px-3" 
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
