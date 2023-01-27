export const headerExpiresIn = 'Household-ExpiresIn';

export const categoryTypes = [
  'regular',
  'inventory',
  'invoice',
] as const;

export const unitsOfMeasurement = [
  'g',
  'kg',
  'ml',
  'l',
  'db',
] as const;

export const groupByProperties = [
  'year',
  'month',
  'account',
  'project',
  'category',
  'recipient',
] as const;
