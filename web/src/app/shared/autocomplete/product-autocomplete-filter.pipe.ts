import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '@household/shared/types/types';

@Pipe({
  name: 'productAutocompleteFilter',
})
export class ProductAutocompleteFilterPipe implements PipeTransform {

  transform(items: Product.GroupedResponse[], inputValue: string): unknown {
    if (!inputValue) {
      return items;
    }

    return items.reduce<Product.GroupedResponse[]>((accumulator, currentValue) => {
      const filteredProducts = currentValue.products.filter(p => p.fullName.toLowerCase().includes(inputValue));

      if (filteredProducts.length > 0) {
        return [
          ...accumulator,
          {
            ...currentValue,
            products: filteredProducts,
          },
        ];
      }

      return accumulator;
    }, []);
  }
}
