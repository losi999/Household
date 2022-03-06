export interface ITransactionsTriggerService {
  (): Promise<void>;
}

export const transactionsTriggerServiceFactory = (): ITransactionsTriggerService => {
  return async () => {
  };
};
