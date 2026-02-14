import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

// Export auth models so they are included in the schema
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  latitude: doublePrecision("latitude").notNull(), // For map/distance
  longitude: doublePrecision("longitude").notNull(), // For map/distance
  category: text("category").notNull(), // e.g., 'Music', 'Sports', 'Meetup'
  imageUrl: text("image_url"),
  organizerId: text("organizer_id").notNull(), // Links to users.id (which is varchar)
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendees = pgTable("attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: text("user_id").notNull(), // Links to users.id
  status: text("status").notNull().default("going"), // 'going', 'interested'
  createdAt: timestamp("created_at").defaultNow(),
});

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull(), // Links to users.id
  category: text("category").notNull(), // 'General', 'Safety', 'Lost & Found'
  location: text("location"), // Optional location context
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  attendees: many(attendees),
}));

export const attendeesRelations = relations(attendees, ({ one }) => ({
  event: one(events, {
    fields: [attendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [attendees.userId],
    references: [users.id],
  }),
}));

export const noticesRelations = relations(notices, ({ one }) => ({
  author: one(users, {
    fields: [notices.authorId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true, 
  organizerId: true // Set from session
});

export const insertNoticeSchema = createInsertSchema(notices).omit({ 
  id: true, 
  createdAt: true, 
  authorId: true // Set from session
});

export const insertAttendeeSchema = createInsertSchema(attendees).omit({
  id: true,
  createdAt: true,
  userId: true // Set from session
});

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Attendee = typeof attendees.$inferSelect;
export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;

// Request types
export type CreateEventRequest = InsertEvent;
export type UpdateEventRequest = Partial<InsertEvent>;
export type CreateNoticeRequest = InsertNotice;
export type JoinEventRequest = { status: 'going' | 'interested' };

// Response types
// We need to extend Event to include organizer info sometimes, but for strict type matching we'll start with base
export type EventResponse = Event & { 
  organizer?: { id: string, displayName: string, avatarUrl: string | null } | null;
  attendeeCount?: number;
  isAttending?: boolean; // For current user context
};

export type NoticeResponse = Notice & {
  author?: { id: string, displayName: string, avatarUrl: string | null } | null;
};

export type AttendeeResponse = Attendee & {
  user?: { id: string, displayName: string, avatarUrl: string | null } | null;
};
