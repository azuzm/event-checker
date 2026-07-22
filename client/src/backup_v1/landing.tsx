import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Calendar } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Simple Hero */}
      <section className="text-center space-y-6 pt-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground">
          Your Neighborhood, <span className="text-primary">Connected.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Locana helps you discover local events, meet your neighbors, and build a stronger community right where you live.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/join">
            <Button size="lg" className="rounded-full px-8 text-lg btn-gradient">
              Join Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/events">
            <Button size="lg" variant="outline" className="rounded-full px-8 text-lg">
              Browse Events
            </Button>
          </Link>
        </div>
      </section>

      {/* Clean Features Grid */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hyperlocal</h3>
            <p className="text-muted-foreground">
              Events and updates strictly for your neighborhood radius.
            </p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Events</h3>
            <p className="text-muted-foreground">
              Never miss out on block parties, garage sales, or meetups.
            </p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
            <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Verified Neighbors</h3>
            <p className="text-muted-foreground">
              Connect with real people living around you. Safe and secure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
