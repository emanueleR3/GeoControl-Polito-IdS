import { Router } from "express";
import {
  createNetwork,
  deleteNetwork,
  updateNetwork,
  getAllNetworks,
  getNetwork,
} from "@controllers/networkController";
import { NetworkFromJSON } from "@dto/Network";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";

const router = Router();

// Get all networks (Any authenticated user)
router.get("", authenticateUser(), async (req, res, next) => {
  try {
    res.status(200).json(await getAllNetworks());
  } catch (error) {
    next(error);
  }
});

// Create a new network (Admin & Operator)
router.post(
  "",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      await createNetwork(NetworkFromJSON(req.body));
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Get a specific network (Any authenticated user)
router.get("/:networkCode", authenticateUser(), async (req, res, next) => {
  try {
    res.status(200).json(await getNetwork(req.params.networkCode));
  } catch (error) {
    next(error);
  }
});

// Update a network (Admin & Operator)
router.patch(
  "/:networkCode",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      await updateNetwork(req.params.networkCode, NetworkFromJSON(req.body));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Delete a network (Admin & Operator)
router.delete(
  "/:networkCode",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      await deleteNetwork(req.params.networkCode);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
