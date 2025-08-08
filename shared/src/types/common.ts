import { JSONSchema7 } from 'json-schema';
import { QueryOptions, UpdateQuery } from 'mongoose';

export type AnyValueObject<T> = Record<keyof T, any>;
export type DataFactoryFunction<I, O = I> = (input?: Partial<I>) => O;

type JSONSchemaType<T> =
  T extends undefined ? 'null' :
    T extends string ? 'string' :
      T extends number ? 'number' | 'integer' :
        T extends boolean ? 'boolean' :
          T extends any[] ? 'array' :
            'object';

export type StrictJSONSchema7<T> = Omit<JSONSchema7, 'properties' | 'type' | 'required' | 'items'> & {
  type?: JSONSchemaType<T> | JSONSchemaType<T>[] | [JSONSchemaType<T>, 'null'];
  required?: JSONSchemaType<T> extends 'object' ? (keyof T)[] : never;
  properties?: JSONSchemaType<T> extends 'object' ? { [prop in keyof T]?: StrictJSONSchema7<T[prop]> } : never;
  items?: T extends any[] ? StrictJSONSchema7<T[0]> : never;
  dependentRequired?: Partial<Record<keyof T, (keyof T)[]>>;
  dependentSchemas?: JSONSchemaType<T> extends 'object' ? {[prop in keyof T]?: StrictJSONSchema7<T>} : never;
  formatExclusiveMinimum?: {
    $data: string
  }
};

export type Remove<T> = Record<keyof T, undefined>;
export type Restrict<T, K extends keyof T> = Omit<T, K> & Partial<Record<K, never>>;
export type Branding<K, T> = K & { __brand: T };
export type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
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
