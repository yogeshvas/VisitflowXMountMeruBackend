import express from "express";
import {
  add_client,
  client_near_me,
  edit_client_details,
  get_all_clients,
  get_client_by_id_and_visits,
  search_client,
} from "../controllers/client.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").post(authMiddleware, add_client);
router.route("/all").get(authMiddleware, get_all_clients);
router.route("/search").get(authMiddleware, search_client);
router.route("/client-near-me").get(authMiddleware, client_near_me);
router.route("/:id").get(authMiddleware, get_client_by_id_and_visits);
router.route("/:id").patch(authMiddleware, edit_client_details);

export default router;
