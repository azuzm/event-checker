import { useEvents } from "@/hooks/use-events";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Map as MapIcon, List, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function EventsPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string | undefined>();
    const { data: events, isLoading } = useEvents({ search, category });

    const categories = ["All", "Music", "Food", "Sports", "Art", "Meetup"];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display">Discover Events</h1>
                    <p className="text-muted-foreground">Find what's happening around you</p>
                </div>
                <Link href="/events/new">
                    <Button className="rounded-full gap-2">
                        <Plus className="w-4 h-4" /> Create Event
                    </Button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-10 backdrop-blur-md bg-card/80">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search events..."
                        className="pl-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat === "All" ? undefined : cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${(cat === "All" && !category) || category === cat
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-80 bg-muted/20 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : events?.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                    <Button variant="outline" onClick={() => { setSearch(""); setCategory(undefined); }}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events?.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
