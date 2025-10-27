import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scale, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">AI Law Assistant</span>
            <span className="text-xs text-muted-foreground">Morocco Beta</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "admin" && (
                <Button variant="ghost" asChild>
                  <Link to="/admin">Admin Dashboard</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
