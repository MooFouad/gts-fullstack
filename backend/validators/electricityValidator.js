const { body, param } = require('express-validator');

const createElectricityValidator = [
  body('no')
    .optional()
    .trim(),

  body('account')
    .optional()
    .trim(),

  body('name')
    .optional()
    .trim(),

  body('city')
    .optional()
    .trim(),

  body('address')
    .optional()
    .trim(),

  body('project')
    .optional()
    .trim(),

  body('division')
    .optional()
    .trim(),

  body('meterNumber')
    .optional()
    .trim(),

  body('date')
    .optional()
    .trim(),

  body('attachments')
    .optional()
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
