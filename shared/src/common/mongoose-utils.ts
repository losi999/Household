import { PopulateOptions, Types } from 'mongoose';

export const generateMongoId = (): Types.ObjectId => new Types.ObjectId();

export const populate = (...populateOptions: (string | PopulateOptions)[]): PopulateOptions[] => {
  return populateOptions.map(p => {
    return typeof p === 'string' ? {
      path: p,
    } : p;
  });
};
