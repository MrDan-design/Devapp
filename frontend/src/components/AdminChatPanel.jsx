// AdminChatPanel.jsx
import { useState, useEffect, useRef } from "react";
import socket from "./socket";

const AdminChatPanel = () => {
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/admin/chats`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched chats:", data);
      setChats(data);
    })
    .catch((err) => console.error("Failed to fetch chats", err));
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("chat message");
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const message = {
        sender_id: "admin",
        content: input,
        timestamp: new Date().toISOString(),
      };
      socket.emit("chat message", message);
      setMessages((prev) => [...prev, message]);
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 3000 }}>
      {open && (
        <div className="card-header d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center w-100 mb-2">
          <strong>Support Chat</strong>
          <button className="btn-close" onClick={() => setOpen(false)} />
        </div>

          <div className="card-body overflow-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.sender_id === "admin" ? "text-end" : ""}`}>
                <small className="d-block">{msg.content}</small>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="card-footer">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Type message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating icon */}
      <button
        className="btn btn-primary rounded-circle"
        style={{ width: "50px", height: "50px" }}
        onClick={() => setOpen(!open)}
      >
        💬
      </button>
    </div>
  );
};

export default AdminChatPanel;
