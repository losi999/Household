import { Pipe, PipeTransform } from '@angular/core';
import { ImportedTransaction } from '@household/web/types/common';

@Pipe({
  name: 'importFilter',
  standalone: false,
})
export class ImportFilterPipe implements PipeTransform {

  transform(items: ImportedTransaction[], filterValue: string): ImportedTransaction[] {
    if (!filterValue) {
      return items;
    }

    const lowercaseFilterValue = filterValue?.toLowerCase();

    return items.filter(t => {
      const searchValues = [
        t.account?.fullName,
        t.category?.fullName,
        t.description,
        t.loanAccount?.fullName,
        t.project?.name,
        t.recipient?.name,
        t.transferAccount?.fullName,
      ].join(' ').toLowerCase();

      return searchValues.includes(lowercaseFilterValue);
    });
  }

}
