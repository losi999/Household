import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsUsersListComponent } from './settings-users-list.component';

describe('SettingsUsersListComponent', () => {
  let component: SettingsUsersListComponent;
  let fixture: ComponentFixture<SettingsUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsUsersListComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
