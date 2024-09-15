import { EFieldType } from 'src/constants';

const isString = (value: any) => typeof value === 'string';

const isNumber = (value: any) => typeof value === 'number';

const isDate = (value: any) =>
  value instanceof Date || !isNaN(Date.parse(value));

const isInOptions = (value: any, options: any[]) => options.includes(value);

const validateArray = (value: any, itemValidator: (item: any) => boolean) =>
  Array.isArray(value) && value.length > 0 && value.every(itemValidator);

const validationStrategies = {
  [EFieldType.NUMBER]: isNumber,
  [EFieldType.TEXT]: isString,
  [EFieldType.DATE]: isDate,
  [EFieldType.SELECT]: (value: any, options: any[]) =>
    isString(value) && isInOptions(value, options),
  [EFieldType.CHECKBOX]: (value: any, options: any[]) =>
    validateArray(
      value,
      (item) => isString(item) && isInOptions(item, options),
    ),
  [EFieldType.RADIO]: (value: any, options: any[]) =>
    (isString(value) || isNumber(value)) && isInOptions(value, options),
  [EFieldType.UPLOAD]: isString,
};

export const validateFieldValue = (
  fieldType: EFieldType,
  value: any,
  options: any[] = [],
) => {
  const validator = validationStrategies[fieldType];
  if (!validator) throw new Error(`Invalid field type: ${fieldType}`);
  return validator(value, options);
};
