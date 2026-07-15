import { Router } from "express";
import { verifyEmail, resendVerification, register, login, changePassword, checkEmail, me, logout } from "../controllers/authController.js";
import { forgotPassword, resetPassword } from "../controllers/passwordResetController.js";

const router = Router();

router.get("/check-email", checkEmail);
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.get("/me", me);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);

export default router;