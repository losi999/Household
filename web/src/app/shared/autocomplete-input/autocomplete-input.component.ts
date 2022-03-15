import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => AutocompleteInputComponent)
  }]
})
export class AutocompleteInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() displayNameProperty: string;
  @Input() idProperty: string;
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
      console.log('sub', value);
      this.changed?.(value/*?.[this.idProperty]*/);
    })
  }

  writeValue(selected: any): void {
    console.log('writeValue', selected)
    // console.log(selectedId);
    // if (selectedId) {
    //   const selected = this.items.find(i => i[this.idProperty] === selectedId);
    this.form.setValue({ selected });
    // }
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
    console.log('displayName', item)
    return this.items.find(i => i[this.idProperty] === item)?.[this.displayNameProperty];// item?.[this.displayNameProperty];
  }

  clearValue() {
    this.form.reset();
  }

}
