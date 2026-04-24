import { Types } from 'mongoose';

export const generateMongoId = (): Types.ObjectId => new Types.ObjectId();
