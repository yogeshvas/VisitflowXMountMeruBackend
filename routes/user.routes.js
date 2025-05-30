import express from "express";
import {
  analytics,
  get_dashboard,
  getAllManagers,
  getMyClients,
  getTeamOfManager,
  getTeamUnderMe,
  getUserById,
  getUserForReview,
  getUsers,
  newClients,
  profile,
  searchUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import multer from "multer"
import { bulkUpload } from "../controllers/user.controller.js";
import {
  addManager,
  mapUserToManager,
} from "../controllers/auth.controller.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });



router.route("/me").get(authMiddleware, profile);
router.post("/bulk-upload", upload.single("file"), bulkUpload);
router.route("/get-analytics").get(authMiddleware, analytics);
router.post(
  "/add-manager",
  authMiddleware,
  roleMiddleware("admin"),
  addManager
);

router.post(
  "/map-user-to-manager",
  authMiddleware,
  roleMiddleware("admin"),
  mapUserToManager
);

router.get("/dashboard", authMiddleware, get_dashboard);
router.get("/get-my-team", authMiddleware, getTeamUnderMe);
router.get(
  "/get-all-managers",
  authMiddleware,
  getAllManagers
);
router.get('/search', searchUser);

router.route("/my-client").get( authMiddleware, getMyClients);
router.get("/get-all-users", authMiddleware, getUsers);
router.get(
  "/get-team-of-manager/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getTeamOfManager
);

router.get("/new-clients", authMiddleware, newClients);

router.get("/find-user-for-review/:id", getUserForReview);
// fallback route
router.get("/find-user/:id", authMiddleware, getUserById);

export default router;
