import express from "express";
import { Request, Response } from "express";
import { Router } from "express";
import {
  createUser,
  getUsersById,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router: Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  await createUser(req, res);
});
router.get("/:id", async (req: Request, res: Response) => {
  await getUsersById(req, res);
});
router.put("/:id", async (req: Request, res: Response) => {
  await updateUser(req, res);
});
router.delete("/:id", async (req: Request, res: Response) => {
  await deleteUser(req, res);
});

export default router;
