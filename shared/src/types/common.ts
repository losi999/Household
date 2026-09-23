import type { QueryOptions, UpdateQuery } from 'mongoose';

export type AnyValueObject<T> = Record<keyof T, any>;
export type DataFactoryFunction<I, O = I> = (input?: Partial<I>) => O;

export type Remove<T> = Record<keyof T, undefined>;
export type Restrict<T, K extends keyof T> = Omit<T, K> & Partial<Record<K, never>>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Mandatory<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;
export type Branding<K, T> = K & { __brand: T };
export type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends Branding<any, any> ? T[P] :
      T[P] extends object ? RecursivePartial<T[P]> :
        T[P];
};

type UnionKeys<T> = T extends any ? keyof T : never;
export type Unset<Union, NotInThis> = Record<Exclude<UnionKeys<Union>, keyof NotInThis>, true>;

export type HttpError = {
  statusCode: number;
  message: string;
};

export type Dictionary<P> = {[key: string]: P};

export type DocumentUpdate<D> = {
  update: UpdateQuery<D>;
  arrayFilters?: QueryOptions<D>['arrayFilters']
};

export type Searchable<T = object> = T & {
  searchTerms?: string[];
};

export type ExpiresIn = {
  expiresIn: number;
};

export namespace Import {
  export type Revolut = {
    Amount: number;
    Fee: number;
    Type: string;
    Description: string;
    Currency: string;
    'Started Date': Date;
  };

  export type Otp = {
    'Összeg': number;
    'Forgalom típusa': string;
    'Ellenoldali név': string;
    'Közlemény': string;
    'Tranzakció időpontja': Date;
  };

  export type Erste = {
    'Tranzakció dátuma és ideje': string;
    'Dátum': Date;
    'Összeg': number;
    'Partner név': string;
    'Közlemény': string;
    'Kategória': string;
  };
}
