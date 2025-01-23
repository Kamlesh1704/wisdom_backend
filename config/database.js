import { open } from "sqlite"
import sqlite3 from "sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, "..", "wisdom.db")

export async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
}

export async function initDb() {
  const db = await openDb()
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS Customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      company TEXT,
      UserId TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (UserId) REFERENCES Users(id)
    );
  `)
  await db.close()
}

let db = null

export async function initializeDBAndServer(app) {
  try {
    db = await openDb()

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/")
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

// Make the database connection available to your routes
export function dbMiddleware(req, res, next) {
  req.db = db
  next()
}