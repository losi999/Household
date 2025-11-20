import { Pipe, PipeTransform } from '@angular/core';
import { Account } from '@household/shared/types/types';

@Pipe({
  name: 'openAccountFilter',
})
export class OpenAccountFilterPipe implements PipeTransform {

  transform(value: Account.Response[], onlyOpenAccounts: boolean): Account.Response[] {
    return onlyOpenAccounts ? value.filter(a => a.isOpen) : value;
  }

}
