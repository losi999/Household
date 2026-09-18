export type StringSchema = {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'date' | 'date-time' | 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'uri';
  enum?: string[];
  formatExclusiveMinimum?: {
    $data: string;
  };
  formatMinimum?: {
    $data: string;
  };
};    

type NumberSchema = {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | {
    $data: string;
  };
  exclusiveMaximum?: number;
  multipleOf?: number;
  enum?: number[];
};

type BooleanSchema = {
  type: 'boolean';
};

export type ArraySchema<T> = {
  type: 'array';
  items: StrictSchema<T>;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
};

export type ObjectSchema<T> = {
  type: 'object' | ['object', 'null'];
  properties?: { [prop in keyof T]?: StrictSchema<T[prop]> };
  required?: (keyof T)[];
  additionalProperties?: boolean;
  dependencies?: {
    [prop in keyof T]?: Partial<ObjectSchema<object>> | (keyof T)[];
  };
  anyOf?: ObjectSchema<T>[];
  oneOf?: ObjectSchema<any>[]; // CLAUDE TODO: replace any with T and try to fix the compile error
};

export type StrictSchema<T> =
  T extends string ? StringSchema : 
    T extends number ? NumberSchema :
      T extends boolean ? BooleanSchema :
        T extends any[] ? ArraySchema<T[number]> :
          T extends object ? ObjectSchema<T> :
            never;
