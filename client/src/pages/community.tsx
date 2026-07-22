import { useNotices, useCreateNotice } from "@/hooks/use-notices";
import { NoticeCard } from "@/components/notice-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Community() {
  const { data: notices, isLoading } = useNotices();
  const createMutation = useCreateNotice();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createMutation.mutate({
      content,
      category,
      location: location || undefined
    }, {
      onSuccess: () => {
        setContent("");
        setLocation("");
        toast({ title: "Posted!", description: "Your notice is now live." });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-display mb-2">Community Board</h1>
        <p className="text-muted-foreground">Share updates, ask questions, or just say hello.</p>
      </div>

      {/* Create Post Widget */}
      <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's happening in the neighborhood?"
            className="border-0 bg-muted/30 focus:bg-background resize-none min-h-[100px] text-lg p-4 rounded-xl"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {["General", "Safety", "Lost & Found", "Recommendation", "Marketplace"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Add location (optional)"
              className="h-10 rounded-full flex-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Button
              type="submit"
              disabled={createMutation.isPending || !content.trim()}
              className="rounded-full px-6 bg-primary hover:bg-primary/90"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Post
            </Button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-40 bg-muted/20 rounded-2xl animate-pulse" />)
        ) : notices?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No posts yet. Be the first!</p>
          </div>
        ) : (
          notices?.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))
        )}
      </div>
    </div>
  );
}
