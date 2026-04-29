import { filter, pipe, take } from 'rxjs';

export const takeFirstDefined = <T>() => {
  return pipe(
    filter<T>(x => !!x),
    take<T>(1),
  );
};
