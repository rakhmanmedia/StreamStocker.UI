import { AfterViewInit, Component, ElementRef, OnInit, ViewChild  } from '@angular/core';
import { StockDetailService } from '../../services/stock-services/stock-detail.service';
import { ExpectedStock } from '../../models/expected-stock';
import { ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { StockService } from '../../services/stock-services/stock.service';
import { Stock } from '../../models/stock';
import { SearchLookupComponent } from '../../core/elements/search-lookup/search-lookup.component';
import DataTable, { Api, Config } from 'datatables.net-dt';
import 'datatables.net-select';
import 'datatables.net-colreorder';
import { TypeContainerService } from '../../services/typeContainer-services/type-container.service';
import { TypeContainer } from '../../models/typeContainer';
import { ToastrService } from 'ngx-toastr';
import { InitializeScriptService } from '../../services/initializer-services/initialize-script.service';
import { forkJoin } from 'rxjs';
import { error } from 'jquery';
import { ImportContainerResult } from '../../models/importContainerResult';

@Component({
  selector: 'app-expected-stock-detail',
  templateUrl: './expected-stock-detail.component.html',
  styleUrl: './expected-stock-detail.component.css'
})

export class ExpectedStockDetailComponent implements OnInit, AfterViewInit {

  @ViewChild(SearchLookupComponent) searchLookupContainers: SearchLookupComponent<TypeContainer>;
  @ViewChild('datatable') datatableRef: ElementRef

  expectedStocks: ExpectedStock[] = [];
  expectedStock: ExpectedStock;
  typeContainers: TypeContainer[];
  currentStock: Stock;
  private stockId: Guid;
  loadedCount: number = 0;
  emptyCount: number = 0;
  datatable: Api<any>;
  isNotCheckNumber: boolean = false;
  filePath: string;
  isloadedCntr: boolean = false;


  checkImportDataResult: ImportContainerResult = new ImportContainerResult();
  isImportInvalidDigit: boolean = false; // Флаг для импорта данных с неверной контрольной цифрой
  isLoading:boolean = true;

  // Флаги фильтров
  isApplicationDateFilterActive: boolean = false;

  constructor(
    private typeContainerServ: TypeContainerService, 
    private stockDetailServ: StockDetailService, 
    private stockServ: StockService, 
    private toastr: ToastrService,
    private initScriptServ: InitializeScriptService,
    activateRoute: ActivatedRoute,
    ) {

    // Получение ID текущего стока
    this.stockId = activateRoute.snapshot.params['id'];

    // Инициализация модели ExpectedStock
    this.expectedStock = new ExpectedStock();
    this.expectedStock.stockId = this.stockId
    this.expectedStock.applicationDate = new Date().toISOString().slice(0, 10);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // Инициализация скрипта core.bundle.js
      this.initScriptServ.loadScript('./assets/js/core.bundle.js')
    .then(() => 
      console.log('Скрипт core.bundle.js загружен и готов к использованию.'))
    .catch((error) => 
      console.log(`При загружке скрипта core.bundle.js произошла ошибка: ${error}`));
    }, 0)
  }

  onContainerChange(): void {
    this.isNotCheckNumber = false;
  }

  checkToastr(): void {
    let exportData = this.datatable.rows({search: 'applied'}).data().toArray();
    console.log(exportData);
    let selectedRows = this.datatable.rows({selected: true}).data();
    console.log(selectedRows);
    this.toastr.success('Сообщение отправлено!', 'Успех');
  }

  onMarkToDelete(): void {
    // let exportData = this.datatable.rows({search: 'applied'}).data().toArray();
    // console.log(exportData);
    const selectedRowsId: Guid[] = this.datatable.rows({selected: true}).data().toArray().map((row: ExpectedStock) => row.id);

    if (selectedRowsId.length == 0)
    {
      this.toastr.warning('Не выбрано ни одной записи.', 'Внимание')
      return
    }

    this.stockDetailServ.markToDelete(selectedRowsId).subscribe({
      next: (resp) => {
        if (resp.data)
        {
          this.loadData();
          this.toastr.success('Записи успешно помечены на удаление.', 'Удаление');
        }
      },
      error: (err) => {
        console.log(err.error.description); this.toastr.error(err.error.description, 'Ошибка');
      }
    });
  }

  stateContaner: string = '';
  onSubmit(): void {

    console.log(this.stateContaner);

    this.stockDetailServ.addContainerToStock(this.expectedStock, this.stateContaner).subscribe(
      resp => { 
        console.log(resp); 
        this.loadData();
        this.toastr.success('Запись успешно добавлена', 'Сообщение');
      }, 
      error => {});
  }

  onCheckImportData(): void {
    this.isLoading = true;
    const options = {
      path: this.filePath,
      stockId: this.stockId,
      isLoadedCntr: this.isloadedCntr
    }
    console.log(this.filePath);
    console.log(this.isloadedCntr);

    const fileInput = document.querySelector('#import-file-path') as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0)
    {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.stockDetailServ.checkImportData(formData).subscribe({
        next: (resp) => { 
          this.checkImportDataResult = resp.data; 
          console.log(this.checkImportDataResult);
        }, 
        complete: () => { 
          this.isLoading = false; 
        } 
      })
    }
  }

  onImportData(checkImportDataResult: ImportContainerResult): void {
    console.log(this.isloadedCntr);

    let importData = checkImportDataResult.validContaners;
    
    if (checkImportDataResult.invalidControlDigitRows > 0 && this.isImportInvalidDigit)
      importData = [ ...checkImportDataResult.invalidControlDigitContaners];

    this.stockDetailServ.importData(importData, this.stockId, this.isloadedCntr).subscribe({next: (resp) =>{ this.toastr.success('Импорт данных успешно выполнен.' , 'Импорт данных')}, complete: () => {this.loadData(); importData=[] }});
  }

  setStatus(): void {
    if (this.expectedStock.state == 0)
    {
      this.expectedStock.state = 0;
      this.expectedStock.status = 0;
    }
    else if (this.expectedStock.state == 1)
    {
      this.expectedStock.state = 1;
      this.expectedStock.status = 1;
    }
  }

  ngOnInit(): void {

    // need create service
    DataTable.ext.classes.length.select = 'select select-sm w-16';
    DataTable.ext.classes.paging.container = 'pagination';
    DataTable.ext.classes.paging.button = 'btn';
    DataTable.ext.classes.paging.active = 'active disabled';
    DataTable.ext.classes.table = 'table table-auto table-border align-middle text-gray-700 font-medium text-sm';
    DataTable.ext.classes.layout.tableRow = 'scrollable-x-auto';
    DataTable.select.classes.checkbox = 'checkbox';

    this.loadData();
  }

  // Вызов метода экспорта отображаемых данных
  onExportVisibleData(): void {
    const exportData = this.datatable.rows({ search: 'applied' }).data().toArray(); // получение данных отображаемых строк
    const visibleColumns = this.datatable.columns(':visible').indexes().filter((colIndex: number) => colIndex != 0).toArray(); // получение индексов видимых колонок, кроме первой колонки с чекбоксами
    const columnHeaders = visibleColumns.map((colIndex: number) => this.datatable.column(colIndex).header().textContent); // получение заголовков

    // Формирование массива с данными для экспорта
    const csvData = [columnHeaders.join(';'), ...exportData.map((row: ExpectedStock[]) =>
      visibleColumns.map((colIndex: number) => {
        const colData = this.datatable.column(colIndex).dataSrc().toString();
        const value = this.getNestedValue(row, colData)
        return colData.includes('Date') ? this.formatDate(value) : value
      }).join(';'))].join('\n');

    // Вызов метода экспорта в файл
    this.exportToCSV(csvData, 'dataExport.csv');
  }

  private getNestedValue(obj: any, path:string): any {
    return path.split('.').reduce((acc, key) => (acc && acc[key] != undefined ? acc[key] : ''), obj);
  }

  private formatDate(dateString:string): string {
    const date = new Date(dateString);

    if (isNaN(date.getDate())) 
      return dateString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  // Экспорт данных в файл
  private exportToCSV(data: any, fileName: string = 'export.csv'): void {
    const bom = '\uFEFF'; // BOM для UTF-8
    const blob= new Blob([bom + data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'exported_data.csv';
    link.click();
  }

  // Сброс дополнительных фильтров
  onResetFilters(): void {
    this.resetApplicationDateFilter();
  }

  // Дополнительная фильтрация по дате заявки  
  private filterByDate(settings, data, dataIndex): boolean {
    const rawDate = data[5]; // Index колонки с датой

      const formatedDate = rawDate.split('.').reverse().join('-');
    
      const applicationDate = formatedDate ? new Date(formatedDate) : null;
    
      if (!applicationDate) {
        return false;
      }
    
      const minDate = $('#min-date').val() ? new Date($('#min-date').val() as string) : null;
      const maxDate = $('#max-date').val() ? new Date($('#max-date').val() as string) : null;
    
      if (
        (minDate === null || applicationDate >= minDate) &&
        (maxDate === null || applicationDate <= maxDate)
      ) {
        return true;
      }
      return false;
  }

  changeField(event): void {
    switch (event.target.id) {
      case "min-date":
      case "max-date":
        this.isApplicationDateFilterActive = true;
        break;
      default:
        this.isApplicationDateFilterActive = false;
        break;
    }
  }

  resetApplicationDateFilter(): void {
    $('#min-date').val(null);
    $('#max-date').val(null);
    this.isApplicationDateFilterActive = false;
    this.loadData();
  }
  // Инициализация DataTable
  private initializeDataTable(data: any[]): void {

    const configDataTable: Config = {
    
      processing: true,
      stateSave: true,
      pageLength: 10,

      colReorder: {
        columns: [4, 5]
      },

      initComplete: function () {

        $('.dataTable thead .dt-select-checkbox').addClass('checkbox');
        
        const table = this.api();

        // Date range filtering
        $('#min-date, #max-date').on('change', function () {
          table.processing(true);
          table.draw(); // Trigger DataTables redraw
          setTimeout(() => {
            table.processing(false);
          }, 0);
        });
      },

      order: [5, 'desc'],

      drawCallback: () => {
        $('.dt-search label').append(document.querySelector('.dt-input')).addClass('input input-sm');
        $('.dt-search').removeClass('dt-search');
      },

      data: data,

      columns: [
        { 
          data: null,
          orderable: false,
          render: DataTable.render.select()
        },
        { data: 'id', visible: false },
        { data: 'container.number', },
        { data: 'container.typeContainer.name', },
        {
          data: 'container.containerStates', render: function(data) {
            if (data.length>0) {
              let lastState = data[data.length - 1].stateContainer.toString();
              switch (lastState) {
                case 'Loaded':
                  return `<span class="badge badge-success badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-success me-1.5"></span>Груженый</span>`
                case 'Empty':
                  return `<span class="badge badge-danger badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-danger me-1.5"></span>Порожний</span>`
                default:
                  return `<span class="badge badge-warning badge-outline rounded-[30px]"><span class="badge badge-dot badge-warning size-1.5 me-1.5"></span>Неизвестно</span>`;
              }
            }
            else return `<span class="badge badge-warning badge-outline rounded-[30px]"><span class="badge badge-dot badge-warning size-1.5 me-1.5"></span>Неизвестно</span>`;
          }
        },
        {
          data: 'applicationDate', 
          render: function (data) {
            let date = new Date(data);
            return date.toLocaleDateString();
          }
        },
        {
          visible: false,
          data: 'status', className: 'text-center', render: function (data) {
            if (data == 0)
              return `<span class="badge badge-sm">WAIM</span>`
            else return `<span class="badge badge-sm">WAIL</span>`
          }
        },
      ],

      select: {
        info: false,
        items: 'row',
        style: 'multi',
        selector: 'td:first-child',
      },

      columnDefs: [
        { targets: 0, className: 'dt-select-checkbox checkbox',},
        { className: 'text-gray-800 font-normal', targets: [1, 2, 3, 4, 5] },
      ],

      language: {
        loadingRecords: '<div class="text-center">Загрузка...</div>',
        infoEmpty: '<h3 class="card-title font-medium text-sm">Показано 0 из 0 записей</h3>',
        infoFiltered: '',
        zeroRecords: '<div class="text-center">Совпадений не найдено.</div>',
        paginate: {
          next: '<i class="ki-outline ki-black-right"></i>',
          previous: '<i class="ki-outline ki-black-left"></i>',
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
            info: { text: '<h3 class="card-title font-medium text-sm">Показано с _START_ по _END_ из _TOTAL_ записей</h3>' },
            search: {
              text: '<i class="ki-filled ki-magnifier"></i>',
              processing: true,
              placeholder: 'Поиск',
            },
          }
        },
        
        bottom: {
          className: 'card-footer justify-center md:justify-between flex-col md:flex-row gap-5 text-gray-600 text-2sm font-medium',
          features: {
            pageLength: {
              menu:  [5, 10, 25, 50],
              text: '<div class="flex items-center gap-2 order-2 md:order-1">Показать _MENU_ на странице</div>'
            },

            paging: { numbers: true, firstLast: false, buttons: 4, type: 'simple_numbers',boundaryNumbers: true, },
          }
        },        
      },

      // loading data
      //ajax: (dataTablesParameters: any, callback) => this.loadData(callback),
    };

    DataTable.ext.search.push(this.filterByDate.bind(this)); // Подключение дополнительной фильтрации

    if (this.datatableRef && this.datatableRef.nativeElement)
    {
      if (this.datatable) {
        this.datatable.clear();
        this.datatable.rows.add(data);
        this.datatable.draw();
    }
    else {
      this.datatable = new DataTable(this.datatableRef.nativeElement, configDataTable)
    }
    }
    else{console.error('Таблица не найдена в DOM!')}
  }

  private loadData(): void {
    this.isLoading = true;
    forkJoin({
      typeContainers: this.typeContainerServ.getGetTypeContainers(),
      currentStock: this.stockServ.getStock(this.stockId),
      expectedStocks: this.stockDetailServ.getStockDetail(this.stockId)
    }).subscribe({
      next: (results) => {
        setTimeout(() => {
          this.typeContainers = results.typeContainers.data;
          this.currentStock = results.currentStock.data;
          this.expectedStocks = results.expectedStocks.data;

          this.loadedCount = this.expectedStocks.filter(el => el.state == 1).length;
          this.emptyCount = this.expectedStocks.filter(el => el.state == 0).length;

          this.initializeDataTable(this.expectedStocks);
        }, 0);
        
      },
      error: (err) => { console.log(error); this.toastr.error(err.error, 'Ошибка загрузки данных') },
      complete: () => { this.isLoading = false; 

      }
    });
  }

  // autofilter in column
  filterOnColumn(object: any): void {      
    console.log(object.value);
    this.datatable.column(object.getAttribute('data-index')).search(object.value).draw();
  }

  stateCntr: 'empty' | 'loaded' | 'neutral' = 'neutral';

  toggleState(): void {
    if (this.stateCntr == 'neutral')
      this.stateCntr = 'empty';
    else if (this.stateCntr == 'empty')
      this.stateCntr = 'loaded';
    else this.stateCntr = 'neutral';
  }

  onIsLoadedCntrChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isloadedCntr = input.checked ? true : input.indeterminate ? null : false;
  }

  onStateCntrChange(): void {
    console.log(this.stateCntr);
    switch (this.stateCntr) {
      case 'empty':
        this.isloadedCntr = false;
        break;
      case 'loaded':
        this.isloadedCntr = true;
        break;
    }
  }
}
