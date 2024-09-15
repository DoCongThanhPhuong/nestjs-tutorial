import { EFieldType } from 'src/constants';

const validateNoOptionsField = (options: any) => {
  return options === null || options === undefined;
};

const validateArrayOptionsField = (
  options: any,
  validateItem: (item: any) => boolean,
) => {
  return (
    Array.isArray(options) && options.length > 0 && options.every(validateItem)
  );
};

const validateSelectField = (options: any) => {
  return validateArrayOptionsField(options, (opt) => typeof opt === 'string');
};

const validateCheckboxField = (options: any) => {
  return validateArrayOptionsField(options, (opt) => typeof opt === 'string');
};

const validateRadioField = (options: any) => {
  return validateArrayOptionsField(
    options,
    (opt) => typeof opt === 'string' || typeof opt === 'number',
  );
};

const fieldValidationStrategies = {
  [EFieldType.TEXT]: validateNoOptionsField,
  [EFieldType.DATE]: validateNoOptionsField,
  [EFieldType.UPLOAD]: validateNoOptionsField,
  [EFieldType.SELECT]: validateSelectField,
  [EFieldType.CHECKBOX]: validateCheckboxField,
  [EFieldType.RADIO]: validateRadioField,
};

export const validateField = (fieldType: EFieldType, options: any) => {
  const validator = fieldValidationStrategies[fieldType];
  if (!validator) throw new Error(`Invalid field type: ${fieldType}`);
  return validator(options);
};
