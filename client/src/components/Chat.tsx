import { useState, useEffect, useRef } from 'react';
import { socket } from '../hooks/useSocket';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatProps {
  roomId: string;
}

export default function Chat({ roomId }: ChatProps) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('chatMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!socket || !input.trim()) return;

    socket.emit('chatMessage', {
      roomId,
      content: input.trim(),
    });

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-64 bg-gray-50 rounded-md border">
      <div className="p-2 border-b bg-gray-100 rounded-t-md">
        <h3 className="text-sm font-semibold text-gray-700">Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-semibold text-blue-600">{msg.sender}: </span>
            <span className="text-gray-700">{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}
