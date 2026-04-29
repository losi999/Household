import { ProductAutocompleteFilterPipe } from './product-autocomplete-filter.pipe';

xdescribe('ProductAutocompleteFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new ProductAutocompleteFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
