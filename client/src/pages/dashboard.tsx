import { useEvents } from "@/hooks/use-events";
import { useNotices } from "@/hooks/use-notices";
import { useAuth } from "@/hooks/use-auth";
import { EventCard } from "@/components/event-card";
import { NoticeCard } from "@/components/notice-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: notices, isLoading: noticesLoading } = useNotices();

  const isLoading = eventsLoading || noticesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Get upcoming events (limit 3)
  const upcomingEvents = events
    ?.filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">
            Welcome back, {user?.firstName || 'Neighbor'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening in your community today, {format(new Date(), 'MMMM do')}.
          </p>
        </div>
        <Link href="/events/new">
          <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Featured Events Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display">Upcoming Events</h2>
          <Link href="/events">
            <Button variant="link" className="text-primary">View All</Button>
          </Link>
        </div>
        
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-2xl p-10 text-center border border-dashed border-border">
            <p className="text-muted-foreground mb-4">No upcoming events found.</p>
            <Link href="/events/new">
              <Button variant="outline">Be the first to create one!</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Community Feed Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display">Community Board</h2>
            <Link href="/community">
              <Button variant="ghost" size="sm">Post Notice</Button>
            </Link>
          </div>

          {notices && notices.length > 0 ? (
            <div className="space-y-4">
              {notices.map(notice => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">Quiet neighborhood today. Start a conversation!</p>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Premium Member?</h3>
            <p className="text-white/80 text-sm mb-4">
              Get verified and unlock exclusive community features.
            </p>
            <Button variant="secondary" size="sm" className="w-full bg-white text-primary hover:bg-white/90">
              Upgrade Now
            </Button>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="font-bold text-lg mb-4 font-display">Active Neighbors</h3>
            <div className="flex -space-x-2 overflow-hidden mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  U{i}
                </div>
              ))}
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                +42
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              50+ neighbors active in the last hour
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
