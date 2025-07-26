import { useState } from "react";

const ChatBox = ({ chat, isAdmin = false }) => {
  const [messages, setMessages] = useState([
    { from: "User", text: "Hi there!" },
    { from: "Admin", text: "Hello! How can I help you?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;

    setMessages([...messages, { from: isAdmin ? "Admin" : "User", text: input }]);
    setInput("");
  };

  return (
    <div className="card shadow-sm p-3" style={{ width: "100%", height: "400px", overflowY: "auto" }}>
      <h5 className="mb-3">
        Chat with {chat?.name || "User"} {isAdmin && "(Admin view)"}
      </h5>

      <div className="mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <strong>{msg.from}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
