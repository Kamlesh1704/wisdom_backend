import express from "express"
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/", protect, createCustomer)
router.get("/", protect, getCustomers)
router.get("/:id", protect, getCustomer)
router.put("/:id", protect, updateCustomer)
router.delete("/:id", protect, deleteCustomer)
export default router

