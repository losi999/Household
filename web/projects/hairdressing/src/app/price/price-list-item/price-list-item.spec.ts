import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceListItem } from './price-list-item';

describe('PriceListItem', () => {
  let component: PriceListItem;
  let fixture: ComponentFixture<PriceListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceListItem],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PriceListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
