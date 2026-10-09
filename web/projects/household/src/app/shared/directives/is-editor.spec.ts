import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthStore, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { UserType } from '@household/shared/enums';
import { IsEditor } from './is-editor';

@Component({
  imports: [IsEditor],
  template: '<span *householdIsEditor data-testId="editor-content">editor only</span>',
})
class TestHost {}

describe('IsEditor', () => {
  let fixture: ComponentFixture<TestHost>;
  let selector: IElementSelector;
  let mockAuthStore: MockSignalStore<typeof AuthStore>;

  const getContent = () => {
    return selector.getElementByTestId('editor-content');
  };

  const render = async (userTypes: UserType[]) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideMockSignalStore(AuthStore, 'userTypes')],
    })
      .compileComponents();

    mockAuthStore = TestBed.inject<MockSignalStore<typeof AuthStore>>(AuthStore);
    mockAuthStore.userTypes.set(userTypes);

    fixture = TestBed.createComponent(TestHost);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  it('should render content if user is an editor', async () => {
    await render([UserType.Editor]);

    expect(getContent()).toBeTruthy();
  });

  it('should render content if user is an editor among other user types', async () => {
    await render([
      UserType.Hairdresser,
      UserType.Editor,
    ]);

    expect(getContent()).toBeTruthy();
  });

  it('should not render content if user is not an editor', async () => {
    await render([UserType.Hairdresser]);

    expect(getContent()).toBeFalsy();
  });

  it('should not render content if user has no user types', async () => {
    await render([]);

    expect(getContent()).toBeFalsy();
  });

  it('should render content when user becomes an editor', async () => {
    await render([]);

    mockAuthStore.userTypes.set([UserType.Editor]);
    await fixture.whenStable();

    expect(getContent()).toBeTruthy();
  });

  it('should remove content when user stops being an editor', async () => {
    await render([UserType.Editor]);

    mockAuthStore.userTypes.set([UserType.Hairdresser]);
    await fixture.whenStable();

    expect(getContent()).toBeFalsy();
  });
});
