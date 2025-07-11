import { Request, Response } from "express";
import prisma from "../config/prisma";

export const findUserByEmail = async (req: Request, res: Response) => {
  const { email } = req.query;
  const currentUserId = (req as any).user.id;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await prisma.user.findUnique({ where: { email: email.toString() } });

  if (!user || user.id === currentUserId) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
};
