import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../../models/baseResponse';

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrl: './autocomplete-input.component.css'
})
export class AutocompleteInputComponent<T> {

  @Input() value: string;
  @Input() placeholder: string;
  @Input() fetchFn!: (term: string) => Observable<IBaseResponse<T[]>>
  @Input() displayField: keyof T;

  @Output() valueChange = new EventEmitter<string>();
  @Output() idChange = new EventEmitter<string>();
  @Output() select = new EventEmitter<T>();

  filtredResult: any;
  showAutoComplete: boolean = false;

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
    this.filter(this.value);
  }

  filter(term: string): void {
    const searchTerm = term?.trim().toUpperCase() || '';
    if (searchTerm && searchTerm.length > 2) {
      this.fetchFn(searchTerm).subscribe({
        next: (result) => {
          this.filtredResult = result.data;
          this.showAutoComplete = this.filtredResult.length > 0
        },
        error: () => this.clearSuggestions()
      })
    }
    else 
      this.clearSuggestions();
  }

  private clearSuggestions(): void {
    this.filtredResult = [];
    this.showAutoComplete = false;
    this.idChange.emit(null);
    this.select.emit(null);
  }

  onSelect(item: T): void {
    const text = item[this.displayField] as unknown as string;
    const id = (item as any).id;
    this.value = text;
    this.valueChange.emit(text);
    this.idChange.emit(id);
    console.log(item);
    
    this.select.emit(item);
    this.showAutoComplete = false;
  }

  onBlur(): void {
    setTimeout(() => {
      this.showAutoComplete = false;
    }, 150);
  }
}
