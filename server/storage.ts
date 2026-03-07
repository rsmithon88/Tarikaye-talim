import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface Book {
  id: number;
  title: string;
  description: string;
  author: string;
  cover_color: string;
  cover_accent: string;
  published: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  chapter_count?: number;
}

export interface Chapter {
  id: number;
  book_id: number;
  title: string;
  content: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export async function getAllBooks(publishedOnly = true): Promise<Book[]> {
  const query = publishedOnly
    ? `SELECT b.*, COUNT(c.id)::int AS chapter_count FROM books b
       LEFT JOIN chapters c ON c.book_id = b.id
       WHERE b.published = true
       GROUP BY b.id ORDER BY b.sort_order, b.created_at`
    : `SELECT b.*, COUNT(c.id)::int AS chapter_count FROM books b
       LEFT JOIN chapters c ON c.book_id = b.id
       GROUP BY b.id ORDER BY b.sort_order, b.created_at`;
  const { rows } = await pool.query(query);
  return rows;
}

export async function getBookById(id: number): Promise<Book | null> {
  const { rows } = await pool.query(
    `SELECT b.*, COUNT(c.id)::int AS chapter_count FROM books b
     LEFT JOIN chapters c ON c.book_id = b.id
     WHERE b.id = $1 GROUP BY b.id`,
    [id]
  );
  return rows[0] || null;
}

export async function createBook(data: Partial<Book>): Promise<Book> {
  const { rows } = await pool.query(
    `INSERT INTO books (title, description, author, cover_color, cover_accent, published, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      data.title,
      data.description || "",
      data.author || "",
      data.cover_color || "#1E3A5F",
      data.cover_accent || "#C9A84C",
      data.published !== false,
      data.sort_order || 0,
    ]
  );
  return rows[0];
}

export async function updateBook(id: number, data: Partial<Book>): Promise<Book | null> {
  const { rows } = await pool.query(
    `UPDATE books SET title=$1, description=$2, author=$3, cover_color=$4, cover_accent=$5,
     published=$6, sort_order=$7, updated_at=NOW() WHERE id=$8 RETURNING *`,
    [
      data.title,
      data.description,
      data.author,
      data.cover_color,
      data.cover_accent,
      data.published,
      data.sort_order,
      id,
    ]
  );
  return rows[0] || null;
}

export async function deleteBook(id: number): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM books WHERE id=$1", [id]);
  return (rowCount || 0) > 0;
}

export async function getChaptersByBookId(bookId: number): Promise<Chapter[]> {
  const { rows } = await pool.query(
    "SELECT * FROM chapters WHERE book_id=$1 ORDER BY sort_order, created_at",
    [bookId]
  );
  return rows;
}

export async function getChapterById(id: number): Promise<Chapter | null> {
  const { rows } = await pool.query("SELECT * FROM chapters WHERE id=$1", [id]);
  return rows[0] || null;
}

export async function createChapter(data: Partial<Chapter>): Promise<Chapter> {
  const { rows } = await pool.query(
    `INSERT INTO chapters (book_id, title, content, sort_order)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.book_id, data.title, data.content || "", data.sort_order || 0]
  );
  return rows[0];
}

export async function updateChapter(id: number, data: Partial<Chapter>): Promise<Chapter | null> {
  const { rows } = await pool.query(
    `UPDATE chapters SET title=$1, content=$2, sort_order=$3, updated_at=NOW()
     WHERE id=$4 RETURNING *`,
    [data.title, data.content, data.sort_order, id]
  );
  return rows[0] || null;
}

export async function deleteChapter(id: number): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM chapters WHERE id=$1", [id]);
  return (rowCount || 0) > 0;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const { rows } = await pool.query("SELECT key, value FROM settings");
  const result: Record<string, string> = {};
  rows.forEach((r: { key: string; value: string }) => {
    result[r.key] = r.value;
  });
  return result;
}

export async function updateSettings(data: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(data)) {
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
      [key, value]
    );
  }
}
