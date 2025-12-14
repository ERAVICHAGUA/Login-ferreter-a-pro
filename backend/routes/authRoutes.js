import express from "express";
import { login, register } from "../controllers/authController.js";
import { body } from "express-validator";

const router = express.Router();

/* =========================================================
   ✅ VALIDAR INPUTS EN /login (OWASP)
========================================================= */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isString()
      .isLength({ min: 4 })
      .withMessage("Password inválido"),
    body("captcha").isString().notEmpty().withMessage("Captcha requerido"),
  ],
  login
);

/* =========================================================
   ✅ VALIDAR INPUTS EN /register (OWASP)
========================================================= */
router.post(
  "/register",
  [
    body("nombre").isString().notEmpty().withMessage("Nombre requerido"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password inválido"),
  ],
  register
);

export default router;