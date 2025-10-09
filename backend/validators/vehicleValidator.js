const { body, param } = require('express-validator');

const createVehicleValidator = [
  body('plateNumber')
    .notEmpty().withMessage('Plate number is required')
    .trim()
    .escape(),

  body('vehicleMaker')
    .notEmpty().withMessage('Vehicle maker is required')
    .trim()
    .escape(),

  body('vehicleModel')
    .optional()
    .trim()
    .escape(),

  body('vehicleType')
    .optional()
    .trim()
    .escape(),

  body('licenseExpiryDate')
    .optional()
    .isISO8601().withMessage('Invalid license expiry date format'),

  body('insuranceExpiryDate')
    .optional()
    .isISO8601().withMessage('Invalid insurance expiry date format'),

  body('insuranceValue')
    .optional()
    .isNumeric().withMessage('Insurance value must be a number'),

  body('fuelType')
    .optional()
    .trim()
    .escape(),

  body('engineCapacity')
    .optional()
    .trim()
    .escape(),

  body('engineNumber')
    .optional()
    .trim()
    .escape(),

  body('chassisNumber')
    .optional()
    .trim()
    .escape(),

  body('color')
    .optional()
    .trim()
    .escape(),

  body('owner')
    .optional()
    .trim()
    .escape(),

  body('notes')
    .optional()
    .trim()
];

const updateVehicleValidator = [
  param('id')
    .isMongoId().withMessage('Invalid vehicle ID'),

  ...createVehicleValidator
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
