type StringSchema = {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'date' | 'date-time' | 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'uri';
  enum?: string[];
};    

type NumberSchema = {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  enum?: number[];
};

type BooleanSchema = {
  type: 'boolean';
};

type ArraySchema<T> = {
  type: 'array';
  items: StrictSchema<T>;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
};

export type ObjectSchema<T> = {
  type: 'object';
  properties: { [prop in keyof T]?: StrictSchema<T[prop]> };
  required?: (keyof T)[];
  additionalProperties?: boolean;
};

export type StrictSchema<T> =
  T extends string ? StringSchema : 
    T extends number ? NumberSchema :
      T extends boolean ? BooleanSchema :
        T extends any[] ? ArraySchema<T[0]> :
          T extends object ? ObjectSchema<T> :
            never;
