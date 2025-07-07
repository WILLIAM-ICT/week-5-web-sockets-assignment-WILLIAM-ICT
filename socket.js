// === client/src/socket/socket.js ===
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
export default socket;

// === client/src/App.jsx ===
import React, { useState, useEffect } from 'react';
import socket from './socket/socket';

function App() {
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    socket.emit('join_room', room);

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('typing', (id) => {
      setTypingUser(id);
      setTimeout(() => setTypingUser(null), 2000);
    });

    socket.on('read_receipt', (data) => {
      console.log('Message read:', data);
    });

    return () => {
      socket.off();
    };
  }, [room]);

  const sendMessage = () => {
    const data = { room, message, author: socket.id };
    socket.emit('send_message', data);
    setMessage('');
    socket.emit('read_receipt', { room, message });
  };

  const handleTyping = () => {
    socket.emit('typing', room);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat Room: {room}</h2>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}><b>{msg.author}</b>: {msg.message}</div>
        ))}
        {typingUser && <p>{typingUser} is typing...</p>}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleTyping}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
