import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingPriceListItemComponent } from './hairdressing-price-list-item.component';

describe('HairdressingPriceListItemComponent', () => {
  let component: HairdressingPriceListItemComponent;
  let fixture: ComponentFixture<HairdressingPriceListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingPriceListItemComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingPriceListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
