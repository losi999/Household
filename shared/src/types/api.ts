import { Branding } from '@household/shared/types/common';
import * as Enum from '@household/shared/enums';

export namespace Api {
  export type IsArchived = {
    isArchived: boolean;
  };

  export namespace Account {
    export type Id = Branding<string, 'account'>;

    export type AccountId = {
      accountId: Id;
    };

    export type IsOpen = {
      isOpen: boolean;
    };

    export type Name = {
      name: string;
    };

    export type Currency = {
      currency: string;
    };

    export type AccountType = {
      accountType: Enum.AccountType;
    };

    export type Owner = {
      owner: string;
    };

    export type FullName = {
      fullName: string;
    };

    export type Base = Name & Currency & AccountType & Owner;

    export type Balance = {
      balance: number;
    };
  }

  export namespace Project {
    export type Id = Branding<string, 'project'>;

    export type ProjectId = {
      projectId: Id;
    };

    export type Name = {
      name: string;
    };

    export type Description = {
      description: string;
    };

    export type Base = Name & Description;
  }

  export namespace Recipient {
    export type Id = Branding<string, 'recipient'>;

    export type RecipientId = {
      recipientId: Id;
    };

    export type Name = {
      name: string;
    };

    export type Base = Name;
  }

  export namespace Category {
    export type Id = Branding<string, 'category'>;

    export type CategoryId = {
      categoryId: Id;
    };

    export type FullName = {
      fullName: string;
    };

    export type ParentCategoryId = {
      parentCategoryId: Id;
    };

    export type CategoryType = {
      categoryType: Enum.CategoryType;
    };

    export type Name = {
      name: string;
    };

    export type Base = CategoryType & Name;
  }
}
