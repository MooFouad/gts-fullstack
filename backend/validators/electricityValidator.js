const { body, param } = require('express-validator');

const createElectricityValidator = [
  body('meterNumber')
    .notEmpty().withMessage('Meter number is required')
    .trim()
    .escape(),

  body('location')
    .optional()
    .trim()
    .escape(),

  body('lastReading')
    .optional()
    .isNumeric().withMessage('Last reading must be a number'),

  body('lastReadingDate')
    .optional()
    .isISO8601().withMessage('Invalid last reading date format'),

  body('currentReading')
    .optional()
    .isNumeric().withMessage('Current reading must be a number'),

  body('billDate')
    .optional()
    .isISO8601().withMessage('Invalid bill date format'),

  body('consumption')
    .optional()
    .isNumeric().withMessage('Consumption must be a number'),

  body('billAmount')
    .optional()
    .isNumeric().withMessage('Bill amount must be a number'),

  body('status')
    .optional()
    .isIn(['Paid', 'Pending', 'Overdue'])
    .withMessage('Invalid status'),

  body('notes')
    .optional()
    .trim()
];

const updateElectricityValidator = [
  param('id')
    .isMongoId().withMessage('Invalid electricity record ID'),

  ...createElectricityValidator
];

const deleteElectricityValidator = [
  param('id')
    .isMongoId().withMessage('Invalid electricity record ID')
];

module.exports = {
  createElectricityValidator,
  updateElectricityValidator,
  deleteElectricityValidator
};
