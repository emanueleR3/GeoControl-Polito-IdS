import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import {
  createGateway,
  deleteGateway,
  getAllGateways,
  getGateway,
  updateGateway,
} from "@controllers/gatewayController";
import { GatewayFromJSON } from "@dto/Gateway";
import { getNetwork } from "@controllers/networkController";
import { NotFoundError } from "@models/errors/NotFoundError";

const router = Router({ mergeParams: true });

// base route: /networks/:networkCode/gateways
router.get(
  "",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      res.status(200).json(await getAllGateways(req.params.networkCode));
    } catch (error) {
      next(error);
    }
  }
);

// Create a new gateway (Admin & Operator)
router.post(
  "",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      await createGateway(req.params.networkCode, GatewayFromJSON(req.body));
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Get a specific gateway (Any authenticated user)
router.get(
  "/:gatewayMac",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      // Validate the hierarchy: network -> gateway (single efficient query with eager loading)
      const network = await getNetwork(req.params.networkCode);

      // Verify that the gateway belongs to the specified network
      const gatewayExists = network.gateways?.some(
        (gateway) => gateway.macAddress === req.params.gatewayMac
      );
      if (!gatewayExists) {
        throw new NotFoundError(
          `Gateway '${req.params.gatewayMac}' not found in network '${req.params.networkCode}'`
        );
      }

      res.status(200).json(await getGateway(req.params.gatewayMac));
    } catch (error) {
      next(error);
    }
  }
);

// Update a gateway (Admin & Operator)
router.patch(
  "/:gatewayMac",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      // Validate the hierarchy: network -> gateway (single efficient query with eager loading)
      const network = await getNetwork(req.params.networkCode);

      // Verify that the gateway belongs to the specified network
      const gatewayExists = network.gateways?.some(
        (gateway) => gateway.macAddress === req.params.gatewayMac
      );
      if (!gatewayExists) {
        throw new NotFoundError(
          `Gateway '${req.params.gatewayMac}' not found in network '${req.params.networkCode}'`
        );
      }

      await updateGateway(req.params.gatewayMac, GatewayFromJSON(req.body));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Delete a gateway (Admin & Operator)
router.delete(
  "/:gatewayMac",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      // Validate the hierarchy: network -> gateway (single efficient query with eager loading)
      const network = await getNetwork(req.params.networkCode);

      // Verify that the gateway belongs to the specified network
      const gatewayExists = network.gateways?.some(
        (gateway) => gateway.macAddress === req.params.gatewayMac
      );
      if (!gatewayExists) {
        throw new NotFoundError(
          `Gateway '${req.params.gatewayMac}' not found in network '${req.params.networkCode}'`
        );
      }

      await deleteGateway(req.params.gatewayMac);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
