import { z } from 'zod';
import { insertEventSchema, insertNoticeSchema, events, notices, attendees, insertAttendeeSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        latitude: z.coerce.number().optional(),
        longitude: z.coerce.number().optional(),
        radius: z.coerce.number().optional(), // in km
      }).optional(),
      responses: {
        200: z.array(z.custom<any>()), // Using any because of the joined fields (organizer, etc)
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id' as const,
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/events/:id' as const,
      input: insertEventSchema.partial(),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/events/:id/attend' as const,
      input: z.object({ status: z.enum(['going', 'interested']) }),
      responses: {
        200: z.custom<typeof attendees.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    leave: {
      method: 'DELETE' as const,
      path: '/api/events/:id/attend' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    attendees: {
      method: 'GET' as const,
      path: '/api/events/:id/attendees' as const,
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
  },
  notices: {
    list: {
      method: 'GET' as const,
      path: '/api/notices' as const,
      input: z.object({
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/notices' as const,
      input: insertNoticeSchema,
      responses: {
        201: z.custom<typeof notices.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
