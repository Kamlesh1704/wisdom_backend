import express from "express"
import { initDb, initializeDBAndServer, dbMiddleware } from "./config/database.js"
import customerRoutes from "./routes/customerRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.use(express.json())

// Initialize db
initDb()
  .then(() => {
    console.log("Database schema initialized")

    // Initialize server after database is ready
    initializeDBAndServer(app)
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err)
    process.exit(1)
  })

// Use database middleware
app.use(dbMiddleware)

// Routes
app.use(customerRoutes)
app.use(authRoutes)

export default app

