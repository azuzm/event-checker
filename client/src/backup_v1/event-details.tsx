import { useEvent, useJoinEvent, useLeaveEvent, useEventAttendees } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, ArrowLeft, CheckCircle2, User as UserIcon } from "lucide-react";
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

  if (isLoading || !event) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleJoin = () => {
    if (!user) {
      window.location.href = "/auth";
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
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <Link href="/events">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </Link>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-8">
        <div className="aspect-video w-full bg-muted relative">
          <img
            src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            {event.category}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold font-display mb-4">{event.title}</h1>

          <div className="flex flex-col sm:flex-row gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{format(new Date(event.date), "EEEE, MMMM do, yyyy 'at' h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>

          <div className="prose max-w-none text-muted-foreground mb-8">
            <h3 className="text-foreground font-bold text-lg mb-2">About this event</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {event.organizer?.displayName?.charAt(0) || "O"}
            </div>
            <div>
              <p className="text-sm font-medium">Organized by</p>
              <p className="font-bold">{event.organizer?.displayName || "Community Member"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Attendees */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Attendees ({attendees?.length || 0})</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {attendees?.map((att) => (
              <div key={att.id} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold border border-background" title={att.user?.displayName}>
                {att.user?.avatarUrl ? (
                  <img src={att.user.avatarUrl} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            ))}
            {(attendees?.length || 0) === 0 && (
              <p className="text-sm text-muted-foreground">Be the first to join!</p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col justify-center">
          {isAttending ? (
            <div className="space-y-4">
              <div className="w-full py-3 bg-green-500/10 text-green-600 rounded-lg flex items-center justify-center gap-2 font-bold border border-green-500/20">
                <CheckCircle2 className="w-5 h-5" /> You are Attending
              </div>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
              >
                Cancel Registration
              </Button>
            </div>
          ) : (
            <Button
              className="w-full py-6 text-lg rounded-xl btn-gradient"
              onClick={handleJoin}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? "Joining..." : "Join Event"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
