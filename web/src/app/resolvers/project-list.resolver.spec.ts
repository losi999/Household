import { TestBed } from '@angular/core/testing';

import { ProjectListResolver } from './project-list.resolver';

describe('ProjectListResolver', () => {
  let resolver: ProjectListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProjectListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
