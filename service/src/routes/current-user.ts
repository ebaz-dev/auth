import express, { Request, Response } from "express";
import { BadRequestError, currentUser, NotFoundError } from "@ebazdev/core";
import { User } from "../shared";

const router = express.Router();

router.get("/currentuser", currentUser, async (req: Request, res: Response) => {
  const user = await User.findById(req.currentUser?.id);

  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
