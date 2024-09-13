import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest, BadRequestError } from "@ebazdev/core";
import { User } from "../shared/models/user";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { UserCreatedCreatedPublisher } from "../events/publisher/user-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/signUp",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().isLength({ min: 3, max: 20 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    await new UserCreatedCreatedPublisher(natsWrapper.client).publish({
      id: user.id,
      email: user.email,
    });

    const userJwt = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(StatusCodes.CREATED).send(user);
  }
);

export { router as signUpRouter };
