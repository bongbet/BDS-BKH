import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ChatWindow from '../components/ChatWindow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { DEFAULT_AVATAR_URL } from '../constants';

const Chat: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    conversations,
    activeConversation,
    activeMessages,
    loadingConversations,
    loadingMessages,
    fetchUserConversations,
    setActiveConversation,
    sendMessage,
    startNewConversation,
    error,
  } = useChat();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [newChatUserId, setNewChatUserId] = useState<string>('');
  const [showNewChatInput, setShowNewChatInput] = useState<boolean>(false);

  useEffect(() => {
    // Check for convId in URL on mount
    const convIdParam = searchParams.get('convId');
    if (convIdParam && !activeConversation) {
      setActiveConversation(convIdParam);
    }
  }, [searchParams, activeConversation, setActiveConversation]);

  useEffect(() => {
    // If a new conversation is set active and it's not in the URL, update the URL
    if (activeConversation && searchParams.get('convId') !== activeConversation.id) {
        navigate(`/chat?convId=${activeConversation.id}`, { replace: true });
    }
  }, [activeConversation, navigate, searchParams]);


  const handleStartNewChat = async () => {
    if (newChatUserId.trim()) {
      const conv = await startNewConversation(newChatUserId);
      if (conv) {
        setShowNewChatInput(false);
        setNewChatUserId('');
        // setActiveConversation will be called by startNewConversation
      } else {
        alert('Không thể bắt đầu cuộc trò chuyện. Kiểm tra ID người dùng.');
      }
    }
  };

  const getOtherParticipantName = (convId: string) => {
    const convDisplay = conversations.find(c => c.id === convId);
    return convDisplay?.otherParticipantName || 'Unknown';
  };


  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message="Đang tải thông tin người dùng..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600">Bạn chưa đăng nhập</h2>
        <p className="text-gray-600 mt-2">Vui lòng đăng nhập để sử dụng chức năng chat.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Đăng nhập</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] overflow-hidden rounded-lg shadow-md bg-gray-50">
      {/* Conversation List Sidebar */}
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Trò chuyện ({conversations.length})</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowNewChatInput(!showNewChatInput)}>
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
        {showNewChatInput && (
          <div className="p-4 border-b border-gray-200">
            <Input
              id="new-chat-user-id"
              placeholder="Nhập User ID để chat..."
              value={newChatUserId}
              onChange={(e) => setNewChatUserId(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleStartNewChat} className="w-full" size="sm">
              Bắt đầu trò chuyện mới
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <LoadingSpinner message="Đang tải cuộc trò chuyện..." />
          ) : error ? (
            <p className="text-red-500 text-center p-4">{error}</p>
          ) : conversations.length === 0 ? (
            <p className="text-center text-gray-500 p-4">Bạn chưa có cuộc trò chuyện nào.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                }`}
              >
                <img
                  src={conv.otherParticipantAvatar || DEFAULT_AVATAR_URL}
                  alt={conv.otherParticipantName}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{conv.otherParticipantName}</p>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessageText || 'Chưa có tin nhắn'}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-full md:w-2/3">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            otherParticipantName={getOtherParticipantName(activeConversation.id)}
            onSendMessage={sendMessage}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">Chọn một cuộc trò chuyện hoặc bắt đầu một cuộc trò chuyện mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;