import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  BadRequestError,
  recognizePhoneNumber,
} from "@ebazdev/core";
import { User, UserDoc } from "../shared/models/user";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { UserCreatedCreatedPublisher } from "../events/publisher/user-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import { generateConfirmationCode } from "../shared/utils/generate-confirmation-code";

const router = express.Router();

router.post(
  "/signUp",
  [
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("phoneNumber")
      .optional()
      .isLength({ min: 8, max: 8 })
      .custom((value) => {
        const recognized = recognizePhoneNumber(value);
        return recognized.found;
      })
      .withMessage("Phone number must be valid"),
    body("password").trim().isLength({ min: 3, max: 20 }),
    body()
      .custom((value) => {
        if (!value.email && !value.phoneNumber) {
          return false;
        }
        return true;
      })
      .withMessage("Either email or phone number is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, phoneNumber } = req.body;

    let existingUser;

    if (email) {
      existingUser = await User.findOne({ email });
    } else if (phoneNumber) {
      existingUser = await User.findOne({ phoneNumber });
    }

    if (
      existingUser &&
      (existingUser.isEmailConfirmed || existingUser.isPhoneConfirmed)
    ) {
      throw new BadRequestError("User already exist");
    }

    const confirmationCode = generateConfirmationCode();
    const user = existingUser ? existingUser : new User({ email, phoneNumber });
    user.confirmationCode = confirmationCode;
    user.password = password;

    await user.save();

    // Publish user created event
    await new UserCreatedCreatedPublisher(natsWrapper.client).publish({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      confirmationCode,
    });

    res.status(StatusCodes.CREATED).send();
  }
);

export { router as signUpRouter };
