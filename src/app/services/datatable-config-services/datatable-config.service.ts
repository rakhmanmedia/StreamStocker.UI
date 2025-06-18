import { Injectable } from '@angular/core';
import DataTable, { Config } from 'datatables.net';

@Injectable({
  providedIn: 'root'
})
export class DatatableConfigService {

  configureDataTable(): void {
    DataTable.ext.classes.table = 'table';
    DataTable.ext.classes.length.select = 'select select-sm w-16';
    DataTable.ext.classes.paging.container = 'pagination';
    DataTable.ext.classes.paging.button = 'btn';
    DataTable.ext.classes.paging.active = 'active disabled';
    DataTable.ext.classes.table = 'table table-auto table-border align-middle text-gray-700 font-medium text-sm';
    DataTable.ext.classes.layout.tableRow = 'scrollable-x-auto';
    DataTable.select.classes.checkbox = 'checkbox';
  }

  // Конфигурация настроек по умолчанию для Datatable
  getDefaultConfig(): Config {
    return {
      processing: true,
      stateSave: true,

      order: [],

      drawCallback: () => {
        $('.dt-search label').append(document.querySelector('.dt-input')).addClass('input input-sm');
        $('.dt-search').removeClass('dt-search');
      },

      columnDefs: [
        { className: 'text-gray-800 font-normal', targets: "_all", orderable: false },
      ],

      select: {
        info: false,
        items: 'row',
        style: 'multi',
        selector: 'td:first-child',
      },

      language: {
        emptyTable: '<div class="text-center">Данные в таблице отсутствуют.</div>',
        loadingRecords: '<div class="text-center">Загрузка...</div>',
        infoEmpty: '<h3 class="card-title font-medium text-sm">Показано 0 из 0 записей</h3>',
        infoFiltered: '',
        zeroRecords: '<div class="text-center">Совпадений не найдено.</div>',
        paginate: {
          next: '<i class="ki-outline ki-right"></i>',
          previous: '<i class="ki-outline ki-left"></i>',
        },
        processing: `<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" *ngIf="loader"><div class="flex items-center gap-2 px-4 py-2 font-medium leading-none text-2sm border border-gray-200 shadow-default rounded-md text-gray-500 bg-light"><svg class="animate-spin -ml-1 h-5 w-5 text-gray-600" fill="none" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path></svg>Загрузка</div></div>`,
      },

      layout: {
        topStart: null,
        topEnd: null,
        bottomStart: null,
        bottomEnd: null,

        top: {
          className: 'card-header flex-wrap gap-2',
          features: {
            //info: { text: '<h3 class="card-title font-medium text-sm">Показано с _START_ по _END_ из _TOTAL_ записей</h3>' },
            search: {
              text: '<i class="ki-filled ki-magnifier"></i>',
              processing: true,
              placeholder: 'Поиск',
            },
            div: {
              html: `
                <div class="relative inline-block">
                  <button class="btn btn-sm btn-light" id="columnToggleButton">
                    <i class="ki-filled ki-setting-4"></i>Колонки
                  </button>
                  <div class="absolute right-0 hidden bg-white border border-gray-200 rounded shadow-default mt-2 p-4 min-w-300px" style="z-index: 100" id="columnToggleMenu">
                    <!-- Чекбоксы будут вставлены позже -->
                  </div>
                </div>
              `
            }
          }
        },

        bottom: {
          className: 'card-footer justify-center md:justify-between flex-col md:flex-row gap-5 text-gray-600 text-2sm font-medium',
          features: {
            pageLength: {
              menu: [5, 10, 25, 50],
              text: '<div class="flex items-center gap-2 order-2 md:order-1">Показать _MENU_ на странице</div>'
            },
            paging: { numbers: true, firstLast: false, buttons: 4, type: 'simple_numbers', boundaryNumbers: true, },
          }
        },
      },
    };
  }
}