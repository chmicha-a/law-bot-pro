import { Plus, BookOpen, BarChart3, Settings, MessageSquare, Trash2, LayoutDashboard, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
}

interface AppSidebarProps {
  currentChatId: string;
  recentChats: ChatSession[];
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  onBrowseLaws?: () => void;
  onStatistics?: () => void;
  onSettings?: () => void;
}

export function AppSidebar({
  currentChatId,
  recentChats,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onBrowseLaws,
  onStatistics,
  onSettings,
}: AppSidebarProps) {
  const { user } = useAuth();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNewChat} className="w-full" size="lg">
                  <Plus className="h-5 w-5" />
                  {open && <span>New Chat</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onBrowseLaws}>
                    <BookOpen className="h-4 w-4" />
                    {open && <span>Browse Laws</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onStatistics}>
                    <BarChart3 className="h-4 w-4" />
                    {open && <span>Statistics</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onSettings}>
                    <Settings className="h-4 w-4" />
                    {open && <span>Settings</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4" />
                      {open && <span>Dashboard</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {open && recentChats.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <SidebarMenu>
                  {recentChats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div
                        className={`group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-sidebar-accent cursor-pointer ${
                          currentChatId === chat.id ? "bg-sidebar-accent" : ""
                        }`}
                      >
                        <button
                          onClick={() => onLoadChat(chat.id)}
                          className="flex-1 truncate text-left text-sm px-2"
                        >
                          <MessageSquare className="inline h-4 w-4 mr-2" />
                          {chat.title}
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={(e) => onDeleteChat(chat.id, e)}
                            className="opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded"
                            title="Delete chat"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
