const { body, param } = require('express-validator');

const createVehicleValidator = [
  body('plateNumber')
    .optional()
    .trim()
    .escape(),

  body('registrationType')
    .optional()
    .trim()
    .escape(),

  body('vehicleMaker')
    .optional()
    .trim()
    .escape(),

  body('vehicleModel')
    .optional()
    .trim()
    .escape(),

  body('modelYear')
    .optional()
    .isNumeric().withMessage('Model year must be a number'),

  body('sequenceNumber')
    .optional()
    .trim()
    .escape(),

  body('chassisNumber')
    .optional()
    .trim()
    .escape(),

  body('basicColor')
    .optional()
    .trim()
    .escape(),

  body('licenseExpiryDate')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      // Accept YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
      // Accept ISO8601 format
      const date = new Date(value);
      if (!isNaN(date.getTime())) return true;
      throw new Error('Invalid license expiry date format');
    }),

  body('inspectionExpiryDate')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      // Accept YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
      // Accept ISO8601 format
      const date = new Date(value);
      if (!isNaN(date.getTime())) return true;
      throw new Error('Invalid inspection expiry date format');
    }),

  body('actualDriverId')
    .optional()
    .trim()
    .escape(),

  body('actualDriverName')
    .optional()
    .trim()
    .escape(),

  body('inspectionStatus')
    .optional()
    .trim()
    .escape(),

  body('insuranceStatus')
    .optional()
    .trim()
    .escape()
];

const updateVehicleValidator = [
  param('id')
    .isMongoId().withMessage('Invalid vehicle ID'),

  body('plateNumber')
    .optional()
    .trim()
    .escape(),

  body('registrationType')
    .optional()
    .trim()
    .escape(),

  body('vehicleMaker')
    .optional()
    .trim()
    .escape(),

  body('vehicleModel')
    .optional()
    .trim()
    .escape(),

  body('modelYear')
    .optional()
    .isNumeric().withMessage('Model year must be a number'),

  body('sequenceNumber')
    .optional()
    .trim()
    .escape(),

  body('chassisNumber')
    .optional()
    .trim()
    .escape(),

  body('basicColor')
    .optional()
    .trim()
    .escape(),

  body('licenseExpiryDate')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
      const date = new Date(value);
      if (!isNaN(date.getTime())) return true;
      throw new Error('Invalid license expiry date format');
    }),

  body('inspectionExpiryDate')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
      const date = new Date(value);
      if (!isNaN(date.getTime())) return true;
      throw new Error('Invalid inspection expiry date format');
    }),

  body('actualDriverId')
    .optional()
    .trim()
    .escape(),

  body('actualDriverName')
    .optional()
    .trim()
    .escape(),

  body('inspectionStatus')
    .optional()
    .trim()
    .escape(),

  body('insuranceStatus')
    .optional()
    .trim()
    .escape()
];

const deleteVehicleValidator = [
  param('id')
    .isMongoId().withMessage('Invalid vehicle ID')
];

module.exports = {
  createVehicleValidator,
  updateVehicleValidator,
  deleteVehicleValidator
};
