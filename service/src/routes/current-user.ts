import express, { Request, Response } from "express";
import { requireAuth } from "@ebazdev/core";
import { User } from "../shared";

const router = express.Router();

router.get("/currentuser", requireAuth, async (req: Request, res: Response) => {
  const user = await User.findById(req.currentUser?.id);

  res.send({ currentUser: user || null });
});

export { router as currentUserRouter };
