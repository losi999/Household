import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserType } from '@household/shared/enums';
import { AuthService } from '@household/web/services/auth.service';

@Directive({
  selector: '[householdIsHairdresser]',
})
export class IsHairdresserDirective {

  constructor(private authService: AuthService, private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {
    this.householdIsHairdresser = true;
  }

  @Input() set householdIsHairdresser(value: boolean) {
    if (this.authService.hasUserType(UserType.Hairdresser) === value) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }else {
      this.viewContainer.clear();
    }
  }

}
