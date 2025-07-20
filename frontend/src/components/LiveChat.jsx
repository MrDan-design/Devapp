import { useEffect, useRef, useState } from 'react';
import socket from './socket'; // Make sure this is correct

const LiveChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch chatId on mount
  useEffect(() => {
    if (!user?.id) return;

    console.log("Fetching chat session for user:", user.id);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/start/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Chat ID fetched:", data.chat_id);
        setChatId(data.chat_id);
        socket.emit('join chat', data.chat_id);
      })
      .catch(err => {
        console.error("Error starting chat:", err);
      });

    socket.on('chat message', (msg) => {
      console.log("Message received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, [user]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!chatId || !user?.id) {
      console.warn("ChatID or user.id missing");
      return;
    }

    const message = {
      chat_id: chatId,
      sender_id: user.id,
      content: input,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending message:", message);

    socket.emit('chat message', message);
    setMessages((prev) => [...prev, message]);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="live-chat">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender_id === user.id ? 'user-message' : 'admin-message'}
          >
            <p>{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input d-flex">
        <input
          type="text"
          placeholder="Type a message..."
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
