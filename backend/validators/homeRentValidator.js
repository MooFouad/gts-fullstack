const { body, param } = require('express-validator');

const createHomeRentValidator = [
  body('name')
    .notEmpty().withMessage('Property name is required')
    .trim()
    .escape(),

  body('contractNumber')
    .optional()
    .trim()
    .escape(),

  body('ownerName')
    .optional()
    .trim()
    .escape(),

  body('ownerPhone')
    .optional()
    .trim()
    .escape(),

  body('contractStartingDate')
    .optional()
    .isISO8601().withMessage('Invalid contract starting date format'),

  body('contractEndingDate')
    .optional()
    .isISO8601().withMessage('Invalid contract ending date format'),

  body('monthlyRent')
    .optional()
    .isNumeric().withMessage('Monthly rent must be a number'),

  body('contractStatus')
    .optional()
    .isIn(['Active', 'Expired', 'Terminated', 'Renewed'])
    .withMessage('Invalid contract status'),

  body('paymentMethod')
    .optional()
    .trim()
    .escape(),

  body('notes')
    .optional()
    .trim()
];

const updateHomeRentValidator = [
  param('id')
    .isMongoId().withMessage('Invalid home rent ID'),

  ...createHomeRentValidator
];

const deleteHomeRentValidator = [
  param('id')
    .isMongoId().withMessage('Invalid home rent ID')
];

module.exports = {
  createHomeRentValidator,
  updateHomeRentValidator,
  deleteHomeRentValidator
};
