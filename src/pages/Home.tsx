import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, BookOpen, BarChart3, Settings } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome! I'm your AI Law Assistant for Moroccan law. Ask me anything about legal matters, regulations, or specific laws in Morocco.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm processing your question about Moroccan law. Please note this is a demo response. Integration with the RAG backend is pending.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-border bg-card md:flex md:flex-col">
          <div className="flex flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
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
          </div>

          <div className="mt-4 border-t border-border p-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recent Chats</h3>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                Labor Law Questions
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                Property Rights
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                Commercial Code
              </Button>
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
