import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingPriceFormComponent } from './hairdressing-price-form.component';

describe('HairdressingPriceFormComponent', () => {
  let component: HairdressingPriceFormComponent;
  let fixture: ComponentFixture<HairdressingPriceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingPriceFormComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingPriceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
