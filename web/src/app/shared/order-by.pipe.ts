import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
})
export class OrderByPipe implements PipeTransform {

  transform(items: any[], orderBy: string, ordering: 'asc' | 'desc' = 'asc'): any[] {
    const orderingValue = ordering === 'asc' ? -1 : 1;

    const path = orderBy.split('.');

    return items?.toSorted((a, b) => {
      const [
        sortA,
        sortB,
      ] = path.reduce(([
        a,
        b,
      ], currentValue) => {
        return [
          a[currentValue],
          b[currentValue],
        ];
      }, [
        a,
        b,
      ]);

      return sortA < sortB ? orderingValue : orderingValue * -1;
    });
  }

}
