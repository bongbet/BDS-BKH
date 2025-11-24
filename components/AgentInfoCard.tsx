import React, { useState, useEffect } from 'react';
import { User, Agent } from '../types';
import * as userService from '../services/userService';
import Button from './common/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useListings } from '../context/ListingContext';

interface AgentInfoCardProps {
  agentUserId: string;
  listingId: string; // To increment contact clicks
}

const AgentInfoCard: React.FC<AgentInfoCardProps> = ({ agentUserId, listingId }) => {
  const navigate = useNavigate();
  const { startNewConversation } = useChat();
  const { incrementContactClicks } = useListings();

  const [agentUser, setAgentUser] = useState<User | null>(null);
  const [agentInfo, setAgentInfo] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentData = async () => {
      setLoading(true);
      try {
        const userResponse = await userService.getUserById(agentUserId);
        if (userResponse.success && userResponse.data && !Array.isArray(userResponse.data)) {
          setAgentUser(userResponse.data as User);
        } else {
          setError(userResponse.message || 'Không tìm thấy thông tin người dùng môi giới.');
        }

        const agentResponse = await userService.getAgentByUserId(agentUserId);
        if (agentResponse.success && agentResponse.data && !Array.isArray(agentResponse.data)) {
          setAgentInfo(agentResponse.data as Agent);
        } else {
          setError(agentResponse.message || 'Không tìm thấy thông tin môi giới.');
        }
      } catch (err) {
        console.error('Error fetching agent data:', err);
        setError('Đã xảy ra lỗi khi tải thông tin môi giới.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [agentUserId]);

  const handleCallClick = () => {
    if (agentUser?.phone) {
      incrementContactClicks(listingId);
      window.location.href = `tel:${agentUser.phone}`;
    } else {
      alert('Không có số điện thoại để gọi.');
    }
  };

  const handleMessageClick = async () => {
    if (agentUser) {
      incrementContactClicks(listingId);
      const conversation = await startNewConversation(agentUser.id);
      if (conversation) {
        navigate(`/chat?convId=${conversation.id}`);
      } else {
        alert('Không thể bắt đầu cuộc trò chuyện.');
      }
    } else {
      alert('Không thể nhắn tin, thông tin môi giới không đầy đủ.');
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Đang tải thông tin môi giới...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!agentUser) {
    return <div className="p-4 text-center text-gray-500">Không tìm thấy môi giới.</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin liên hệ</h3>
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={agentUser.avatarUrl || 'https://picsum.photos/60/60?grayscale'}
          alt={agentUser.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
        />
        <div>
          <p className="text-lg font-bold text-gray-900">{agentUser.name}</p>
          {agentInfo && <p className="text-sm text-gray-600">{agentInfo.name}</p>}
          <div className="flex items-center text-sm text-gray-500">
            {agentInfo && (
              <>
                <svg className="h-4 w-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-0.5">{agentInfo.rating.toFixed(1)} ({agentInfo.totalListings} listings)</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleCallClick} className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Gọi điện
        </Button>
        <Button onClick={handleMessageClick} className="flex-1 flex items-center justify-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Nhắn tin
        </Button>
      </div>
    </div>
  );
};

export default AgentInfoCard;