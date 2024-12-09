import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, Input, OnInit, Self } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NgControl, Validators, TouchedChangeEvent, FormControlDirective } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Project } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectProjects, selectProjectById } from '@household/web/state/project/project.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-project-autocomplete-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    AutocompleteFilterPipe,
  ],
  templateUrl: './project-autocomplete-input.component.html',
  styleUrl: './project-autocomplete-input.component.scss',
})
export class ProjectAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input({
    required: true,
  }) label: string;
  selected: FormControl<Project.Response>;

  changed: (value: Project.Id) => void;
  touched: () => void;
  isDisabled: boolean;

  projects = this.store.select(selectProjects);

  constructor(private destroyRef: DestroyRef, private injector: Injector, private store: Store, @Self() public ngControl: NgControl) {
    this.selected = new FormControl();
    ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    let control: FormControl;
    if (this.ngControl instanceof FormControlName) {
      control = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      control = this.ngControl.form;
    }

    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof TouchedChangeEvent) {
        this.selected.markAsTouched();
      }
    });

    if (control.hasValidator(Validators.required)) {
      this.selected.addValidators(Validators.required);
    }

    this.selected.valueChanges.subscribe((value) => {
      this.changed?.(value?.projectId);
    });
  }

  writeValue(projectId: Project.Id): void {
    if (projectId) {
      this.store.select(selectProjectById(projectId))
        .pipe(takeFirstDefined())
        .subscribe((project) => {
          this.selected.setValue(project, {
            emitEvent: false,
          });
        });
    } else {
      this.selected.setValue(null, {
        emitEvent: false,
      });
    }
  }
  registerOnChange(fn: any): void {
    this.changed = fn;
  }

  registerOnTouched(fn: any): void {
    this.touched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  displayName = (item: Project.Response) => {
    return item?.name;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }

  create(event: MouseEvent) {
    this.store.dispatch(dialogActions.createProject());
    event.stopPropagation();
  }
}
