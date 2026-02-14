import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes, authStorage } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === EVENTS ===

  app.get(api.events.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    
    const events = await storage.getEvents({ category, search });
    
    // Enrich with organizer info
    const enrichedEvents = await Promise.all(events.map(async (event) => {
      const organizer = await authStorage.getUser(event.organizerId);
      const attendees = await storage.getEventAttendees(event.id);
      
      let isAttending = false;
      if (req.isAuthenticated()) {
         const user = req.user as any;
         const attendance = attendees.find(a => a.userId === user.claims.sub);
         if (attendance) isAttending = true;
      }

      return {
        ...event,
        organizer: organizer ? { id: organizer.id, displayName: `${organizer.firstName} ${organizer.lastName}`, avatarUrl: organizer.profileImageUrl } : null,
        attendeeCount: attendees.length,
        isAttending
      };
    }));

    res.json(enrichedEvents);
  });

  app.get(api.events.get.path, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const organizer = await authStorage.getUser(event.organizerId);
    const attendees = await storage.getEventAttendees(event.id);
    
    // Enrich attendees with user profiles
    const enrichedAttendees = await Promise.all(attendees.map(async (a) => {
      const user = await authStorage.getUser(a.userId);
      return {
        ...a,
        user: user ? { id: user.id, displayName: `${user.firstName} ${user.lastName}`, avatarUrl: user.profileImageUrl } : null
      };
    }));

    let isAttending = false;
    if (req.isAuthenticated()) {
       const user = req.user as any;
       const attendance = attendees.find(a => a.userId === user.claims.sub);
       if (attendance) isAttending = true;
    }

    res.json({
      ...event,
      organizer: organizer ? { id: organizer.id, displayName: `${organizer.firstName} ${organizer.lastName}`, avatarUrl: organizer.profileImageUrl } : null,
      attendeeCount: attendees.length,
      attendees: enrichedAttendees,
      isAttending
    });
  });

  app.post(api.events.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.events.create.input.parse(req.body);
      const user = req.user as any;
      
      const event = await storage.createEvent({
        ...input,
        organizerId: user.claims.sub
      });
      
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.events.update.path, isAuthenticated, async (req, res) => {
    const eventId = Number(req.params.id);
    const event = await storage.getEvent(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = req.user as any;
    if (event.organizerId !== user.claims.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.events.update.input.parse(req.body);
      const updated = await storage.updateEvent(eventId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.events.join.path, isAuthenticated, async (req, res) => {
    try {
      const { status } = api.events.join.input.parse(req.body);
      const user = req.user as any;
      const attendee = await storage.joinEvent(Number(req.params.id), user.claims.sub, status);
      res.json(attendee);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.events.leave.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    await storage.leaveEvent(Number(req.params.id), user.claims.sub);
    res.status(204).end();
  });

  // === NOTICES ===

  app.get(api.notices.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const notices = await storage.getNotices(category);
    
    const enrichedNotices = await Promise.all(notices.map(async (notice) => {
      const author = await authStorage.getUser(notice.authorId);
      return {
        ...notice,
        author: author ? { id: author.id, displayName: `${author.firstName} ${author.lastName}`, avatarUrl: author.profileImageUrl } : null
      };
    }));
    
    res.json(enrichedNotices);
  });

  app.post(api.notices.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.notices.create.input.parse(req.body);
      const user = req.user as any;
      
      const notice = await storage.createNotice({
        ...input,
        authorId: user.claims.sub
      });
      
      res.status(201).json(notice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed data function could be here, but for MVP we'll skip complex seeding logic in routes
  // or put it in a separate call if needed.
  
  return httpServer;
}
