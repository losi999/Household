import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingPriceListComponent } from './hairdressing-price-list.component';

describe('HairdressingPriceListComponent', () => {
  let component: HairdressingPriceListComponent;
  let fixture: ComponentFixture<HairdressingPriceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingPriceListComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingPriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
