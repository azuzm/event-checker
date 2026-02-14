import { useEvent, useJoinEvent, useLeaveEvent, useEventAttendees } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Share2, Users, ArrowLeft, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const id = parseInt(params?.id || "0");
  const { data: event, isLoading } = useEvent(id);
  const { data: attendees } = useEventAttendees(id);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const joinMutation = useJoinEvent();
  const leaveMutation = useLeaveEvent();

  const isAttending = attendees?.some(a => a.userId === user?.id && a.status === 'going');
  const isOrganizer = event?.organizerId === user?.id;

  if (isLoading || !event) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleJoin = () => {
    if (!user) {
      window.location.href = "/api/login";
      return;
    }
    joinMutation.mutate({ id, status: 'going' }, {
      onSuccess: () => toast({ title: "You're going!", description: "See you there." })
    });
  };

  const handleLeave = () => {
    leaveMutation.mutate(id, {
      onSuccess: () => toast({ title: "Updated", description: "You are no longer attending." })
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/events">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </Link>

      <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl">
        {/* Hero Image */}
        <div className="relative h-[300px] md:h-[400px]">
          <img 
            src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop"} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
            <span className="bg-primary/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4 shadow-sm">{event.title}</h1>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">{format(new Date(event.date), "EEEE, MMMM do, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/40" />
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 p-6 md:p-10">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold font-display mb-4">About Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </section>

            {/* Organizer Info */}
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {event.organizer?.avatarUrl ? (
                  <img src={event.organizer.avatarUrl} className="w-full h-full object-cover rounded-full" />
                ) : (
                  event.organizer?.displayName?.charAt(0) || "O"
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Organized by</p>
                <p className="font-bold text-lg">{event.organizer?.displayName || "Unknown Organizer"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-background rounded-2xl p-6 border border-border shadow-sm sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Are you going?</span>
                  <span className="font-bold text-primary">{attendees?.length || 0} attending</span>
                </div>
                <div className="flex -space-x-2 overflow-hidden py-2">
                  {attendees?.slice(0, 5).map((att) => (
                    <div key={att.id} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground overflow-hidden" title={att.user?.displayName || "User"}>
                       {att.user?.avatarUrl ? <img src={att.user.avatarUrl} /> : att.user?.displayName?.charAt(0)}
                    </div>
                  ))}
                  {(attendees?.length || 0) > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{attendees!.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {isAttending ? (
                <div className="space-y-3">
                  <div className="w-full py-3 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5" /> You are going!
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLeave}
                    disabled={leaveMutation.isPending}
                  >
                    Cancel Attendance
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                >
                  {joinMutation.isPending ? "Joining..." : "Join Event"}
                </Button>
              )}
              
              <Button variant="ghost" className="w-full mt-4 text-muted-foreground">
                <Share2 className="w-4 h-4 mr-2" /> Share Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
