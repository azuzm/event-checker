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

  const navItems = user
    ? [
      { icon: Home, label: "Feed", href: "/" },
      { icon: Calendar, label: "Events", href: "/events" },
      { icon: Users, label: "Community", href: "/community" },
      { icon: PlusCircle, label: "Create Event", href: "/events/new" },
    ]
    : [
      { icon: Home, label: "Home", href: "/" },
      { icon: Calendar, label: "Local Events", href: "/events" },
      { icon: Users, label: "Community Boards", href: "/community" },
      { icon: PlusCircle, label: "Join Neighborhood", href: "/join" },
    ];

  const DesktopNav = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                <MapPin className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
                Locana
              </h1>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", location === item.href ? "stroke-[2.5px]" : "")} />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2 rounded-full hidden lg:flex">
                    <User className="w-4 h-4" /> Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive transition-colors rounded-full"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth">
                  <Button variant="ghost" className="font-semibold rounded-full hover:bg-primary/10 hover:text-primary">
                    Log in
                  </Button>
                </Link>
                <Link href="/join">
                  <Button className="font-semibold rounded-full px-5 btn-gradient shadow-md border-none">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold font-display">Locana</h1>
                  </div>

                  <nav className="space-y-2 flex-1">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium mb-1",
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

                  <div className="p-4 bg-muted/30 rounded-2xl mt-4">
                    {user ? (
                      <div className="space-y-2">
                        <Link href="/profile">
                          <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setIsMobileOpen(false)}>
                            <User className="w-4 h-4" /> Profile
                          </Button>
                        </Link>
                        <Button
                          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          variant="ghost"
                          onClick={() => { logout(); setIsMobileOpen(false); window.location.href = "/auth"; }}
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/auth">
                          <Button className="w-full justify-center rounded-xl" variant="outline" onClick={() => setIsMobileOpen(false)}>
                            Log in
                          </Button>
                        </Link>
                        <Link href="/join">
                          <Button className="w-full justify-center rounded-xl btn-gradient border-none" onClick={() => setIsMobileOpen(false)}>
                            Sign up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      <DesktopNav />

      {/* Main Content */}
      <main className="flex-1 w-full pt-16 pb-12 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border bg-white dark:bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-bold font-display text-lg">Locana</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 Locana. Community first.</p>
        </div>
      </footer>
    </div>
  );
}
