import { CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, Injector, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NgControl, Validators, TouchedChangeEvent } from '@angular/forms';
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ProjectAutocompleteInputComponent),
    },
  ],
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

  constructor(private destroyRef: DestroyRef, private injector: Injector, private store: Store) {
    this.selected = new FormControl();
  }

  ngOnInit(): void {
    const ngControl = this.injector.get(NgControl) as FormControlName;
    const formControl = this.injector.get(FormGroupDirective).getControl(ngControl);
    formControl.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if(event instanceof TouchedChangeEvent) {
        this.selected.markAsTouched();
      }
    });
    const isRequired = formControl.hasValidator(Validators.required);

    if (isRequired) {
      this.selected.setValidators(Validators.required);
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
