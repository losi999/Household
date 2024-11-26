import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autocompleteFilter',
})
export class AutocompleteFilterPipe implements PipeTransform {

  transform(items: any[], propertyName: string, inputValue: string): any[] {
    // console.log('filter', items, propertyName, inputValue);
    const lowercased = inputValue?.toLowerCase();
    return items?.filter(a => a[propertyName]?.toLowerCase().includes(lowercased));
  }

}
