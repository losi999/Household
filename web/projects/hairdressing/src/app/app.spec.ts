import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ComponentFixture } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let mockIconRegistry: MockService<MatIconRegistry>;

  const render = async () => {
    TestBed.resetTestingModule();

    mockIconRegistry = createMockService('setDefaultFontSetClass');

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: MatIconRegistry,
          useValue: mockIconRegistry.service,
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(App);

    await fixture.whenStable();
  };

  it('should use the material symbols font for icons', async () => {
    await render();

    validateFunctionCall(mockIconRegistry.functions.setDefaultFontSetClass, 'material-symbols-outlined');
  });
});
