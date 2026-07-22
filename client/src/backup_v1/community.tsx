import { useNotices as useCommunityPosts, useCreateNotice as useCreatePost } from "@/hooks/use-notices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { insertNoticeSchema as insertPostSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function CommunityPage() {
  const { data: posts, isLoading } = useCommunityPosts();
  const createPostMutation = useCreatePost();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (data: any) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    createPostMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        toast({ title: "Posted!", description: "Your message is live." });
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Community Board</h1>
          <p className="text-muted-foreground">Connect with neighbors. Share news, ask for recommendations, or just say hello.</p>
        </div>
      </div>

      {/* Simple Create Post */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create a Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Title"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Share details..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Post
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Standard List Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts?.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-medium text-primary">{post.author?.displayName || "Neighbor"}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{post.content}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                    <MessageSquare className="w-4 h-4" /> Comment
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {posts?.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p>No active discussions yet. Be the first to say hi!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
