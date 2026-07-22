import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import MemoryStore from "memorystore";

const getOidcConfig = memoize(
  async () => {
    if (!process.env.REPL_ID) return null;
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    return session({
      secret: process.env.SESSION_SECRET || "dev_secret",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    });
  } else {
    const MemStore = MemoryStore(session);
    return session({
      secret: process.env.SESSION_SECRET || "dev_secret",
      store: new MemStore({
        checkPeriod: 86400000
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // process.env.NODE_ENV === "production" might be true if we don't set it, but for local dev we want false usually if not https
        maxAge: sessionTtl,
      },
    });
  }
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  if (!process.env.REPL_ID) {
    // Local Dev Strategy
    passport.use(new LocalStrategy(async (username, password, done) => {
      // Mock login for dev
      const user = {
        id: "user1",
        username: "demo_user",
        firstName: "Demo",
        lastName: "User",
        claims: {
          sub: "user1",
          exp: Math.floor(Date.now() / 1000) + 86400, // 24h
          first_name: "Demo",
          last_name: "User"
        },
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };
      return done(null, user);
    }));

    // Mock login route
    app.post("/api/login", (req, res, next) => {
      // Auto login as dev user
      const user = {
        id: "user1",
        username: "demo_user",
        firstName: "Demo",
        lastName: "User",
        claims: {
          sub: "user1",
          exp: Math.floor(Date.now() / 1000) + 86400,
          first_name: "Demo",
          last_name: "User"
        },
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({ success: true, user });
      });
    });

    // Mock GET login for direct navigation
    app.get("/api/login", (req, res, next) => {
      const user = {
        id: "user1",
        username: "demo_user",
        firstName: "Demo",
        lastName: "User",
        claims: {
          sub: "user1",
          exp: Math.floor(Date.now() / 1000) + 86400,
          first_name: "Demo",
          last_name: "User"
        },
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };
      req.login(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    });

    // Mock callback route (not really needed for local, but to satisfy routes)
    app.get("/api/callback", (req, res) => res.redirect("/"));

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });

    return;
  }

  const config = await getOidcConfig();
  if (!config) return; // Should not happen given check above

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (process.env.REPL_ID === undefined) {
    if (req.isAuthenticated()) return next();
    // For testing, maybe we want to allow bypass or strict?
    // Strict for now, require login via /api/login for dev
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    if (config) {
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
    }
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
