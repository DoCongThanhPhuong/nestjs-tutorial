import { EFieldType } from 'src/constants';

const validateNoOptionsField = (options: any) => options == null;

const validateArrayOptionsField = (
  options: any,
  itemValidator: (item: any) => boolean,
) =>
  Array.isArray(options) && options.length > 0 && options.every(itemValidator);

const validateStringArrayField = (options: any) =>
  validateArrayOptionsField(options, (opt) => typeof opt === 'string');

const validateUniformTypeArrayField = (options: any) => {
  if (!Array.isArray(options) || options.length === 0) return false;

  const firstType = typeof options[0];
  if (firstType !== 'string' && firstType !== 'number') return false;

  return options.every((opt) => typeof opt === firstType);
};

const validationStrategies = {
  [EFieldType.NUMBER]: validateNoOptionsField,
  [EFieldType.TEXT]: validateNoOptionsField,
  [EFieldType.DATE]: validateNoOptionsField,
  [EFieldType.UPLOAD]: validateNoOptionsField,
  [EFieldType.SELECT]: validateStringArrayField,
  [EFieldType.CHECKBOX]: validateStringArrayField,
  [EFieldType.RADIO]: validateUniformTypeArrayField,
};

export const validateField = (fieldType: EFieldType, options: any) => {
  const validator = validationStrategies[fieldType];
  if (!validator) throw new Error(`Invalid field type: ${fieldType}`);
  return validator(options);
};
