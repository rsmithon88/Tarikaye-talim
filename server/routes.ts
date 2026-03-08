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
  getAllSettings,
  updateSettings,
  getAllLibraryBooks,
  createLibraryBook,
  updateLibraryBook,
  deleteLibraryBook,
  getBookmarksByDeviceId,
  createBookmark,
  deleteBookmark,
  getAllSupportMessages,
  createSupportMessage,
  markSupportMessageRead,
  deleteSupportMessage,
  getUnreadSupportCount,
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

  // Public library API
  app.get("/api/library", async (_req, res) => {
    try {
      const items = await getAllLibraryBooks();
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Public bookmarks API
  app.get("/api/bookmarks", async (req, res) => {
    try {
      const deviceId = req.query.device_id as string;
      if (!deviceId) return res.status(400).json({ error: "device_id required" });
      const items = await getBookmarksByDeviceId(deviceId);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    try {
      const { device_id, book_id, chapter_id, book_title, chapter_title, scroll_position } = req.body;
      if (!device_id || !chapter_id) return res.status(400).json({ error: "Missing fields" });
      const bookmark = await createBookmark({ device_id, book_id, chapter_id, book_title, chapter_title, scroll_position });
      res.json(bookmark);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const deviceId = req.query.device_id as string;
      if (!deviceId) return res.status(400).json({ error: "device_id required" });
      const deleted = await deleteBookmark(Number(req.params.id), deviceId);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Public support message
  app.post("/api/support", async (req, res) => {
    try {
      const { name, address, mobile, details } = req.body;
      if (!name || !details) return res.status(400).json({ error: "নাম ও বিস্তারিত আবশ্যক" });
      const msg = await createSupportMessage({ name, address, mobile, details });
      res.json(msg);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin library API
  app.get("/api/admin/library", requireAdmin, async (_req, res) => {
    try {
      const items = await getAllLibraryBooks();
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/library", requireAdmin, async (req, res) => {
    try {
      const item = await createLibraryBook(req.body);
      res.json(item);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/admin/library/:id", requireAdmin, async (req, res) => {
    try {
      const item = await updateLibraryBook(Number(req.params.id), req.body);
      res.json(item);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/admin/library/:id", requireAdmin, async (req, res) => {
    try {
      await deleteLibraryBook(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin support messages
  app.get("/api/admin/support", requireAdmin, async (_req, res) => {
    try {
      const messages = await getAllSupportMessages();
      const unreadCount = await getUnreadSupportCount();
      res.json({ messages, unreadCount });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/admin/support/:id/read", requireAdmin, async (req, res) => {
    try {
      await markSupportMessageRead(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/admin/support/:id", requireAdmin, async (req, res) => {
    try {
      await deleteSupportMessage(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Public settings API (developer info)
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await getAllSettings();
      res.json(settings);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin settings API
  app.get("/api/admin/settings", requireAdmin, async (_req, res) => {
    try {
      const settings = await getAllSettings();
      res.json(settings);
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      await updateSettings(req.body);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
