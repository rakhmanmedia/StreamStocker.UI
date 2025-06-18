import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren  } from '@angular/core';
import { StockDetailService } from '../../services/stock-services/stock-detail.service';
import { ExpectedStock } from '../../models/expected-stock';
import { ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { StockService } from '../../services/stock-services/stock.service';
import { Stock } from '../../models/stock';
import { SearchLookupComponent } from '../../core/elements/search-lookup/search-lookup.component';
import DataTable, { Api, Config } from 'datatables.net';
import 'datatables.net-select';
import 'datatables.net-colreorder';
import { TypeContainerService } from '../../services/typeContainer-services/type-container.service';
import { TypeContainer } from '../../models/typeContainer';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { data, error } from 'jquery';
import { ImportContainerResult } from '../../models/importContainerResult';
import { Container } from '../../models/container';
import { DatatableConfigService } from '../../services/datatable-config-services/datatable-config.service';
import { RedirectedContainerService } from '../../services/redirected-container-service/redirected-container.service';
import { TextService } from '../../services/utils/text.service';
import { ExpectedContainer } from '../../models/expected-container-read';
import { StateContainerEnum } from '../../models/state-container-enum';
import { ExpectedContainerCreate } from '../../models/expected-container-create';
import { RedirectedContainerCreate } from '../../models/redirected-container-create';
import { NgForm, NgModel } from '@angular/forms';
import { EmptyContainerService } from '../../services/empty-container-services/empty-container.service';
import { EmptyContainerCreate } from '../../models/empty-container-create';

@Component({
  selector: 'app-expected-stock-detail',
  templateUrl: './expected-stock-detail.component.html',
  styleUrl: './expected-stock-detail.component.css'
})

export class ExpectedStockDetailComponent implements OnInit {

  @ViewChild(SearchLookupComponent) searchLookupContainers: SearchLookupComponent<TypeContainer>;
  @ViewChild('datatableExpectedContainers') datatableRef: ElementRef;
  @ViewChild('number') numberInput!: NgModel;
  @ViewChild('form') form!: NgForm; // Ссылка на всю форму
  
  expectedContainers: ExpectedContainer[] = []; // Массив ожидаемых контейнеров
  createExpectedContainer: ExpectedContainerCreate; // Новый ожидаемый контейнер
  isLoading: boolean = false; // Флаг загрузки данных






  isValidatorActive: boolean = true;

  onNotRestore(): void {
    this.isValidatorActive = false;
  }

  onContainerChange(): void {
    this.isNotCheckNumber = false;
  }

  onIgnoreControlDigitChange(): void {
    //this.numberInput.control?.updateValueAndValidity();
  }


  expectedStocks: ExpectedContainer[] = [];
  expectedStock: ExpectedStock;
  expectedContainer: ExpectedContainer;
  typeContainers: TypeContainer[];
  currentStock: Stock;
  private stockId: Guid;
  loadedCount: number = 0;
  emptyCount: number = 0;
  datatableExpectedContainers: any;
  datatableToRedirectContainers: Api<any>;
  isNotCheckNumber: boolean = false;
  filePath: string;
  isloadedCntr: boolean = false;


  checkImportDataResult: ImportContainerResult = new ImportContainerResult();
  isImportInvalidDigit: boolean = false; // Флаг для импорта данных с неверной контрольной цифрой
  isRestoreFromMarkedForDelete: boolean = false; // Флаг для восстановления данных с пометкой на удаление
  
  isError: boolean = false;
  isCheckingImportFile: boolean = false; // Флаг проверки импортируемого файла
  isElementHidden = true;
  selectedExpectedContainers: any[] = [];
  configDatatable: any;
  stateContainerEnum = StateContainerEnum;
  stateContainerOptions: {key: string, value: string}[];
  state:string;

  // Флаги фильтров
  isApplicationDateFilterActive: boolean = false;

  constructor(
    private datatableConfigServ: DatatableConfigService,
    private redirectedContainerServ: RedirectedContainerService,
    private emptyContainerServ: EmptyContainerService,
    private typeContainerServ: TypeContainerService,
    private stockDetailServ: StockDetailService,
    private textServ: TextService,
    private stockServ: StockService,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef,
    activateRoute: ActivatedRoute,
  ) {


    this.stateContainerOptions = Object.keys(this.stateContainerEnum)
      .filter(key => isNaN(Number(key)))
      .map(key => ({key, value: this.stateContainerEnum[key as keyof StateContainerEnum].toString() }))

      console.log(this.stateContainerOptions);

    // Получение ID текущего стока
    this.stockId = activateRoute.snapshot.params['id'];

    // Инициализация модели ExpectedStock
    this.expectedStock = new ExpectedStock();
    this.expectedStock.stockId = this.stockId
    this.expectedStock.applicationDate = new Date().toISOString().slice(0, 10);

    this.createExpectedContainer = new ExpectedContainerCreate();
    this.createExpectedContainer.stockId = this.stockId
    this.createExpectedContainer.applicationDate = new Date().toISOString().slice(0, 10);
  }

  onAddExpectedContainer(): void {
    this.stockDetailServ.addExpectedContainer(this.createExpectedContainer, this.stateCntr).subscribe({
      next: (resp) => {
        console.log(resp);
        this.loadData();
        this.toastr.success('Запись успешно добавлена', 'Сообщение');
      },
      error: (err) => { console.log(err); this.toastr.error(err.error.title, 'Ошибка'); }
    });
  }

  //--------------------------------- MAIN CONTENT ---------------------------------//

  // Инициализация компонента
  ngOnInit(): void {
    
    this.isLoading = true;
    this.isError = false;
    this.datatableConfigServ.configureDataTable();

    forkJoin({
      config: this.initializeDatatableConfig(),
      stockData: this.stockServ.getStock(this.stockId),
      expectedContainersData: this.stockDetailServ.getAllExpectedContainersByStockId(this.stockId),
      typeContainers: this.typeContainerServ.getGetTypeContainers(),
    })
    .subscribe({
      next: ({ config, stockData, expectedContainersData, typeContainers }) => {

        this.configDatatable = config;
        this.currentStock = stockData.data;
        this.expectedContainers = expectedContainersData.data;
        this.typeContainers = typeContainers.data;

        config = {
          ...this.datatableConfigServ.getDefaultConfig(),
          columns: this.getColumns(),
          data: this.expectedContainers
        };        

        this.isLoading = false;
        this.cdRef.detectChanges();
        this.initializeDataTable(config);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.isError = true;
        this.toastr.error(err.statusText, 'Ошибка загрузки');
      }
    })
  }
  //

  onAcceptContainer(): void {
    const selectedRows: ExpectedContainer[] = this.datatableExpectedContainers.rows({ selected: true }).data().toArray().map((row: ExpectedContainer) => row);

    if (selectedRows.length == 0) {
      this.toastr.warning('Не выбрано ни одной записи.', 'Внимание')
      return;
    }

    const emptyContainers = selectedRows
      .filter(item => item.sessionContainer.currentSessionContainerState.stateContainer == 'Empty')
      .map(expectedContainer => <EmptyContainerCreate>{
        stockId: expectedContainer.stockId,
        sessionContainerId: expectedContainer.sessionContainer.id,
      });

      this.emptyContainerServ.addEmptyContainers(emptyContainers)
      .pipe(
        switchMap((result) => {
          return this.reloadDatatable().pipe(
            tap(() => this.toastr.success(result.description, 'Принятие контейнера'))
          )
        })
      )
      .subscribe();

    const loadedStateSelectedRows = selectedRows
      .filter(item => item.sessionContainer.currentSessionContainerState.stateContainer == 'Loaded');
  }

  // Перезагрузка Datatable
  private reloadDatatable(): Observable<void> {
    if (!this.datatableExpectedContainers) {
      return of(void 0);
    }

    this.datatableExpectedContainers.processing(true);
        
    return this.stockDetailServ.getAllExpectedContainersByStockId(this.stockId)
      .pipe(
        tap((result) => {
          this.expectedStocks = result.data;
          this.configDatatable = {
            data: this.expectedStocks
          }
          this.initializeDataTable(this.configDatatable);
        }),
        finalize(() => this.datatableExpectedContainers.processing(false)),
        map(() => void 0),
        catchError(err => {
          this.toastr.error(err.error, 'Ошибка обновления');
          return throwError(() => err);
        })
      )
  }
  //


  // Инициализация DataTable
  private initializeDataTable(config: any): void {
    if (this.datatableRef && this.datatableRef.nativeElement)
    {
      if (this.datatableExpectedContainers) {
        this.datatableExpectedContainers.clear();
        this.datatableExpectedContainers.rows.add(config.data);
        this.datatableExpectedContainers.draw();
      }
      else this.datatableExpectedContainers = new DataTable(this.datatableRef.nativeElement, config)
    }
    else console.error('Таблица не найдена в DOM!');
  }
  //

  // Инициализация конфигурации Datatable
  private initializeDatatableConfig(): Observable<any> {
    return new Observable((observer) => {
      this.datatableConfigServ.configureDataTable();
      const config = {
        ...this.datatableConfigServ.getDefaultConfig(),
        columns: this.getColumns()
      };
      observer.next(config);
      observer.complete();
    });
  }
  //

  // Пометить на удаление
  onMarkToDelete(): void {
    const selectedRowsId: Guid[] = this.datatableExpectedContainers.rows({selected: true}).data().toArray().map((row: ExpectedContainer) => row.sessionContainer.id);
    console.log(selectedRowsId);
    
    if (selectedRowsId.length == 0)
    {
      this.toastr.warning('Не выбрано ни одной записи.', 'Внимание')
      return;
    }

    this.stockDetailServ.markToDelete(selectedRowsId).subscribe({
      next: (resp) => {
        if (resp.data)
        {
          this.reloadDatatable().subscribe({
            next: () => this.toastr.success(`Записи успешно помечены на удаление: ${selectedRowsId.length} ${this.textServ.getRecordWord(selectedRowsId.length)}.`, 'Удаление'),
            error: () => this.toastr.error('Не удалось обновить таблицу', 'Ошибка')
          }); 
        }
      },
      error: (err) => {
        this.toastr.error(err.error, 'Ошибка');
      }
    });
  }
  //

  // Генерация и получение колонок Datatable
  private getColumns(): any[] {
    return [
      { className: 'w-14', data: null, orderable: false, render: DataTable.render.select() },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">ID</span><span class="sort-icon"></span></span>`,
        data: 'id',
        visible: false
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.number',
        render: function (data: any, type, row) {
          switch (row.isValidControlDigit) {
            case true:
              return `<div class="flex items-center gap-1"><span class="text-sm font-medium text-gray-900">${data}</span><i class="ki-filled ki-verify me-1 text-success"></i></div><div class="tooltip transition-opacity duration-300" id="transition_tooltip">
                  Sleek tooltip with opacity transition effect.
                </div>`;
            case false:
              return `<div class="flex items-center gap-1"><span class="text-sm font-medium text-gray-900">${data}</span><i class="ki-filled ki-information me-1 text-warning" data-tooltip="#transition_tooltip"></i></div><div class="tooltip" id="transition_tooltip">
                  Контрольная цифра не соответствует.
                </div>`;
            default:
              return data;
          }
        }
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Тип</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.typeContainerName',
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Состояние</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.currentSessionContainerState.stateContainer',
        render: function (data: StateContainerEnum, type, row) {  
          switch (data) {
            case StateContainerEnum.Loaded:
              return `<span class="badge badge-success badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-success me-1.5"></span>${row.sessionContainer.currentSessionContainerState.stateContainerDescription}</span>`;
            case StateContainerEnum.Empty:
              return `<span class="badge badge-warning badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-warning me-1.5"></span>${row.sessionContainer.currentSessionContainerState.stateContainerDescription}</span>`
            default:
              return `<span class="badge badge-danger badge-outline rounded-[30px]"><span class="badge badge-dot badge-danger size-1.5 me-1.5"></span>Неизвестно</span>`;
          }
        }
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Дата заявки</span><span class="sort-icon"></span></span>`,
        data: 'applicationDate',
        render: function (data: any) {
          let date = new Date(data);
          return date.toLocaleDateString();
        }
      },
    ];
  }
//

showFilterPanel(): void {
  this.isElementHidden = !this.isElementHidden;
}

//--------------------------------- END MAIN CONTENT ---------------------------------//

//--------------------------------- REDIRECT MODAL ---------------------------------//

// Открытие модального окна для переадресации контейнеров
onOpenRedirectModal(): void {
  const expectedContainers = this.datatableExpectedContainers.rows({ selected: true }).data().toArray();

  if (expectedContainers.length == 0)
    this.toastr.warning('Не выбрано ни одной записи.', 'Внимание');

  else if (expectedContainers.length > 10)
    this.toastr.warning('Возможно переадресовать не более 10 записей.', 'Внимание');
  else {
    this.selectedExpectedContainers = expectedContainers.map(expectedContainer => {
      return <RedirectedContainerCreate>{
        sessionContainerId: expectedContainer.sessionContainerId,
        sessionContainer: {
          container: expectedContainer.sessionContainer.container
        },
        comments: '',
        redirectionDate: new Date().toISOString().slice(0, 10),
        stockId: this.currentStock.id
      };
    });
  }
}
//

onRedirect(): void {
  this.redirectedContainerServ.addRedirectedContainers(this.selectedExpectedContainers)
  .pipe(
    switchMap((result) => {
      return this.reloadDatatable()
      .pipe(
        tap(() => this.toastr.success(result.description, 'Переадресация контейнера'))
      )
    }),
    catchError((err) => {
      this.toastr.error(err.error, 'Ошибка переадресации');
      return EMPTY;
    })
  )
  .subscribe();
  // this.redirectedContainerServ.addRedirectedContainers(this.selectedExpectedContainers).subscribe({
  //   next: (resp) => {
  //     this.reloadDatatable().subscribe({
  //       next: () => this.toastr.success(resp.description, "Переадресация"),
  //       error: (err) => this.toastr.error('Не удалось обновить таблицу', 'Ошибка')
  //     });  
  //   },
  //   error: (err) => {
  //     console.log(err);
  //     this.toastr.error(err.error.description, 'Ошибка');
  //   }
  // })
}

//--------------------------------- END REDIRECT MODAL ---------------------------------//



  

  

  configureTableToRedirect(data: any[]): void
  {
    console.log('ddd');
    
    const configDataTableToRedirect: Config = {

      columns: [
        { title: 'Контейнер'}
      //   {
      //     className: 'text-start !font-normal !text-gray-700',
      //     title: 'Контейнер',
      //     data: 'container.number',
      //     render: function(data) {
      //       return `<span class="text-sm font-medium text-gray-900 hover:text-primary">${data}</span>`
      //     }
      //   },
      //   {
      //     className: '!font-normal !text-gray-700',
      //     title: 'Примечание',
      //     data: 'comments',
      //     render: function(data: any, type: any) {
      //       return `<input class="input border-0 bg-transparent" placeholder="примечание" ([ngModel])="comments" value="${data}"/>`
      //     }
      //   },
      //   {
      //     className: '!font-normal !text-gray-700',
      //     title: 'Документы',
      //     data: null
      //   }
      ],
      search: true,
      ordering: false,
      info: false,
      paging: true,
      pageLength: 5,
      searching: false
    };
    
    if (!this.datatableToRedirectContainers) {
      DataTable.ext.classes.table = 'table';
      this.datatableToRedirectContainers = new DataTable('#datatableToEedirectContainers');
    }
    else {
      this.datatableToRedirectContainers.clear(); // Clear existing data
      this.datatableToRedirectContainers.rows.add(data); // Add new data
      this.datatableToRedirectContainers.draw(); // Redraw the table
    }

    console.log(this.datatableToRedirectContainers);
    
  }



  checkToastr(): void {
    let exportData = this.datatableExpectedContainers.rows({search: 'applied'}).data().toArray();
    console.log(exportData);
    let selectedRows = this.datatableExpectedContainers.rows({selected: true}).data();
    console.log(selectedRows);
    this.toastr.success('Сообщение отправлено!', 'Успех');
  }

  





  onCheckImportData(): void {
    console.log(this.checkImportDataResult);
    
    this.isCheckingImportFile = true;
    const options = {
      path: this.filePath,
      stockId: this.stockId,
      isLoadedCntr: this.isloadedCntr
    };

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
        error: (err) => {
          console.log(err);
          this.toastr.error(err.message, "Ошибка проверки файла");
          this.isCheckingImportFile = false;
        },
        complete: () => { 
          this.isCheckingImportFile = false; 
        } 
      })
    }
  }

  // Формирование массива Container для импорта
  private getDataImport(checkImportDataResult: ImportContainerResult): Container[] {
    let result = checkImportDataResult.validContaners;
    
    if (checkImportDataResult.invalidControlDigitRows > 0 && this.isImportInvalidDigit)
      result = result.concat(checkImportDataResult.invalidControlDigitContaners);

    return result;
  }

  // Формирование массива Guid для восстановления
  private getDataRestore(checkImportDataResult: ImportContainerResult): Guid[] | null {
    return this.isRestoreFromMarkedForDelete ? checkImportDataResult.existsAsMarkedForDeletion.map(item => item.id) : null;
  }

  public executeImportAndRestore(dataImport: Container[], dataRestore: Guid[]): void {
    console.log(dataRestore);
    
    const import$ = dataImport && dataImport.length > 0
      ? this.stockDetailServ.importData(dataImport, this.stockId, this.stateCntr)
      : of(null);

    const restore$ = dataRestore && dataRestore.length > 0
      ? this.stockDetailServ.restoreData(dataRestore, this.currentStock.id, this.stateCntr)
      : of(null);

    forkJoin([import$, restore$]).subscribe({
      next: () => {
        this.toastr.success('Импорт / восстанволение данных успешно выполнен.' , 'Импорт / восстанволение данных');
        this.loadData();
      },
      error: (err) => {
        console.log(err);
        const message = err.error || 'Произошла ошибка при обработке данных.';
      this.toastr.error(message, 'Ошибка');
      }
    })
  }

  onImportData(checkImportDataResult: ImportContainerResult): void {
    const dataImport = this.getDataImport(checkImportDataResult);
    const dataRestore = this.getDataRestore(checkImportDataResult);

    console.log(dataRestore);

    if (dataImport.length == 0 && dataRestore.length == 0)
    {
      this.toastr.info('Нет данных для обработки.', 'Импорт данных');
      return;
    }

    this.executeImportAndRestore(dataImport, dataRestore);
  }



 

  // Вызов метода экспорта отображаемых данных
  onExportVisibleData(): void {
    const exportData = this.datatableExpectedContainers.rows({ search: 'applied' }).data().toArray(); // получение данных отображаемых строк
    const visibleColumns = this.datatableExpectedContainers.columns(':visible').indexes().filter((colIndex: number) => colIndex != 0).toArray(); // получение индексов видимых колонок, кроме первой колонки с чекбоксами
    const columnHeaders = visibleColumns.map((colIndex: number) => this.datatableExpectedContainers.column(colIndex).header().textContent); // получение заголовков

    // Формирование массива с данными для экспорта
    const csvData = [columnHeaders.join(';'), ...exportData.map((row: ExpectedStock[]) =>
      visibleColumns.map((colIndex: number) => {
        const colData = this.datatableExpectedContainers.column(colIndex).dataSrc().toString();
        //console.log(colData);
         
        const value = this.getNestedValue(row, colData)
        console.log(value);
        
        return colData.includes('Date') ? this.formatDate(value) : value
      }).join(';'))].join('\n');

    // Вызов метода экспорта в файл
    //this.exportToCSV(csvData, 'dataExport.csv');
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
  private initializeDataTable1(data: any[]): void {

    const self = this;
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

        // table.on('select', function (e, dt, type, indexes) {
        //   if (type === 'row') {
        //     console.log('indexes: ' , indexes)
        //     const rowData = table.row(indexes).data();
        //     console.log('Selected Row Data:', rowData);
        //   }
        // });

        // $('td:first-child').on('change', function (event) {
          
        //   const select = event.target as HTMLInputElement;
        //   const row = $(select).closest('tr'); // Находим строку, содержащую чекбокс
        //   const selectedRowIndex = table.row(row).index();// .closest('tr').index());
        //   const selectedRow = table.row(selectedRowIndex).data();

        //   console.log(selectedRowIndex);
        //   if (select.checked)
        //     self.selectedExpectedContainers.push(selectedRow);
        //   else self.selectedExpectedContainers = self.selectedExpectedContainers.filter(item => item.id != selectedRow.id);
        // })
      },

      order: [5, 'desc'],

      drawCallback: () => {
        $('.dt-search label').append(document.querySelector('.dt-input')).addClass('input input-sm');
        $('.dt-search').removeClass('dt-search');
      },

      data: data,

      columns: [
        { className: 'w-14', data: null, orderable: false, render: DataTable.render.select() },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">ID</span><span class="sort-icon"></span></span>`,
          data: 'id', 
          visible: false 
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sort-icon"></span></span>`,
          data: 'container', 
          render: function(data) {
            switch (data.isValidControlDigit)
            {
              case true:
                return `<a href="#" class="text-sm font-medium text-gray-900 hover:text-primary">${data.number}</a> <i class="ki-filled ki-verify me-1 text-success"></i><div class="tooltip transition-opacity duration-300" id="transition_tooltip">
                Sleek tooltip with opacity transition effect.
               </div>`;
               case false:
                return `${data.number} <i class="ki-filled ki-information me-1 text-warning" data-tooltip="#transition_tooltip"></i><div class="tooltip" id="transition_tooltip">
                Контрольная цифра не соответствует.
               </div>`;
               default:
                return data.number;
            }
          }
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Тип</span><span class="sort-icon"></span></span>`,
          data: 'container.typeContainer.name', },
        {
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Состояние</span><span class="sort-icon"></span></span>`,
          data: 'container.currentState.stateContainerDescription',
          render: function(data) {
            switch(data){
              case 'Груженый':
                return `<span class="badge badge-success badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-success me-1.5"></span>${data}</span>`;
              case 'Порожний':
                return `<span class="badge badge-warning badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-warning me-1.5"></span>${data}</span>`
              default:
                return `<span class="badge badge-danger badge-outline rounded-[30px]"><span class="badge badge-dot badge-danger size-1.5 me-1.5"></span>Неизвестно</span>`;
            }
          }
        },
        {
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Дата заявки</span><span class="sort-icon"></span></span>`,
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
        emptyTable: '<div class="text-center">Данные в таблице отсутствуют.</div>',
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

    if (this.datatableRef && this.datatableRef.nativeElement) {
      if (this.datatableExpectedContainers) {
        this.datatableExpectedContainers.clear();
        this.datatableExpectedContainers.rows.add(data);
        this.datatableExpectedContainers.draw();
      }
      else {
        this.datatableExpectedContainers = new DataTable(this.datatableRef.nativeElement, configDataTable)
      }
    }
    else { console.error('Таблица не найдена в DOM!') }
  }

  private loadData(): void {
    this.isLoading = true;
    forkJoin({
      typeContainers: this.typeContainerServ.getGetTypeContainers(),
      currentStock: this.stockServ.getStock(this.stockId),
      expectedStocks: this.stockDetailServ.getAllExpectedContainersByStockId(this.stockId)
    }).subscribe({
      next: (results) => {
        setTimeout(() => {
          this.typeContainers = results.typeContainers.data;
          this.currentStock = results.currentStock.data;
          this.expectedStocks = results.expectedStocks.data; console.log(this.expectedStocks);

          // this.loadedCount = this.expectedStocks.filter(el => el.state == 1).length;
          // this.emptyCount = this.expectedStocks.filter(el => el.state == 0).length;

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
    this.datatableExpectedContainers.column(object.getAttribute('data-index')).search(object.value).draw();
  }

  stateCntr: 'empty' | 'loaded' | null = null;

  // toggleState(): void {
  //   if (this.stateCntr == 'neutral')
  //     this.stateCntr = 'empty';
  //   else if (this.stateCntr == 'empty')
  //     this.stateCntr = 'loaded';
  //   else this.stateCntr = 'neutral';
  // }

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

  // Модальное окно переадресации контейнеров
  //
  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>; // Получение всех элементов fileInput из DOM

  // Открытие диалогового окна для выбора документов
  onOpenFileDialog(index: number): void {
    const fileInputArray = this.fileInputs.toArray();
    const fileInput = fileInputArray[index]?.nativeElement

    if (fileInput)
      fileInput.click(); // Запускаем собитие click у элемента input
  }

  onSelectFile(event: Event, index: number): void {
    const input = (event.target as HTMLInputElement);

    if (input?.files)
    {
      const count = input.files.length;
      this.selectedExpectedContainers[index].fileCount = `${count} ${this.textServ.getFileWord(count)}`;
    }
  }

  documentsInputChange(event): void {
    var count = event.target.files.length;
    document.getElementById('documentsCount').textContent = `${count} ${this.textServ.getFileWord(count)}`
  }
  //
}