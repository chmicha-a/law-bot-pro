import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, BookOpen, BarChart3, Settings, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory, Message } from "@/hooks/useChatHistory";

export default function Home() {
  const { user } = useAuth();
  const { currentChatId, currentChat, recentChats, createNewChat, addMessage, loadChat, deleteChat } = useChatHistory(user?.role);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize first chat if none exists
  useEffect(() => {
    if (!currentChatId && recentChats.length === 0) {
      createNewChat();
    }
  }, []);

  const messages = currentChat?.messages || [];

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    addMessage(currentChatId, userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const { chatApi } = await import("@/services/api");
      const response = await chatApi.ask(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        role: "assistant",
        timestamp: new Date(),
      };
      addMessage(currentChatId, assistantMessage);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "An error occurred. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      addMessage(currentChatId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewChat();
  };

  const handleLoadChat = (chatId: string) => {
    loadChat(chatId);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-border bg-card md:flex md:flex-col">
          <div className="flex flex-col gap-2 p-4">
            <Button variant="default" className="justify-start" onClick={handleNewChat}>
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            {user?.role === "admin" && (
              <>
                <Button variant="ghost" className="justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Laws
                </Button>
                <Button variant="ghost" className="justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistics
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </>
            )}
          </div>

          <div className="mt-4 flex-1 overflow-hidden border-t border-border">
            <div className="p-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recent Chats</h3>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-1">
                  {recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent ${
                        currentChatId === chat.id ? "bg-accent" : ""
                      }`}
                    >
                      <button
                        onClick={() => handleLoadChat(chat.id)}
                        className="flex-1 truncate text-left"
                      >
                        {chat.title}
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                  {recentChats.length === 0 && (
                    <p className="text-xs text-muted-foreground">No chats yet</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={`p-4 ${
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-card"
                  } max-w-[85%]`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="mt-2 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </Card>
              ))}
              {isLoading && (
                <Card className="max-w-[85%] p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-100" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-200" />
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border bg-card p-4">
            <div className="mx-auto max-w-3xl">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about Moroccan laws..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
