import { useEffect, useRef, useState } from 'react';
import socket from './socket'; // Make sure this is correct

const LiveChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch chatId on mount
  useEffect(() => {
    if (!user?.id) {
      console.log("No user ID available for chat:", user);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No auth token available for chat");
      return;
    }

    console.log("Fetching chat session for user:", user.id);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/start/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        console.log("Chat start response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Chat ID fetched:", data.chat_id);
        setChatId(data.chat_id);
        
        // Only emit socket events if socket exists
        if (socket) {
          socket.emit('join chat', data.chat_id);
        }
        
        // Load existing messages
        loadMessages(data.chat_id, token);
      })
      .catch(err => {
        console.error("Error starting chat:", err);
      });

    // Only set up socket listeners if socket exists
    if (socket) {
      socket.on('chat message', (msg) => {
        console.log("Message received:", msg);
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.off('chat message');
      };
    }
  }, [user]);

  // Load existing messages
  const loadMessages = async (chatId, token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const messages = await response.json();
        setMessages(messages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const sendMessage = async () => {
    console.log("Send message clicked");
    console.log("Input:", input);
    console.log("ChatId:", chatId);
    console.log("User:", user);
    
    if (!input.trim()) {
      console.log("Input is empty, returning");
      return;
    }
    if (!chatId || !user?.id) {
      console.warn("ChatID or user.id missing", { chatId, userId: user?.id });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No auth token, returning");
      return;
    }

    const messageContent = input.trim();
    setInput(''); // Clear input immediately
    console.log("Sending message:", messageContent);

    try {
      // If socket is available, use it
      if (socket) {
        const message = {
          chat_id: chatId,
          sender_id: user.id,
          content: messageContent,
          timestamp: new Date().toISOString(),
        };

        console.log("Sending message via socket:", message);
        socket.emit('chat message', message);
        setMessages((prev) => [...prev, message]);
      } else {
        // Fall back to HTTP API
        console.log("Using HTTP API to send message");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ content: messageContent })
        });

        console.log("HTTP response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Message sent successfully:", data);
          if (data.success) {
            setMessages((prev) => [...prev, data.message]);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to send message:', response.status, errorText);
          // Re-add the input if sending failed
          setInput(messageContent);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Re-add the input if sending failed
      setInput(messageContent);
    }
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
