import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserType } from '@household/shared/enums';
import { AuthService } from '@household/web/services/auth.service';

@Directive({
  selector: '[householdIsEditor]',
})
export class IsEditorDirective {
  constructor(private authService: AuthService, private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {
    this.householdIsEditor = true;
  }

  @Input() set householdIsEditor(value: boolean) {
    if (this.authService.hasUserType(UserType.Editor) === value) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }else {
      this.viewContainer.clear();
    }
  }
}
