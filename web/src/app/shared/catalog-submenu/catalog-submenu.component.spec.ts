import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogSubmenuComponent } from './catalog-submenu.component';

describe('CatalogSubmenuComponent', () => {
  let component: CatalogSubmenuComponent;
  let fixture: ComponentFixture<CatalogSubmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogSubmenuComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
