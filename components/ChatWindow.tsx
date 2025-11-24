import React, { useEffect, useRef, useState } from 'react';
import { ChatMessageDisplay, Conversation } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

interface ChatWindowProps {
  conversation: Conversation;
  messages: ChatMessageDisplay[];
  otherParticipantName: string;
  onSendMessage: (text: string) => Promise<boolean>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages, otherParticipantName, onSendMessage }) => {
  const { user } = useAuth();
  const { loadingMessages } = useChat();
  const [messageText, setMessageText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages update

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && user) {
      const success = await onSendMessage(messageText);
      if (success) {
        setMessageText('');
      } else {
        alert('Gửi tin nhắn thất bại.');
      }
    }
  };

  if (loadingMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg shadow-md p-4">
        <LoadingSpinner message="Đang tải tin nhắn..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Trò chuyện với {otherParticipantName}</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">Bắt đầu cuộc trò chuyện!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${msg.isCurrentUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="font-semibold text-xs mb-1">
                  {msg.isCurrentUser ? 'Bạn' : msg.senderName}
                </p>
                <p className="break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isCurrentUser ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex space-x-2">
        <Input
          id="chat-message"
          placeholder="Nhập tin nhắn..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit">Gửi</Button>
      </form>
    </div>
  );
};

export default ChatWindow;