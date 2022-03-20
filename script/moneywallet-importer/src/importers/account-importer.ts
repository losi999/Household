import { IMongodbService } from '@household/shared/services/mongodb-service';
import data from '@household/moneywallet-importer/data/Account.json'
import currency from '@household/moneywallet-importer/data/Currency.json';
import { Account } from '@household/shared/types/types';
import { Types } from 'mongoose';

export const accountImporter = (mongodbService: IMongodbService) => {
  return async () => {
    const legacyIds: { [legacyId: string]: Types.ObjectId } = {}

    const accountTypeMap = (old: number): Account.Document['accountType'] => {
      switch (old) {
        case 0: return 'cash';
        case 1: return 'bankAccount';
        case 6: return 'loan';
        case 2: return 'cafeteria';
        case 3: return 'creditCard';
      }
    }

    const accounts = data.filter(x => !!x.Name).map<Account.Document>((x) => {
      const id = new Types.ObjectId();

      legacyIds[x.AccountID.toLowerCase()] = id;
      return {
        _id: id,
        name: x.Name,
        description: x.Description,
        isOpen: Boolean(x.IsOpen),
        currency: currency.find(c => c.CurrencyID === x.CurrencyCurrencyID).Suffix,
        accountType: accountTypeMap(x.Type),
        expiresAt: undefined,
        balance: undefined,
      };
    });

    await mongodbService.accounts.insertMany(accounts);

    return legacyIds;
  };
};
