import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { openDb } from "../config/database.js"

// export const register = async (req, res, next) => {
//   const db = await openDb()
//   try {
//     const { username, password } = req.body
//     const hashedPassword = await bcrypt.hash(password, 10)
//     const id = uuidv4()
//     const now = new Date().toISOString()

//     await db.run("INSERT INTO Users (id, username, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)", [
//       id,
//       username,
//       hashedPassword,
//       now,
//       now,
//     ])

//     const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" })
//     res.status(201).json({ token })
//   } catch (error) {
//     if (error.message.includes("UNIQUE constraint failed: Users.username")) {
//       res.status(400).json({ message: "Username already exists" })
//     } else {
//       next(error)
//     }
//   } finally {
//     await db.close()
//   }
// }
export const register = async (req, res, next) => {
  const db = await openDb()
  const { username, password } = req.body;
  if(!username || !password){
    res.send("Provide all the necessary fields")
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM Users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const id = uuidv4()
    const now = new Date().toISOString()
    const createUserQuery = `
      INSERT INTO 
        Users (id, username, password, createdAt, updatedAt) 
      VALUES 
        (
          '${id}', 
          '${username}',
          '${hashedPassword}', 
          '${now}',
          '${now}'
        )`;
    const dbResponse = await db.run(createUserQuery);

    const newUserId = dbResponse.lastID;
    res.send(`Created new user with ${newUserId}`);
  } else {
    res.status = 400;
    res.send("User already exists");
  }
}

export const login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(422).json({ error: "Please add both Username and Password" })
  }

  const db = await openDb()
  try {
    const savedUser = await db.get("SELECT * FROM Users WHERE username = ?", username)
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid Username" })
    }

    const match = await bcrypt.compare(password, savedUser.password)
    if (match) {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables")
      }
      const token = jwt.sign({user: savedUser}, process.env.JWT_SECRET, { expiresIn: "1d" })
      return res.json({
        token,
        message: "Signed In Successfully",
        user: { username: savedUser.username },
      })
    } else {
      return res.status(422).json({ error: "Invalid password" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal Server Error" })
  } finally {
    await db.close()
  }
}

