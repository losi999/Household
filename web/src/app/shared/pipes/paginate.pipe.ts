import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginate',
})
export class PaginatePipe implements PipeTransform {

  transform(items: any[], pageIndex: number, pageSize: number): unknown {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }

}
