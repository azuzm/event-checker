import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import { useCreateEvent } from "@/hooks/use-events";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";

// Schema for the form - needs to handle string dates from input
const formSchema = insertEventSchema.extend({
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateEvent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "General",
      date: "",
      imageUrl: "",
      latitude: 0,
      longitude: 0,
    },
  });

  function onSubmit(data: FormValues) {
    // For MVP we just use dummy coords if not provided
    const payload = {
      ...data,
      latitude: 40.7128,
      longitude: -74.0060,
    };

    createMutation.mutate(payload as any, {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Your event has been created.",
        });
        setLocation("/events");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Create New Event</h1>
        <p className="text-muted-foreground">Host a gathering for your community.</p>
      </div>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Summer Block Party" className="h-12 text-lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["General", "Music", "Food", "Sports", "Art", "Meetup"].map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input type="datetime-local" className="pl-10 h-12" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Central Park" className="h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." className="h-12" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Tip: Use an Unsplash URL for best results</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell people what your event is about..." 
                      className="min-h-[150px] resize-none p-4" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={() => setLocation("/events")}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/20"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Publish Event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
