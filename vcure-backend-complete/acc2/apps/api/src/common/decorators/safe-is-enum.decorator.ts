import { IsEnum, IsString, ValidationOptions } from 'class-validator';

export function SafeIsEnum(entity: object | undefined, validationOptions?: ValidationOptions): PropertyDecorator {
  if (!entity || typeof entity !== 'object' || Object.keys(entity).length === 0) {
    return IsString(validationOptions);
  }
  return IsEnum(entity, validationOptions);
}
