import { Component, Input, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-search-lookup',
  templateUrl: './search-lookup.component.html',
  styleUrl: './search-lookup.component.css'
})

export class SearchLookupComponent<T> implements OnInit {
  
  constructor(private renderer: Renderer2) {
  }

  private _dataSource: T;

  @Input() displayMember: string | null = 'My Custom Card Header';
  @Input() valueMember: string | null = 'My Custom Card Body';

  @Input() set source(dataSource: T) {
    this._dataSource = dataSource;
  }
  get source(): T {
    return this._dataSource;
  }

  ngOnInit(): void {
    
    this.renderer.listen('window', 'click', windowClickEvent => {

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

    const dropdownItems = document.querySelectorAll('.dropdown-item');

    dropdownItems.forEach(dropdownItem => {

      dropdownItem.addEventListener('click', () => {

        dropdownItems.forEach(innerDropdownItem => {
          innerDropdownItem.classList.remove('active');
        });

        dropdownItem.classList.add('active');

        const selectedItemInput = (document.querySelector('.selected-item input') as HTMLInputElement);
        selectedItemInput.value = dropdownItem.innerHTML;
        this.dropdownClose();
        console.log(dropdownItem.attributes['value-member'])
      })
    })
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
