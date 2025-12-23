import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Get current user's saved/tracked internships
router.get("/", requireAuth, async (req, res) => {
   const apps = await prisma.application.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
   });
   res.json(apps);
});

// Save/track an internship
router.post("/", requireAuth, async (req, res) => {
   const { internshipId, title, company, location } = req.body;

   if (!internshipId || !title || !company || !location) {
      return res.status(400).json({ message: "Missing fields" });
   }

   try {
      const created = await prisma.application.create({
         data: {
            userId: req.userId,
            internshipId,
            title,
            company,
            location,
            status: "Saved",
         },
      });
      res.json(created);
   } catch (e) {
      // likely uniqueness violation (already saved)
      res.status(409).json({ message: "Already saved" });
   }
});

// Update status
router.patch("/:internshipId", requireAuth, async (req, res) => {
   const internshipId = Number(req.params.internshipId);
   const { status } = req.body;

   const updated = await prisma.application.update({
      where: {
         userId_internshipId: { userId: req.userId, internshipId },
      },
      data: { status },
   });

   res.json(updated);
});

// Remove saved internship
router.delete("/:internshipId", requireAuth, async (req, res) => {
   const internshipId = Number(req.params.internshipId);

   await prisma.application.delete({
      where: {
         userId_internshipId: { userId: req.userId, internshipId },
      },
   });

   res.json({ ok: true });
});

export default router;
