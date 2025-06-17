import { Request, Response } from "express";
import db from "../config/firebase";
import { DocumentData } from "firebase-admin/firestore";
import { z } from "zod";

// Base types
interface UserBase {
  name: string;
  email: string;
}

// Type definitions
interface User extends UserBase {
  id?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface CreateUserData extends UserBase {}

interface UpdateUserData extends Partial<UserBase> {}

// Basic validation schemas
const nameSchema = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no debe exceder los 100 caracteres")
  .regex(
    /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/,
    "El nombre solo puede contener letras y espacios"
  );

const emailSchema = z
  .string()
  .email("Formato de email inválido")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de email inválido")
  .min(5, "El email debe tener al menos 5 caracteres");

// Combined validation schemas
const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body as CreateUserData;

    // Validate input data
    const parsedData = createUserSchema.safeParse(userData);
    if (!parsedData.success) {
      return res.status(400).json({
        error: "Validation error",
        details: parsedData.error.issues.map((issue) => issue.message),
      });
    }

    const userRef = db.collection("users").doc();
    await userRef.set({
      ...userData,
      id: userRef.id,
      createdAt: new Date(),
    });

    return res.status(201).json({ id: userRef.id });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};

export const getUsersById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(userDoc.data());
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({ error: "Failed to get user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body as UpdateUserData;

    // Validate input data
    const parsedData = updateUserSchema.safeParse(userData);
    if (!parsedData.success) {
      return res.status(400).json({
        error: "Validation error",
        details: parsedData.error.issues.map((issue) => issue.message),
      });
    }

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData: Partial<User> = {};
    if (userData.name) updateData.name = userData.name;
    if (userData.email) updateData.email = userData.email;
    updateData.updatedAt = new Date();

    await userRef.update(updateData);
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRef = db.collection("users").doc(id);

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.delete();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

export default {
  createUser,
  getUsersById,
  updateUser,
  deleteUser,
};
