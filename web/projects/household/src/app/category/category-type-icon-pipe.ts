import { Pipe, PipeTransform } from '@angular/core';
import { CategoryType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';

@Pipe({
  name: 'categoryTypeIcon',
})
export class CategoryTypeIconPipe implements PipeTransform {
  transform(category: Responses.Category): string {
    switch (category.categoryType) {
      case CategoryType.Regular:
        return 'category';
      case CategoryType.Inventory:
        return 'inventory_2';
      case CategoryType.Invoice:
        return 'receipt_long';
    }
  }
}
