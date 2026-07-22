import { Link } from "wouter";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import type { EventResponse } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventResponse;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  // Use placeholder image if none provided
  const image = event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60";

  return (
    <Link href={`/events/${event.id}`}>
      <div className={cn(
        "group cursor-pointer bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col",
        className
      )}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
            {event.category}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center text-white text-sm font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(event.date), "EEE, MMM d • h:mm a")}
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors font-display">
            {event.title}
          </h3>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                {event.attendeeCount || 0} attending
              </div>

              {event.organizer && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">by</span>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/10">
                    {event.organizer.avatarUrl ? (
                      <img src={event.organizer.avatarUrl} alt="Org" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                        {event.organizer.displayName?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
