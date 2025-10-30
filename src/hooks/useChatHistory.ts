import { useState, useEffect } from "react";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = "law_assistant_chats";
const CURRENT_CHAT_KEY = "law_assistant_current_chat";

export const useChatHistory = () => {
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return localStorage.getItem(CURRENT_CHAT_KEY) || "";
  });
  
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Array<{
        id: string;
        title: string;
        messages: Array<{ id: string; content: string; role: "user" | "assistant"; timestamp: string }>;
        createdAt: string;
        updatedAt: string;
      }>;
      return parsed.map((chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
    }
  }, [currentChatId]);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          id: "welcome",
          content: "Welcome! I'm your AI Law Assistant for Moroccan law. Ask me anything about legal matters, regulations, or specific laws in Morocco.",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const addMessage = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages, message];
          const title =
            chat.title === "New Chat" && message.role === "user"
              ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
              : chat.title;
          
          return {
            ...chat,
            title,
            messages: updatedMessages,
            updatedAt: new Date(),
          };
        }
        return chat;
      })
    );
  };

  const loadChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId("");
    }
  };

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId);
  };

  const getRecentChats = (limit: number = 10) => {
    return chats.slice(0, limit);
  };

  return {
    currentChatId,
    currentChat: getCurrentChat(),
    recentChats: getRecentChats(),
    createNewChat,
    addMessage,
    loadChat,
    deleteChat,
  };
};
