import { TestBed } from '@angular/core/testing';

import { CategoryListResolver } from './category-list.resolver';

describe('CategoryListResolver', () => {
  let resolver: CategoryListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CategoryListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
