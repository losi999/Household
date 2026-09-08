import { Api } from '@household/shared/types/api';
import type { Types } from 'mongoose';

export namespace Documents {
  type Id = {
    _id: Types.ObjectId;
  };

  type Timestamps = {
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };

  export type Account = Id & Timestamps & Api.Account.Base & Partial<Api.Account.Balance> & Api.Account.IsOpen;
}
