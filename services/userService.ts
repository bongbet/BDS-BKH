import { User, Agent } from '../types';
import { getCollection } from './db';

interface UserServiceResponse {
  success: boolean;
  data?: User | Agent | User[] | Agent[];
  message?: string;
}

export const getUserById = async (userId: string): Promise<UserServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call delay
  const users = getCollection('users');
  
  if (userId) { // If a specific userId is provided
    const user = users.find(u => u.id === userId);
    if (user) {
      const userWithoutPassword: User = { ...user };
      delete userWithoutPassword.password; // Don't expose password
      return { success: true, data: userWithoutPassword };
    } else {
      return { success: false, message: 'User not found.' };
    }
  } else { // If no userId is provided, return all users (for internal use like populating chat names)
    const usersWithoutPasswords = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    return { success: true, data: usersWithoutPasswords };
  }
};

export const getAgentById = async (agentId: string): Promise<UserServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call delay
  const agents = getCollection('agents');
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    return { success: true, data: agent };
  } else {
    return { success: false, message: 'Agent not found.' };
  }
};

export const getAgentByUserId = async (userId: string): Promise<UserServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call delay
  const agents = getCollection('agents');
  const agent = agents.find(a => a.agentUserId === userId);
  if (agent) {
    return { success: true, data: agent };
  } else {
    return { success: false, message: 'Agent not found for this user.' };
  }
};

export const getAllAgents = async (): Promise<UserServiceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call delay
  const agents = getCollection('agents');
  return { success: true, data: agents };
};