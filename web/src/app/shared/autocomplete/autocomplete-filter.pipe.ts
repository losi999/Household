import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autocompleteFilter',
})
export class AutocompleteFilterPipe implements PipeTransform {

  transform(items: any[], propertyName: string, inputValue: string): any[] {
    if (!inputValue) {
      return items;
    }
    const lowercased = inputValue?.toLowerCase();
    return items?.filter(a => a[propertyName]?.toLowerCase().includes(lowercased));
  }

}
