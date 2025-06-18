import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-column-filter',
  templateUrl: './column-filter.component.html',
  styleUrl: './column-filter.component.css'
})
export class ColumnFilterComponent implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.filterValue = this.initialFilterValue?.value
  }

  @Input() colIndex: number;
  @Input() colType: 'string' | 'date' | 'time' | 'boolean' | 'movementType';
  @Input() initialFilterValue: {type: 'empty' | 'noEmpty' | 'value'; value: string} | null = null ;

  @Output() sortChange = new EventEmitter<{ colIndex: number, order: 'asc' | 'desc' }>();
  @Output() filterChange = new EventEmitter<{ colIndex: number, type: 'empty' | 'noEmpty' | 'clear' | 'value', value: any | null }>();

  filterValue: any | null;
  
  
  openMenuFilter(event: MouseEvent, button: HTMLElement): void {
    event.stopPropagation();
    
    const $button = $(button);
    const offset = $button.offset();
    const $dropdownMenu = $('#column-dropdown-menu');

    if (!$dropdownMenu.hasClass('hidden')) {
      $dropdownMenu.addClass('hidden');
      return;
    }

    const windowWidth = $(window).width();
    const menuWidth = $dropdownMenu.outerWidth();
    const left = offset.left + $button.outerWidth() > windowWidth ? offset.left - menuWidth : offset.left;

    $dropdownMenu
      .css({
        top: offset.top + $button.outerHeight(), // Меню будет ниже кнопки
        left: left, // Обрабатываем позицию по оси X с учётом ширины окна
      })
      .removeClass('hidden');

    $('#column-dropdown-menu .checkmark').addClass('hidden');

    // Показываем только если это меню для текущей отсортированной колонки
    if (this.colIndex === this.currentSortedColIndex && this.currentSortOrder) {
      $(`#column-dropdown-menu a[data-sort="${this.currentSortOrder}"] .checkmark`).removeClass('hidden');
    }

    if (this.colIndex === this.currentSortedColIndex && this.currentSortOrder) {
      $(`#column-dropdown-menu a[data-prefilter="${this.currentSortOrder}"] .checkmark`).removeClass('hidden');
    }

    if (this.colIndex === this.currentFilteredColIndex && this.currentFilterType) {
      $(`#column-dropdown-menu a[data-prefilter="${this.currentFilterType}"] .checkmark`).removeClass('hidden');
    }
  }

  currentSortOrder: 'asc' | 'desc' | null = null;
  currentSortedColIndex: number | null = null;
  sorting(order: 'asc' | 'desc', colIndex: number): void {
    if (this.currentSortedColIndex !== null && this.currentSortedColIndex !== colIndex) {
      const prevBtn = $(`.filter-button[data-col-index="${this.currentSortedColIndex}"] .sorting-icon`);
      prevBtn.html('<i class="ki-filled ki-arrow-up-down"></i>');
    }

    this.sortChange.emit({ colIndex, order });

    this.currentSortedColIndex = colIndex;
    this.currentSortOrder = order;

    $('#column-dropdown-menu .checkmark').addClass('hidden');
    const activeLink = $(`#column-dropdown-menu a[data-sort="${order}"] .checkmark`);
    activeLink.removeClass('hidden');

    this.updateHeaderSortIcon(order);

    this.closeFilterMenu();
  }

  currentFilterType: 'empty' | 'noEmpty' | 'value' | 'clear' | null = null;
  currentFilteredColIndex: number | null = null;
  filter(type: 'empty' | 'noEmpty' | 'clear' | 'value', colIndex: number): void {
    this.filterChange.emit({ colIndex, type, value: this.filterValue });

    this.currentFilterType = type;
    this.currentFilteredColIndex = colIndex;

    if (this.filterValue == null) {
      this.closeFilterMenu();
    }

    $('#column-dropdown-menu .checkmark').addClass('hidden');
    const activePrefilter = $(`#column-dropdown-menu a[data-prefilter="${type}"] .checkmark`);
    activePrefilter.removeClass('hidden');
  }

  updateHeaderSortIcon(order: 'asc' | 'desc'): void {
    const $button = $(`button.filter-button[data-col-index="${this.colIndex}"]`);
    const $icon = $button.find('.sorting-icon');
    const iconClass = order === 'asc' ? 'ki-arrow-up' : 'ki-arrow-down';
    $icon.html(`<i class="ki-filled ${iconClass}"></i>`);
  }

  closeFilterMenu(): void {
    $('#column-dropdown-menu').addClass('hidden');
  }
}
