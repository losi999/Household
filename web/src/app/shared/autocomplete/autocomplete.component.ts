import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => AutocompleteComponent)
  }]
})
export class AutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() displayNameProperty: string;
  @Input() label: string;
  @Input() items: any[];

  form: FormGroup;
  changed: (value: string) => void;
  touched: () => void;
  isDisabled: boolean;
  subs: Subscription;

  constructor() { }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      selected: new FormControl()
    })

    this.subs = this.form.controls.selected.valueChanges.subscribe((value) => {
      this.changed?.(value);
    })
  }

  writeValue(selected: any): void {
    this.form.setValue({ selected });
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

  displayName = (item: any) => {
    return item?.[this.displayNameProperty];
  }

  clearValue() {
    this.form.reset();
  }
}
