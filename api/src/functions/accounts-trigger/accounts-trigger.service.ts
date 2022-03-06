export interface IAccountsTriggerService {
  (): Promise<void>;
}

export const accountsTriggerServiceFactory = (): IAccountsTriggerService => {
  return async () => {
  };
};
