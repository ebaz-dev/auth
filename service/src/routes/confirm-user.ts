import express, { Request, Response } from "express";
import { User } from "../shared";
import {
  BadRequestError,
  IsExpired,
  NotFoundError,
  recognizePhoneNumber,
  validateRequest,
} from "@ebazdev/core";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";

const router = express.Router();

router.post(
  "/confirm-user",
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
    body("confirmationCode")
      .trim()
      .notEmpty()
      .withMessage("You must apply confirmation code"),
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
    const { confirmationCode, email, phoneNumber } = req.body;

    const user = email
      ? await User.findOne({ email })
      : await User.findOne({ phoneNumber });

    if (!user) {
      throw new NotFoundError();
    }

    if (
      user.confirmationCodeExpiresAt &&
      IsExpired(user.confirmationCodeExpiresAt).expired
    ) {
      throw new BadRequestError("Expired confirmation code");
    }

    if (user.confirmationCode !== confirmationCode) {
      throw new BadRequestError("Invalid confirmation code");
    }

    if (email) {
      user.isEmailConfirmed = true;
    } else if (phoneNumber) {
      user.isPhoneConfirmed = true;
    }

    user.confirmationCode = undefined;
    user.confirmationCodeExpiresAt = undefined;
    await user.save();

    res.status(StatusCodes.OK).send(user.toJSON());
  }
);

export { router as confirmUser };
