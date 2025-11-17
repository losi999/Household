import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerJobDialogComponent } from '@household/web/app/hairdressing/customer/customer-job-dialog/customer-job-dialog.component';

xdescribe('CustomerJobDialogComponent', () => {
  let component: CustomerJobDialogComponent;
  let fixture: ComponentFixture<CustomerJobDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerJobDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerJobDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
