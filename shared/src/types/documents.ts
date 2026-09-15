import { Api } from '@household/shared/types/api';
import { Product } from '@household/shared/types/types';
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

  export type Project = Id & Timestamps & Api.Project.Base;

  export type Recipient = Id & Timestamps & Api.Recipient.Base;

  export type Category = Id & Timestamps & Api.Category.Base & {
    ancestors: Category[];
    products?: Product.Document[];
  };
}
