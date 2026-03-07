import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "fs";
import * as path from "path";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getChaptersByBookId,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} from "./storage";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-admin-token"] as string;
  if (token === ADMIN_PASSWORD) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve admin panel HTML
  app.get("/admin", (_req, res) => {
    const adminPath = path.resolve(process.cwd(), "server", "templates", "admin.html");
    res.sendFile(adminPath);
  });

  // Admin login check
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
      res.status(401).json({ error: "Wrong password" });
    }
  });

  // Public API
  app.get("/api/books", async (_req, res) => {
    try {
      const books = await getAllBooks(true);
      res.json(books);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await getBookById(Number(req.params.id));
      if (!book) return res.status(404).json({ error: "Not found" });
      res.json(book);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/books/:id/chapters", async (req, res) => {
    try {
      const chapters = await getChaptersByBookId(Number(req.params.id));
      res.json(chapters);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await getChapterById(Number(req.params.id));
      if (!chapter) return res.status(404).json({ error: "Not found" });
      res.json(chapter);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin API (protected)
  app.get("/api/admin/books", requireAdmin, async (_req, res) => {
    try {
      const books = await getAllBooks(false);
      res.json(books);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/books", requireAdmin, async (req, res) => {
    try {
      const book = await createBook(req.body);
      res.status(201).json(book);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/admin/books/:id", requireAdmin, async (req, res) => {
    try {
      const book = await updateBook(Number(req.params.id), req.body);
      if (!book) return res.status(404).json({ error: "Not found" });
      res.json(book);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/admin/books/:id", requireAdmin, async (req, res) => {
    try {
      const ok = await deleteBook(Number(req.params.id));
      if (!ok) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/admin/books/:id/chapters", requireAdmin, async (req, res) => {
    try {
      const chapters = await getChaptersByBookId(Number(req.params.id));
      res.json(chapters);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/books/:id/chapters", requireAdmin, async (req, res) => {
    try {
      const chapter = await createChapter({ ...req.body, book_id: Number(req.params.id) });
      res.status(201).json(chapter);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/admin/chapters/:id", requireAdmin, async (req, res) => {
    try {
      const chapter = await updateChapter(Number(req.params.id), req.body);
      if (!chapter) return res.status(404).json({ error: "Not found" });
      res.json(chapter);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/admin/chapters/:id", requireAdmin, async (req, res) => {
    try {
      const ok = await deleteChapter(Number(req.params.id));
      if (!ok) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
