import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, MessageSquare, BookOpen, BarChart3, Settings, Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory, Message } from "@/hooks/useChatHistory";
import { documentApi } from "@/services/api";
import { toast } from "sonner";

interface Document {
  filename: string;
  path: string;
}

export default function Home() {
  const { user } = useAuth();
  const { currentChatId, currentChat, recentChats, createNewChat, addMessage, loadChat, deleteChat } = useChatHistory(user?.role, user?.email);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin dialog states
  const [showBrowseLaws, setShowBrowseLaws] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

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

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await documentApi.list();
      setDocuments(docs);
    } catch (error) {
      toast.error("Failed to load documents");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleBrowseLaws = () => {
    setShowBrowseLaws(true);
    loadDocuments();
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
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
                <Button variant="ghost" className="justify-start" onClick={handleBrowseLaws}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Laws
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setShowStatistics(true)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistics
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setShowSettings(true)}>
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
        <main className="flex flex-1 flex-col overflow-hidden">
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
          <div className="shrink-0 border-t border-border bg-card p-4">
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

      {/* Browse Laws Dialog */}
      <Dialog open={showBrowseLaws} onOpenChange={setShowBrowseLaws}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Browse Laws</DialogTitle>
            <DialogDescription>View all uploaded legal documents</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.filename}
                    className="flex items-center gap-3 rounded-lg border border-border p-4"
                  >
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{doc.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={showStatistics} onOpenChange={setShowStatistics}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Statistics</DialogTitle>
            <DialogDescription>Overview of system usage and performance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Chats</p>
                    <p className="text-2xl font-bold">{recentChats.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="text-2xl font-bold">{documents.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Chat</p>
                    <p className="text-2xl font-bold">{currentChat?.messages.length || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Messages</p>
                    <p className="text-2xl font-bold">
                      {recentChats.reduce((acc, chat) => acc + chat.messages.length, 0)}
                    </p>
                  </div>
                  <Send className="h-8 w-8 text-primary" />
                </div>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Configure your AI Law Assistant preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">General Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                  <Button variant="outline" size="sm">English</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Response Length</p>
                    <p className="text-sm text-muted-foreground">Control detail level of responses</p>
                  </div>
                  <Button variant="outline" size="sm">Detailed</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Auto-save Chats</p>
                    <p className="text-sm text-muted-foreground">Automatically save conversation history</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Notification Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">Off</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
