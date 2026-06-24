import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { socket } from '../hooks/useSocket';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatProps {
  roomId: string;
  currentNickname?: string;
}

export default function Chat({ roomId, currentNickname }: ChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('chatMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, []);

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

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/8 transition-colors"
      >
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-base">💬</span>
          {t('chat') || 'Chat'}
          {messages.length > 0 && (
            <span className="px-1.5 py-0.5 bg-cyan-500/30 text-cyan-300 text-xs rounded-full">
              {messages.length}
            </span>
          )}
        </h3>
        <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Messages */}
      {isExpanded && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px] max-h-[200px]">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 text-xs py-4">
                {t('noMessages') || 'No messages yet'}
              </p>
            )}
            {messages.map((msg, idx) => {
              const isMe = msg.sender === currentNickname;
              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-xs font-medium ${isMe ? 'text-cyan-400' : 'text-purple-400'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl text-sm max-w-[85%] break-words
                      ${isMe
                        ? 'bg-cyan-600/30 text-cyan-100 rounded-br-sm'
                        : 'bg-white/10 text-gray-200 rounded-bl-sm'
                      }
                    `}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500
                focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              placeholder={t('typeMessage') || 'Type a message...'}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-2 bg-cyan-600 text-white text-sm rounded-xl hover:bg-cyan-500
                disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}
