export const headerExpiresIn = 'Household-ExpiresIn';
export const FILE_UPLOAD_LINK_EXPIRATION = 60;

export const categoryTypes = [
  'regular',
  'inventory',
  'invoice',
] as const;

export const unitsOfMeasurement = [
  'cm',
  'db',
  'g',
  'kg',
  'l',
  'm',
  'ml',
] as const;

export const fileTypes = [
  'otp',
  'erste',
  'revolut',
] as const;

export const fileProcessingStatuses = [
  'pending',
  'completed',
  'failed',
] as const;
