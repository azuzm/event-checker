import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, ArrowRight, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl font-display tracking-tight">Locana</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="font-semibold rounded-full px-6 btn-gradient cursor-pointer"
              onClick={() => window.location.href = "/api/login"}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center py-20 lg:py-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
            Discover Your Local Community
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with neighbors, find local events, and stay updated on what's happening right around the corner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="text-lg px-8 h-14 rounded-full btn-gradient cursor-pointer"
              onClick={() => window.location.href = "/api/login"}
            >
              Join Your Neighborhood <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Local Events",
                desc: "Find and join events happening in your immediate vicinity, from block parties to book clubs."
              },
              {
                icon: Users,
                title: "Community Board",
                desc: "Share updates, ask for recommendations, or report lost items to your neighbors."
              },
              {
                icon: Shield,
                title: "Verified & Safe",
                desc: "A safe space for authentic community interactions with verified local residents."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-muted-foreground text-sm">
        <p>© 2024 Locana. Building stronger communities together.</p>
      </footer>
    </div>
  );
}
