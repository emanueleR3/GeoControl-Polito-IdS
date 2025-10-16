import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import {
  createSensorMeasurement,
  getSensorMeasurementWithStats,
  getSensorStats,
  getSensorOutliers,
  getNetworkMeasurements,
  getNetworkStats,
  getNetworkOutliers,
} from "@controllers/measurementController";
import { MeasurementFromJSON } from "@dto/Measurement";
import { parseStringArrayParam } from "@utils";

const router = Router({ mergeParams: true });

// Store measurements for a sensor (Admin & Operator)
router.post(
  "/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      const measurements = Array.isArray(req.body) ? req.body : [req.body];
      for (const m of measurements) {
        const { createdAt, value } = MeasurementFromJSON(m);
        await createSensorMeasurement(
          req.params.networkCode,
          req.params.gatewayMac,
          req.params.sensorMac,
          createdAt,
          value
        );
      }
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  "/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode, gatewayMac, sensorMac } = req.params;
      const { startDate, endDate } = req.query;
      const result = await getSensorMeasurementWithStats(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(
  "/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode, gatewayMac, sensorMac } = req.params;
      const { startDate, endDate } = req.query;
      const result = await getSensorStats(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a specific sensor
router.get(
  "/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode, gatewayMac, sensorMac } = req.params;
      const { startDate, endDate } = req.query;
      const result = await getSensorOutliers(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  "/:networkCode/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode } = req.params;
      const { sensorMacs, startDate, endDate } = req.query;
      let sensorMacsArr: string[] | undefined = undefined;
      if (sensorMacs) {
        sensorMacsArr = parseStringArrayParam(sensorMacs);
      }
      const result = await getNetworkMeasurements(
        networkCode,
        startDate as string | undefined,
        endDate as string | undefined,
        sensorMacsArr
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  "/:networkCode/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode } = req.params;
      const { sensorMacs, startDate, endDate } = req.query;
      let sensorMacsArr: string[] | undefined = undefined;
      if (sensorMacs) {
        sensorMacsArr = parseStringArrayParam(sensorMacs);
      }
      const result = await getNetworkStats(
        networkCode,
        sensorMacsArr,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  "/:networkCode/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const { networkCode } = req.params;
      const { sensorMacs, startDate, endDate } = req.query;
      let sensorMacsArr: string[] | undefined = undefined;
      if (sensorMacs) {
        sensorMacsArr = parseStringArrayParam(sensorMacs);
      }
      const result = await getNetworkOutliers(
        networkCode,
        sensorMacsArr,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
