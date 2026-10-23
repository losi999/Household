import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthStore } from '@household/shared-ui';
import { UserType } from '@household/shared/enums';

@Directive({
  selector: '[householdIsEditor]',
})
export class IsEditor {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authStore = inject(AuthStore);

  constructor() {
    effect(() => {
      if (this.authStore.userTypes().includes(UserType.Editor)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
