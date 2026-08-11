import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { db } from "./db";
import { users, events, notices } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");


  const organizerId = "user_seed_1";
  await authStorage.upsertUser({
    id: organizerId,
    email: "organizer@example.com",
    firstName: "Alice",
    lastName: "Organizer",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  });

  const memberId = "user_seed_2";
  await authStorage.upsertUser({
    id: memberId,
    email: "member@example.com",
    firstName: "Bob",
    lastName: "Member",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  });

  // Create Events
  const eventsData = [
    {
      title: "Community Clean-up",
      description: "Join us for a morning of cleaning up the local park. Gloves and bags provided!",
      date: new Date(Date.now() + 86400000 * 2), // 2 days from now
      location: "Central Park",
      latitude: 40.785091,
      longitude: -73.968285,
      category: "Community",
      organizerId: organizerId,
      imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "Saturday Morning Yoga",
      description: "Free yoga session for all levels. Bring your own mat.",
      date: new Date(Date.now() + 86400000 * 5), // 5 days from now
      location: "Community Center Hall",
      latitude: 40.7829,
      longitude: -73.9654,
      category: "Health",
      organizerId: organizerId,
      imageUrl: "https://images.unsplash.com/photo-1544367563-12123d8959bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "Local Food Festival",
      description: "Taste the best local dishes from our community chefs.",
      date: new Date(Date.now() + 86400000 * 10), // 10 days from now
      location: "Town Square",
      latitude: 40.7812,
      longitude: -73.9665,
      category: "Food",
      organizerId: organizerId,
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
  ];

  for (const event of eventsData) {
    await storage.createEvent(event);
  }

  // Create Notices
  const noticesData = [
    {
      content: "Has anyone seen a lost golden retriever near the park? Please contact me if found.",
      authorId: memberId,
      category: "Lost & Found",
      location: "Near Central Park",
    },
    {
      content: "The library will be closed this Friday for maintenance.",
      authorId: organizerId,
      category: "General",
      location: "Public Library",
    },
    {
      content: "Watch out for icy patches on Main St sidewalk.",
      authorId: memberId,
      category: "Safety",
      location: "Main St",
    },
  ];

  for (const notice of noticesData) {
    await storage.createNotice(notice);
  }

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
