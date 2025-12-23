import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const router = Router();

router.post("/register", async (req, res) => {
   try {
      const { name, email, password } = req.body;

      if (!email || !password)
         return res
            .status(400)
            .json({ message: "Email and password required" });

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing)
         return res.status(409).json({ message: "Email already used" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
         data: { name: name || null, email, passwordHash },
         select: { id: true, name: true, email: true },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
         expiresIn: "7d",
      });

      res.json({ user, token });
   } catch (e) {
      res.status(500).json({ message: "Register failed" });
   }
});

router.post("/login", async (req, res) => {
   try {
      const { email, password } = req.body;

      if (!email || !password)
         return res
            .status(400)
            .json({ message: "Email and password required" });

      const userRecord = await prisma.user.findUnique({ where: { email } });
      if (!userRecord)
         return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, userRecord.passwordHash);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const user = {
         id: userRecord.id,
         name: userRecord.name,
         email: userRecord.email,
      };

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
         expiresIn: "7d",
      });

      res.json({ user, token });
   } catch {
      res.status(500).json({ message: "Login failed" });
   }
});

export default router;
