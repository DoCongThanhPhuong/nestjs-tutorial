import { EFieldType } from 'src/constants';

const validateStringValue = (value: any) => {
  return typeof value === 'string';
};

const validateValueInOptions = (value: any, options: any[]) => {
  return options.includes(value);
};

const validateArrayValue = (
  value: any,
  validateItem: (item: any) => boolean,
) => {
  return Array.isArray(value) && value.length > 0 && value.every(validateItem);
};

const validateTextValue = (value: any) => validateStringValue(value);

const validateDateValue = (value: any) => {
  return value instanceof Date || !isNaN(Date.parse(value));
};

const validateSelectValue = (value: any, options: any[]) => {
  return validateStringValue(value) && validateValueInOptions(value, options);
};

const validateCheckboxValue = (value: any, options: any[]) => {
  return validateArrayValue(
    value,
    (item) => typeof item === 'string' && validateValueInOptions(item, options),
  );
};

const validateRadioValue = (value: any, options: any[]) => {
  return (
    (typeof value === 'string' || typeof value === 'number') &&
    validateValueInOptions(value, options)
  );
};

const validateUploadValue = (value: any) => {
  return typeof value === 'string';
};

const fieldValueValidationStrategies = {
  [EFieldType.TEXT]: validateTextValue,
  [EFieldType.DATE]: validateDateValue,
  [EFieldType.SELECT]: validateSelectValue,
  [EFieldType.CHECKBOX]: validateCheckboxValue,
  [EFieldType.RADIO]: validateRadioValue,
  [EFieldType.UPLOAD]: validateUploadValue,
};

export const validateFieldValue = (
  fieldType: EFieldType,
  value: any,
  options: any[] = [],
) => {
  const validator = fieldValueValidationStrategies[fieldType];
  if (!validator) throw new Error(`Invalid field type: ${fieldType}`);
  return validator(value, options);
};
