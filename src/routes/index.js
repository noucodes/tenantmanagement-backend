const express = require("express");
const router = express.Router();
const userRoutes = require("../modules/users/routes/user.routes");
const authMiddleware = require("../middlewares/auth");
const logger = require("../middlewares/logging");

router.use(logger);

// Mount users info routes
router.use("/users", userRoutes);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    employeeId: req.user.employeeId,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;
