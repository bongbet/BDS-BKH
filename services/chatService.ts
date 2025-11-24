import { Conversation, Message } from '../types';
import { getCollection, updateCollection, generateId } from './db';

interface ChatServiceResponse {
  success: boolean;
  data?: Conversation | Message | Conversation[];
  message?: string;
}

export const getConversations = async (userId: string): Promise<ChatServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
  const conversations = getCollection('conversations');
  const userConversations = conversations
    .filter(conv => conv.participants.includes(userId))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  return { success: true, data: userConversations };
};

export const getConversationById = async (conversationId: string, userId: string): Promise<ChatServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call delay
  const conversations = getCollection('conversations');
  const conversation = conversations.find(conv => conv.id === conversationId && conv.participants.includes(userId));

  if (conversation) {
    // Sort messages by timestamp
    const sortedMessages = [...conversation.messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return { success: true, data: { ...conversation, messages: sortedMessages } };
  } else {
    return { success: false, message: 'Conversation not found or not authorized.' };
  }
};

export const createOrGetConversation = async (participantIds: string[]): Promise<ChatServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
  const conversations = getCollection('conversations');

  // Check if a conversation already exists between these participants
  const existingConv = conversations.find(conv =>
    conv.participants.length === participantIds.length &&
    conv.participants.every(p => participantIds.includes(p))
  );

  if (existingConv) {
    return { success: true, data: existingConv };
  }

  // Create new conversation
  const newConversation: Conversation = {
    id: generateId(),
    participants: participantIds,
    messages: [],
    lastMessageAt: new Date().toISOString(),
  };

  updateCollection('conversations', prevConversations => [...prevConversations, newConversation]);
  return { success: true, data: newConversation };
};


export const sendMessage = async (conversationId: string, senderId: string, text: string): Promise<ChatServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate quick message send
  const newMessage: Message = {
    id: generateId(),
    conversationId,
    senderId,
    text,
    timestamp: new Date().toISOString(),
  };

  let foundConversation = false;
  updateCollection('conversations', prevConversations =>
    prevConversations.map(conv => {
      if (conv.id === conversationId) {
        foundConversation = true;
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessageAt: newMessage.timestamp,
        };
      }
      return conv;
    })
  );

  if (foundConversation) {
    return { success: true, data: newMessage };
  } else {
    return { success: false, message: 'Conversation not found.' };
  }
};