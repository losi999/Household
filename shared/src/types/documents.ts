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

  export type Project = Id & Timestamps & Api.Project.Base;

  export type Recipient = Id & Timestamps & Api.Recipient.Base;

  export type Category = Id & Timestamps & Api.Category.Base & {
    ancestors: Category[];
    products?: Product[];
  };

  export type Product = Id & Timestamps & Api.Product.Base & Api.Product.FullName & {
    category: Category;
  };

  export type File = Id & Timestamps & Api.File.FileType & Api.File.Timezone & Partial<Api.File.ProcessingStatus> & Partial<Api.File.DraftCount>;

  export type Setting<V extends string | number | boolean = string | number | boolean> = Partial<Id> & Timestamps & Api.Setting.SettingKey & { value: V };
}
