// src/components/ChatBox.jsx
import React from "react";

const ChatBox = ({ chat, isAdmin }) => {
  return (
    <div className="card p-3">
      <h5>Chat with {chat?.name || "Unknown User"}</h5>
      <div className="chat-body">
        {/* Put your chat messages & input here */}
        <p>Admin mode: {isAdmin ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};

export default ChatBox;
