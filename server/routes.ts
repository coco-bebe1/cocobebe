import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Posts API
  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      console.log("[API] =========================================");
      console.log("[API] POST /api/posts called");
      console.log("[API] Request body:", JSON.stringify(req.body, null, 2));
      
      if (!req.body || !req.body.title || !req.body.content) {
        console.error("[API] Missing required fields");
        return res.status(400).json({ error: "title and content are required" });
      }
      
      const post = await storage.addPost(req.body);
      console.log("[API] Post added successfully:", post.id);
      console.log("[API] =========================================");
      res.json(post);
    } catch (error: any) {
      console.error("[API] =========================================");
      console.error("[API] ERROR in POST /api/posts");
      console.error("[API] Error message:", error?.message);
      console.error("[API] Error stack:", error?.stack);
      console.error("[API] =========================================");
      res.status(500).json({ error: error.message || "Failed to add post" });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.updatePost(id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePost(id);
      if (!success) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Album Photos API
  app.get("/api/album-photos", async (_req, res) => {
    try {
      const photos = await storage.getAlbumPhotos();
      res.json(photos);
    } catch (error: any) {
      console.error("[API] Error getting album photos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test endpoint
  app.get("/api/test-db", async (_req, res) => {
    try {
      const { pool } = await import("./db.ts");
      const result = await pool.query("SELECT 1 as test");
      res.json({ success: true, test: result.rows[0] });
    } catch (error: any) {
      console.error("[API] Test DB error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/album-photos", async (req, res) => {
    try {
      console.log("[API] =========================================");
      console.log("[API] POST /api/album-photos called");
      console.log("[API] Request body:", JSON.stringify(req.body, null, 2));
      console.log("[API] Request headers:", JSON.stringify(req.headers, null, 2));
      
      if (!req.body || !req.body.title || !req.body.url) {
        console.error("[API] Missing required fields:", { title: req.body?.title, url: req.body?.url });
        return res.status(400).json({ error: "title and url are required" });
      }
      
      const photo = await storage.addAlbumPhoto(req.body);
      console.log("[API] Album photo added successfully:", photo.id);
      console.log("[API] =========================================");
      res.json(photo);
    } catch (error: any) {
      console.error("[API] =========================================");
      console.error("[API] ERROR in POST /api/album-photos");
      console.error("[API] Error type:", error.constructor.name);
      console.error("[API] Error message:", error.message);
      console.error("[API] Error stack:", error.stack);
      console.error("[API] Error code:", error.code);
      console.error("[API] Error detail:", error.detail);
      console.error("[API] Error cause:", error.cause);
      console.error("[API] Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error("[API] =========================================");
      res.status(500).json({ 
        error: error.message || "Failed to add album photo",
        code: error.code,
        detail: error.detail
      });
    }
  });

  app.delete("/api/album-photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAlbumPhoto(id);
      if (!success) {
        return res.status(404).json({ error: "Photo not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Users API
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getAppUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      console.log("[API] POST /api/users called");
      console.log("[API] Request body:", req.body);
      const user = await storage.addAppUser(req.body);
      console.log("[API] User added:", user);
      res.json(user);
    } catch (error: any) {
      console.error("[API] Error adding user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateAppUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteAppUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teachers API
  app.get("/api/teachers", async (_req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      console.log("[API] POST /api/teachers called");
      console.log("[API] Request body:", req.body);
      const teacher = await storage.addTeacher(req.body);
      console.log("[API] Teacher added:", teacher);
      res.json(teacher);
    } catch (error: any) {
      console.error("[API] Error adding teacher:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/teachers/:id", async (req, res) => {
    try {
      const teacher = await storage.updateTeacher(req.params.id, req.body);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeacher(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Classes API
  app.get("/api/classes", async (_req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const cls = await storage.addClass(req.body);
      res.json(cls);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const cls = await storage.updateClass(req.params.id, req.body);
      if (!cls) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(cls);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const success = await storage.deleteClass(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Registered Children API
  app.get("/api/registered-children", async (_req, res) => {
    try {
      const children = await storage.getRegisteredChildren();
      res.json(children);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/registered-children", async (req, res) => {
    try {
      console.log("[API] POST /api/registered-children called");
      console.log("[API] Request body:", req.body);
      const child = await storage.addRegisteredChild(req.body);
      console.log("[API] Registered child added:", child);
      res.json(child);
    } catch (error: any) {
      console.error("[API] Error adding registered child:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/registered-children/:id", async (req, res) => {
    try {
      const child = await storage.updateRegisteredChild(req.params.id, req.body);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
      res.json(child);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/registered-children/:id", async (req, res) => {
    try {
      const success = await storage.deleteRegisteredChild(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Child not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Site Settings API
  app.get("/api/site-settings", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.updateSiteSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
