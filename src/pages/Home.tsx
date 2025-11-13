import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  Send, 
  MessageSquare, 
  FileText, 
  Loader2, 
  Mic, 
  Paperclip, 
  BarChart3 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory, Message } from "@/hooks/useChatHistory";
import { documentApi } from "@/services/api";
import { toast } from "sonner";

interface Document {
  filename: string;
  path: string;
  category?: string;
}

const categories = [
  "Loi de la famille",
  "Loi maritime",
  "Droit du travail",
  "Code pénal",
  "Code civil",
  "Droit des sociétés",
  "Loi foncière",
  "Autres"
];

export default function Home() {
  const { user } = useAuth();
  const { currentChatId, currentChat, recentChats, createNewChat, addMessage, loadChat, deleteChat } = useChatHistory(user?.role, user?.email || user?.id);
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

  const handleCategoryClick = (category: string) => {
    setInput(category);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          currentChatId={currentChatId}
          recentChats={recentChats}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
          onDeleteChat={handleDeleteChat}
          onBrowseLaws={handleBrowseLaws}
          onStatistics={() => setShowStatistics(true)}
          onSettings={() => setShowSettings(true)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          
          {/* Main Chat Area */}
          <main className="flex flex-1 flex-col overflow-hidden relative">
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-4">
                <div className="text-center max-w-3xl w-full">
                  <h1 className="text-4xl md:text-5xl font-semibold mb-8 text-foreground">
                    Sur quoi travaillez-vous ?
                  </h1>
                  <div className="mx-auto max-w-3xl">
                    <div className="relative flex gap-2 items-center bg-background rounded-2xl border border-border shadow-lg px-5 py-4 focus-within:shadow-xl transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 rounded-lg shrink-0 hover:bg-accent"
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Poser une question"
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                        disabled={isLoading}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 rounded-lg shrink-0 hover:bg-accent"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                      <Button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="h-9 w-9 rounded-full shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Category Buttons */}
                    <div className="mt-4">
                      <ScrollArea className="w-full">
                        <div className="flex gap-2 pb-2">
                          {categories.map((category) => (
                            <Button
                              key={category}
                              variant="outline"
                              onClick={() => handleCategoryClick(category)}
                              className="whitespace-nowrap rounded-full text-sm bg-muted/30 hover:bg-muted border-border/50 hover:border-border"
                            >
                              {category}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-4 py-6">
                  <div className="mx-auto max-w-3xl space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-3xl px-5 py-3 max-w-[80%] ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50"
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-3xl px-5 py-3 bg-muted/50">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0.15s" }} />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0.3s" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area - Chat Started */}
                <div className="shrink-0 bg-background px-4 py-6 border-t border-border/50">
                  <div className="mx-auto max-w-3xl">
                    <div className="relative flex gap-2 items-center bg-background rounded-2xl border border-border shadow-lg px-5 py-3 focus-within:shadow-xl transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 rounded-lg shrink-0 hover:bg-accent"
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Poser une question"
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                        disabled={isLoading}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 rounded-lg shrink-0 hover:bg-accent"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                      <Button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="h-9 w-9 rounded-full shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
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
                      {doc.category && (
                        <p className="text-xs text-primary mt-1">{doc.category}</p>
                      )}
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
    </SidebarProvider>
  );
}
