import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  Calendar, 
  Users, 
  PlusCircle, 
  User, 
  LogOut,
  MapPin,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Feed", href: "/" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: PlusCircle, label: "Create Event", href: "/events/new" },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 font-display">
            LocalLoop
          </h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium",
                  location === item.href 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", location === item.href ? "stroke-[2.5px]" : "")} />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <Link href="/profile">
          <div 
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer mb-2",
              location === "/profile" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            <User className="w-5 h-5" />
            Profile
          </div>
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border/50 fixed h-screen bg-card/50 backdrop-blur-xl z-20">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/50 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg font-display">LocalLoop</span>
        </div>
        
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 w-full min-h-screen p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
