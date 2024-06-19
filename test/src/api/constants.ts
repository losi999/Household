import { Internal } from '@household/shared/types/types';

export const internalPropertyNames: (keyof (Internal.Id & Internal.Timestamps))[] = [
  '_id',
  'createdAt',
  'expiresAt',
  'updatedAt',
];
