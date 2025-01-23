import { openDb } from "../config/database.js"
import { v4 as uuidv4 } from "uuid"

export const createCustomer = async (req, res, next) => {
  const db = req.db
  try {
    const { name, email, phone, company } = req.body

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" })
    }
    const userId = req.user

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required fields" })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    const id = uuidv4()
    const now = new Date().toISOString()

    await db.run(
      "INSERT INTO Customers (id, name, email, phone, company, UserId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, email, phone, company, userId, now, now],
    )

    const newCustomer = await db.get("SELECT * FROM Customers WHERE id = ?", id)
    res.status(201).json(newCustomer)
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed: Customers.email")) {
      res.status(400).json({ message: "Email already exists" })
    } else {
      next(error)
    }
  }
}

export const getCustomers = async (req, res, next) => {
  const db = await openDb()
  try{
    const query = `SELECT * FROM Customers`;
    const customers = await db.all(query);
    res.status(201).json({customers: customers});
  }catch(error){
    next(error)
  }
}

export const getCustomer = async (req, res, next) => {
  const db = await openDb()
  try {
    const customer = await db.get("SELECT * FROM Customers WHERE id = ?", req.params.id)
    if (!customer) return res.status(404).json({ message: "Customer not found" })
    res.status(201).json(customer)
  } catch (error) {
    next(error)
  } finally {
    await db.close()
  }
}

export const updateCustomer = async (req, res, next) => {
  const db = await openDb()
  try {
    const { name, email, phone, company } = req.body
    const now = new Date().toISOString()

    const result = await db.run(
      "UPDATE Customers SET name = ?, email = ?, phone = ?, company = ?, updatedAt = ? WHERE id = ?",
      [name, email, phone, company, now, req.params.id],
    )

    const updatedCustomer = await db.get("SELECT * FROM Customers WHERE id = ?", req.params.id)
    res.status(201).json(updatedCustomer)
  } catch (error) {
      next(error)
  } finally {
    await db.close()
  }
}

export const deleteCustomer = async (req, res, next) => {
  const db = await openDb()
  try {
    const result = await db.run("DELETE FROM Customers WHERE id = ? ", [req.params.id])
    if (result.changes === 0) return res.status(404).json({ message: "Customer not found" })
    res.status(201).json({message:"deleted succesfully"})
  } catch (error) {
    next(error)
  } finally {
    await db.close()
  }
}

