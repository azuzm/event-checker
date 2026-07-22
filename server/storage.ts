import { db } from "./db";
import {
  users, events, attendees, notices,
  type InsertEvent, type UpdateEventRequest,
  type InsertNotice,
  type Event, type Notice, type Attendee
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Events
  getEvents(filters?: { category?: string; search?: string }): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: UpdateEventRequest): Promise<Event>;

  // Attendees
  joinEvent(eventId: number, userId: string, status: string): Promise<Attendee>;
  leaveEvent(eventId: number, userId: string): Promise<void>;
  getEventAttendees(eventId: number): Promise<Attendee[]>;
  getUserAttendance(eventId: number, userId: string): Promise<Attendee | undefined>;

  // Notices
  getNotices(category?: string): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
}

export class DatabaseStorage implements IStorage {
  // Events
  async getEvents(filters?: { category?: string; search?: string }): Promise<Event[]> {
    let query = db.select().from(events);

    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(events.category, filters.category));
    }
    // Search could be ILIKE if we wanted to implement it, skipping for now or simple exact match

    if (conditions.length > 0) {
      // @ts-ignore - simple condition composition
      return await query.where(and(...conditions)).orderBy(desc(events.date));
    }

    return await query.orderBy(desc(events.date));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, updates: UpdateEventRequest): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  // Attendees
  async joinEvent(eventId: number, userId: string, status: string): Promise<Attendee> {
    // Check if already exists
    const existing = await this.getUserAttendance(eventId, userId);
    if (existing) {
      const [updated] = await db
        .update(attendees)
        .set({ status })
        .where(eq(attendees.id, existing.id))
        .returning();
      return updated;
    }

    const [attendee] = await db
      .insert(attendees)
      .values({ eventId, userId, status })
      .returning();
    return attendee;
  }

  async leaveEvent(eventId: number, userId: string): Promise<void> {
    await db
      .delete(attendees)
      .where(and(eq(attendees.eventId, eventId), eq(attendees.userId, userId)));
  }

  async getEventAttendees(eventId: number): Promise<Attendee[]> {
    return await db.select().from(attendees).where(eq(attendees.eventId, eventId));
  }

  async getUserAttendance(eventId: number, userId: string): Promise<Attendee | undefined> {
    const [attendee] = await db
      .select()
      .from(attendees)
      .where(and(eq(attendees.eventId, eventId), eq(attendees.userId, userId)));
    return attendee;
  }

  // Notices
  async getNotices(category?: string): Promise<Notice[]> {
    if (category) {
      return await db
        .select()
        .from(notices)
        .where(eq(notices.category, category))
        .orderBy(desc(notices.createdAt));
    }
    return await db.select().from(notices).orderBy(desc(notices.createdAt));
  }

  async createNotice(notice: InsertNotice): Promise<Notice> {
    const [newNotice] = await db.insert(notices).values(notice).returning();
    return newNotice;
  }
}

export class MockStorage implements IStorage {
  private events: Event[] = [];
  private attendees: Attendee[] = [];
  private notices: Notice[] = [];
  private eventId = 1;
  private attendeeId = 1;
  private noticeId = 1;

  constructor() {
    // Add some dummy data
    this.createEvent({
      title: "Tech Meetup",
      description: "A meetup for tech enthusiasts",
      date: new Date(),
      location: "San Francisco",
      latitude: 37.7749,
      longitude: -122.4194,
      category: "Meetup",
      organizerId: "user1",
      imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad",
    });
  }

  async getEvents(filters?: { category?: string; search?: string }): Promise<Event[]> {
    let filtered = [...this.events];
    if (filters?.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search)
      );
    }
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.find(e => e.id === id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Event = {
      ...event,
      id: this.eventId++,
      createdAt: new Date(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async updateEvent(id: number, updates: UpdateEventRequest): Promise<Event> {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Event not found");

    const updated = { ...this.events[index], ...updates };
    this.events[index] = updated;
    return updated;
  }

  async joinEvent(eventId: number, userId: string, status: string): Promise<Attendee> {
    const existingIndex = this.attendees.findIndex(a => a.eventId === eventId && a.userId === userId);
    if (existingIndex !== -1) {
      this.attendees[existingIndex].status = status;
      return this.attendees[existingIndex];
    }

    const attendee: Attendee = {
      id: this.attendeeId++,
      eventId,
      userId,
      status,
      createdAt: new Date(),
    };
    this.attendees.push(attendee);
    return attendee;
  }

  async leaveEvent(eventId: number, userId: string): Promise<void> {
    this.attendees = this.attendees.filter(a => !(a.eventId === eventId && a.userId === userId));
  }

  async getEventAttendees(eventId: number): Promise<Attendee[]> {
    return this.attendees.filter(a => a.eventId === eventId);
  }

  async getUserAttendance(eventId: number, userId: string): Promise<Attendee | undefined> {
    return this.attendees.find(a => a.eventId === eventId && a.userId === userId);
  }

  async getNotices(category?: string): Promise<Notice[]> {
    if (category) {
      return this.notices.filter(n => n.category === category).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    }
    return this.notices.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async createNotice(notice: InsertNotice): Promise<Notice> {
    const newNotice: Notice = {
      ...notice,
      id: this.noticeId++,
      createdAt: new Date(),
    };
    this.notices.push(newNotice);
    return newNotice;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MockStorage();
