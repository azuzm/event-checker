import { useEvents, useEventCategories } from "@/hooks/use-events";
import { EventCard } from "@/components/event-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const { data: categories } = useEventCategories();

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold font-display">Local Events</h1>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Events</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-4">
                <h4 className="font-medium">Categories</h4>
                <div className="space-y-2">
                  {categories?.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={category}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedCategories.map(cat => (
            <Button
              key={cat}
              variant="secondary"
              size="sm"
              onClick={() => toggleCategory(cat)}
              className="gap-1 h-7 text-xs"
            >
              {cat} <X className="w-3 h-3" />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategories([])}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[300px] rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents?.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground mb-4">No events found matching your filter.</p>
          <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategories([]); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
