import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'search-lookup',
  templateUrl: './search-lookup.component.html',
  styleUrl: './search-lookup.component.css',
  providers: [{ 
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchLookupComponent),
    multi: true
  }],
  exportAs: 'searchlookup'
})

export class SearchLookupComponent<T> implements OnInit, ControlValueAccessor, OnDestroy {

  private _value: any = '';
  get value(): any { return this._value; };

  set value(v: any) {
    console.log('' + v);
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  writeValue(value: any) {
    this._value = value;
    this.onChange(value);
  }

  onChange = (_) => { };
  onTouched = () => { };
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  
  constructor(private renderer: Renderer2) {
  }

  private _dataSource: T[];
  private listener: any;

  @Input() placeholder;
  @Input() dataId: Guid;
  @Output() dataIdChange = new EventEmitter<string>();

  @Input() set source(dataSource: T[]) {
    this._dataSource = dataSource;
  }

  get source(): T[] {
    return this._dataSource;
  }

  loadData(): void {

    const dropdownItems = document.querySelectorAll('.dropdown-item');

    dropdownItems.forEach(dropdownItem => {

      dropdownItem.addEventListener('click', () => {

        dropdownItems.forEach(innerDropdownItem => {
          innerDropdownItem.classList.remove('active');
        });

        dropdownItem.classList.add('active');

        this.value = dropdownItem.innerHTML;
        console.log(this.value);
        this.dataIdChange.emit(dropdownItem.getAttributeNode('id').value);
        this.dropdownClose();
      })
    })
  }

  ngOnInit(): void {     
    
    this.listener = this.renderer.listen('body', 'click', windowClickEvent => {

      const dropdown = document.querySelector('.dropdown-box');
      const dropdownContent = document.querySelector('.dropdown-content-1');
      const selectedItem = document.querySelector('.selected-item');
      
      if (dropdown.classList.contains('open')) {
        if (!dropdownContent.contains(windowClickEvent.target)) {
          this.dropdownClose();
        }
      }
      else if (selectedItem.contains(windowClickEvent.target)) {
        this.dropdownOpen();
      }
    });

    setTimeout(() => {
      this.loadData();
    }, 200);

    // const dropdownItems = document.querySelectorAll('.dropdown-item');
    // console.log(dropdownItems.length);

    // dropdownItems.forEach(dropdownItem => {

    //   dropdownItem.addEventListener('click', () => {

    //     console.log(dropdownItem);
        

    //     dropdownItems.forEach(innerDropdownItem => {
    //       innerDropdownItem.classList.remove('active');
    //     });

    //     dropdownItem.classList.add('active');

    //     this.value = dropdownItem.innerHTML;
    //     this.dataIdChange.emit(dropdownItem.getAttributeNode('data-id').value);
    //     this.dropdownClose();
    //   })
    // })
  }

  ngOnDestroy(): void {
    this.listener();
  }

  dropdownOpen(): void {    
    const dropdown = document.querySelector('.dropdown-box');
    dropdown.classList.add('open');
  }

  dropdownClose(): void {    
    const dropdown = document.querySelector('.dropdown-box');
    dropdown.classList.remove('open');
  }

  contentFilter(filter: any): void {    
    const dropdownItems = document.querySelectorAll('.dropdown-item')

    dropdownItems.forEach(dropdownItem => {
      if (dropdownItem.innerHTML.includes(filter.value)) {
        dropdownItem.classList.remove('hide');
      }
      else {
        dropdownItem.classList.add('hide');
      }
    })
  }
}
