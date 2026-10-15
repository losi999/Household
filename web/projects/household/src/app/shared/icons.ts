import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule],
  selector: 'household-generic-product-icon',
  template: '<mat-icon>sell</mat-icon>',
})
export class GenericProductIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-specific-product-icon',
  template: '<mat-icon>scale</mat-icon>',
})
export class SpecificProductIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-variant-product-icon',
  template: '<mat-icon>label</mat-icon>',
})
export class VariantProductIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-catalog-icon',
  template: '<mat-icon>menu_book</mat-icon>',
})
export class CatalogIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-import-icon',
  template: '<mat-icon>upload</mat-icon>',
})
export class ImportIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-category-icon',
  template: '<mat-icon>category</mat-icon>',
})
export class CategoryIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-recipient-icon',
  template: '<mat-icon>store</mat-icon>',
})
export class RecipientIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-project-icon',
  template: '<mat-icon>stacks</mat-icon>',
})
export class ProjectIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-account-icon',
  template: '<mat-icon>account_balance</mat-icon>',
})
export class AccountIcon {}

@Component({
  imports: [MatIconModule],
  selector: 'household-product-icon',
  template: '<mat-icon>barcode</mat-icon>',
})
export class ProductIcon {}
