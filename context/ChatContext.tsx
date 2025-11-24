import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, ChatMessageDisplay, ConversationDisplay } from '../types';
import * as chatService from '../services/chatService';
import * as userService from '../services/userService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: ConversationDisplay[];
  activeConversation: Conversation | null;
  activeMessages: ChatMessageDisplay[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  error: string | null;
  fetchUserConversations: () => Promise<void>;
  setActiveConversation: (conversationId: string | null) => Promise<void>;
  sendMessage: (text: string) => Promise<boolean>;
  startNewConversation: (otherUserId: string) => Promise<Conversation | null>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [activeConversation, internalSetActiveConversation] = useState<Conversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessageDisplay[]>([]);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const allUsersRef = useRef<Record<string, { name: string; avatarUrl: string }>>({});

  const fetchAllUsers = useCallback(async () => {
    const response = await userService.getUserById(''); // Dummy call to get all users
    if (response.success && Array.isArray(response.data)) {
        const users = response.data as any; // Assuming it returns all users from db
        users.forEach((u: any) => {
            allUsersRef.current[u.id] = { name: u.name, avatarUrl: u.avatarUrl };
        });
    }
    // This is a workaround as getCollection('users') is not exposed directly from userService.
    // In a real app, userService would have a getAllUsers method.
    // For now, we manually get from db to populate user names.
    const allUsersResponse: any = await userService.getUserById(''); // Dummy call to access getCollection('users')
    if (allUsersResponse.success && Array.isArray(allUsersResponse.data)) {
        allUsersResponse.data.forEach((u: any) => {
            allUsersRef.current[u.id] = { name: u.name, avatarUrl: u.avatarUrl };
        });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchAllUsers();
  }, []); // Run once on mount

  const fetchUserConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    setError(null);
    try {
      const response = await chatService.getConversations(user.id);
      if (response.success && Array.isArray(response.data)) {
        const fetchedConversations = response.data as Conversation[];
        const conversationDisplays: ConversationDisplay[] = await Promise.all(
          fetchedConversations.map(async (conv) => {
            const otherParticipantId = conv.participants.find(pId => pId !== user.id);
            const otherUser = otherParticipantId ? (await userService.getUserById(otherParticipantId)).data as any : null;

            return {
              id: conv.id,
              otherParticipantName: otherUser?.name || 'Unknown User',
              lastMessageText: conv.messages[conv.messages.length - 1]?.text || '',
              lastMessageAt: conv.lastMessageAt,
              otherParticipantAvatar: otherUser?.avatarUrl || 'https://picsum.photos/40/40?grayscale',
            };
          })
        );
        setConversations(conversationDisplays);
      } else {
        setError(response.message || 'Failed to fetch conversations.');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('An unexpected error occurred while fetching conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  const setActiveConversation = useCallback(async (conversationId: string | null) => {
    if (!user || !conversationId) {
      internalSetActiveConversation(null);
      setActiveMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError(null);
    try {
      const response = await chatService.getConversationById(conversationId, user.id);
      if (response.success && response.data && !Array.isArray(response.data)) {
        const conversation = response.data as Conversation;
        internalSetActiveConversation(conversation);

        const messagesDisplay: ChatMessageDisplay[] = conversation.messages.map(msg => ({
          id: msg.id,
          senderName: allUsersRef.current[msg.senderId]?.name || 'Unknown',
          text: msg.text,
          timestamp: msg.timestamp,
          isCurrentUser: msg.senderId === user.id,
        }));
        setActiveMessages(messagesDisplay);
      } else {
        setError(response.message || 'Failed to set active conversation.');
        internalSetActiveConversation(null);
        setActiveMessages([]);
      }
    } catch (err) {
      console.error('Error setting active conversation:', err);
      setError('An unexpected error occurred while setting active conversation.');
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!user || !activeConversation || !text.trim()) {
      return false;
    }

    try {
      const response = await chatService.sendMessage(activeConversation.id, user.id, text);
      if (response.success && response.data && !Array.isArray(response.data)) {
        const newMessage = response.data as Message;
        const newMessageDisplay: ChatMessageDisplay = {
          id: newMessage.id,
          senderName: allUsersRef.current[newMessage.senderId]?.name || 'You',
          text: newMessage.text,
          timestamp: newMessage.timestamp,
          isCurrentUser: newMessage.senderId === user.id,
        };
        setActiveMessages(prevMessages => [...prevMessages, newMessageDisplay]);
        // Also update conversations list with latest message and timestamp
        fetchUserConversations();
        return true;
      } else {
        setError(response.message || 'Failed to send message.');
        return false;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('An unexpected error occurred while sending message.');
      return false;
    }
  }, [user, activeConversation, fetchUserConversations]);

  const startNewConversation = useCallback(async (otherUserId: string): Promise<Conversation | null> => {
    if (!user) {
      alert('Bạn cần đăng nhập để bắt đầu cuộc trò chuyện.');
      return null;
    }
    if (user.id === otherUserId) {
      alert('Không thể trò chuyện với chính mình.');
      return null;
    }

    setLoadingConversations(true);
    setError(null);
    try {
      const response = await chatService.createOrGetConversation([user.id, otherUserId]);
      if (response.success && response.data && !Array.isArray(response.data)) {
        const newConv = response.data as Conversation;
        await fetchUserConversations(); // Refresh the list
        await setActiveConversation(newConv.id); // Set the new conversation as active
        return newConv;
      } else {
        setError(response.message || 'Failed to start new conversation.');
        return null;
      }
    } catch (err) {
      console.error('Error starting new conversation:', err);
      setError('An unexpected error occurred while starting a new conversation.');
      return null;
    } finally {
      setLoadingConversations(false);
    }
  }, [user, fetchUserConversations, setActiveConversation]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (user) {
      fetchUserConversations();
    } else {
      setConversations([]);
      internalSetActiveConversation(null);
      setActiveMessages([]);
    }
  }, [user, fetchUserConversations]); // Refetch conversations when user changes

  const value = React.useMemo(() => ({
    conversations,
    activeConversation,
    activeMessages,
    loadingConversations,
    loadingMessages,
    error,
    fetchUserConversations,
    setActiveConversation,
    sendMessage,
    startNewConversation,
  }), [
    conversations,
    activeConversation,
    activeMessages,
    loadingConversations,
    loadingMessages,
    error,
    fetchUserConversations,
    setActiveConversation,
    sendMessage,
    startNewConversation,
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};