import {
  ValidationArguments,
  ValidationError,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

const IDENTIFIER_REGEX = /^[^\d][a-z0-9_]+$/g;
const MAX_LENGTH = 64;

export function IsPostgresIdentifier(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPostgresIdentifier',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean => {
          if (typeof value !== 'string') {
            return false;
          }
          const s = value as string;
          return (
            !!s &&
            s.trim().length > 0 &&
            !!s.match(IDENTIFIER_REGEX) &&
            s.length <= MAX_LENGTH
          );
        },
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments?.property} is not a valid Postgres name.`,
      },
    });
  };
}

export function recursivelyGetChildrenErrors(
  errors: ValidationError[],
  propertyPath: string,
): {
  property: string;
  errorMessages: string[];
}[] {
  const validationErrors: {
    property: string;
    errorMessages: string[];
  }[] = [];

  errors.forEach((error) => {
    const errorMessages: string[] = [];
    const err = {
      property: `${propertyPath}${error.property}`,
      errorMessages,
    };
    Object.entries(error.constraints || {}).forEach(
      ([constraintName, errorMsg]) => {
        err.errorMessages.push(errorMsg);
      },
    );
    if (err.errorMessages.length) {
      validationErrors.push(err);
    }
    if (error.children) {
      validationErrors.push(
        ...recursivelyGetChildrenErrors(
          error.children,
          `${propertyPath}${error.property}.`,
        ),
      );
    }
  });

  return validationErrors;
}
