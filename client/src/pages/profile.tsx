import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Calendar, Settings } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden shadow-inner">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             user.firstName?.charAt(0) || "U"
          )}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold font-display mb-2">
            {user.firstName} {user.lastName}
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Member since 2024
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <Button variant="outline" className="rounded-full">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={() => logout()}>
              Log Out
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-muted/50 p-1 rounded-full">
          <TabsTrigger value="events" className="rounded-full">My Events</TabsTrigger>
          <TabsTrigger value="posts" className="rounded-full">My Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="mt-8">
          <div className="bg-muted/20 rounded-3xl p-10 text-center border border-dashed border-border">
            <p className="text-muted-foreground">You haven't joined any events yet.</p>
          </div>
        </TabsContent>
        <TabsContent value="posts" className="mt-8">
          <div className="bg-muted/20 rounded-3xl p-10 text-center border border-dashed border-border">
            <p className="text-muted-foreground">You haven't posted anything yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
