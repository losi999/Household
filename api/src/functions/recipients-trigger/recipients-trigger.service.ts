export interface IRecipientsTriggerService {
  (): Promise<void>;
}

export const recipientsTriggerServiceFactory = (): IRecipientsTriggerService => {
  return async () => {
  };
};
