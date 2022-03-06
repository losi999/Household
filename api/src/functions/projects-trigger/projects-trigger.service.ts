export interface IProjectsTriggerService {
  (): Promise<void>;
}

export const projectsTriggerServiceFactory = (): IProjectsTriggerService => {
  return async () => {
  };
};
