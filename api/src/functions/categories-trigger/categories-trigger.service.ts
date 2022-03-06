export interface ICategoriesTriggerService {
  (): Promise<void>;
}

export const categoriesTriggerServiceFactory = (): ICategoriesTriggerService => {
  return async () => {
  };
};
