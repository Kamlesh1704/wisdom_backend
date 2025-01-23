import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import User from "./User.js"

const Customer = sequelize.define("Customer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
})

Customer.belongsTo(User)
User.hasMany(Customer)

export default Customer

