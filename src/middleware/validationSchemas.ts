const expressValidator = require("express-validator");
const { body } = expressValidator;

export const registerValidationSchema = [
  body("username").notEmpty().withMessage("Username required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

export const loginValidationSchema = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

export const recoverValidationSchema = [body("email").isEmail().withMessage("Valid email required")];

export const passwordResetValidationSchema = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

export const secretValidationSchema = [
  body("service").notEmpty().withMessage("Service required"),
  body("service_user_id").notEmpty().withMessage("Service_user_id required"),
  body("password").notEmpty().withMessage("Password required"),
];
