import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import {
  createSensor,
  deleteSensor,
  getAllSensors,
  getSensor,
  updateSensor,
} from "@controllers/sensorController";
import { SensorFromJSON } from "@dto/Sensor";
import { getNetwork } from "@controllers/networkController";
import { NotFoundError } from "@models/errors/NotFoundError";

const router = Router({ mergeParams: true });

// Get all sensors
router.get(
  "",
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

      // console.log("Fetching all sensors for gateway:", req.params.gatewayMac);
      res.status(200).json(await getAllSensors(req.params.gatewayMac));
    } catch (error) {
      next(error);
    }
  }
);

// Create a new sensor (Admin & Operator)
router.post(
  "",
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

      await createSensor(req.params.gatewayMac, SensorFromJSON(req.body));
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Get a specific sensor (Any authenticated user)
router.get(
  "/:sensorMac",
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

      res.status(200).json(await getSensor(req.params.sensorMac));
    } catch (error) {
      next(error);
    }
  }
);

// Update a sensor (Admin & Operator)
router.patch(
  "/:sensorMac",
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

      console.log("Request body:", req.body);
      await updateSensor(req.params.sensorMac, SensorFromJSON(req.body));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Delete a sensor (Admin & Operator)
router.delete(
  "/:sensorMac",
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

      await deleteSensor(req.params.sensorMac);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
