import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, viewChild, ViewChild, ViewChildren } from '@angular/core';
import { forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { EmptyContainerService } from '../../../../services/empty-container-services/empty-container.service';
import { ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { ToastrService } from 'ngx-toastr';
import { StockService } from '../../../../services/stock-services/stock.service';
import { Stock } from '../../../../models/stock';
import { DatatableConfigService } from '../../../../services/datatable-config-services/datatable-config.service';
import DataTable, { Api, Config } from 'datatables.net';
import { EmptyContainerRead } from '../../../../models/empty-container-read';
import { Docs } from '../../../../models/document';
import { DocumentService } from '../../../../services/document-services/document.service';
import { GuideStatusDocumnetService } from '../../../../services/guide-status-document-services/guide-status-documnet.service';
import { GuideStatusDocument } from '../../../../models/guide-status-document';
import { AttachmentType } from '../../../../models/attachment-type.enum';
import { mapToEmptyContainerUpdate } from '../../../../helpers/empty-container-mapper';
import { TransportVehicleService } from '../../../../services/transport-vehicle-services/transport-vehicle.service';
import { TransportVehicleRead } from '../../../../models/transport-vehicle-read';
import { mapToTransportVehicleCreate } from '../../../../helpers/transport-vehicle-mapper';
import { IBaseResponse } from '../../../../models/baseResponse';
import { DriverService } from '../../../../services/driver-services/driver.service';
import { mapToDriverCreate } from '../../../../helpers/driver-maper';
import { ColumnFilterComponent } from '../../../../core/elements/column-filter/column-filter.component';
import { getNestedValue } from '../../../../shared/utils/object-utils';

@Component({
  selector: 'app-empty-containers',
  templateUrl: './empty-containers.component.html',
  styleUrl: './empty-containers.component.css'
})

export class EmptyContainersComponent implements OnInit, AfterViewInit {
  
  @ViewChild('datatableEmptyContainers') datatableRef: ElementRef;
  

  isLoading: boolean = false; // Флаг загрузки данных
  isError: boolean = false; // Флаг ошибок при загрузке данных
  currentStock: Stock; // Текущий сток
  emptyContainers: EmptyContainerRead[];
  transportVehicles: TransportVehicleRead[];
  guideStatusDocuments: GuideStatusDocument[];
  selectedGuideStatusDocumentId: string;
  datatableEmptyContainers: any;
  configDatatable: any;
  attachmentType = AttachmentType; // тип вложения (изображение или документ)
  selectedSessionContainerId: string; // ID выбранной сессии контейнера
  private stockId: Guid // ID текущего стока

  constructor (
    private datatableConfigServ: DatatableConfigService,
    private toastr: ToastrService,
    private emptyContainerServ: EmptyContainerService,
    private documentServ: DocumentService,
    private guideStatusDocumentServ: GuideStatusDocumnetService,
    private stockServ: StockService,
    private transportVehicleServ: TransportVehicleService,
    private driverServ: DriverService,
    private cdRef: ChangeDetectorRef,
    activateRoute: ActivatedRoute,
  ) {
    // Получение ID текущего стока
    this.stockId = activateRoute.snapshot.params['id'];
  }

  ngAfterViewInit(): void {
    $(document).on('click', function (event: Event) {
      const $target = $(event.target as HTMLElement);

      if (
        !$target.closest('#column-dropdown-menu').length &&
        !$target.closest('.filter-button').length
      ) {
        $('#column-dropdown-menu').addClass('hidden');
      }
    });
  }

  //--------------------------------- FILTER AND SORT ---------------------------------//

  columnType: 'string' | 'date' | 'time' | 'boolean' | 'movementType';
  @ViewChild(ColumnFilterComponent) columnFilter!: ColumnFilterComponent;

  private initializedColumnFilterButton(): void {
    this.datatableRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.filter-button') as HTMLElement;
      
      if (button) {
        const colIndex = button.getAttribute('data-col-index');
        this.columnFilter!.colIndex = +colIndex;

        if (Object.keys(this.appliedFilters).length > 0) {
          const columnField = this.datatableEmptyContainers.settings()[0].aoColumns[colIndex].mData;
          if (this.appliedFilters[columnField]?.value) this.currentFilterValue = this.appliedFilters[columnField]
          else this.currentFilterValue = null;
        }

        const rawType = button.getAttribute('data-col-type');
        const allowedTypes = ['string', 'date', 'time', 'boolean', 'movementType'] as const;
        this.columnType = allowedTypes.includes(rawType as any) ? rawType as typeof allowedTypes[number] : 'string';
        this.columnFilter!.openMenuFilter(event, button);
      }
    })
  }

  //--------------------------------- END FILTER AND SORT ---------------------------------//

  

  appliedFilters: { [fieldName: string]: { type: 'empty' | 'noEmpty' | 'value'; value: string } } = {};
  currentFilterValue: {type: 'empty' | 'noEmpty' | 'value'; value: string} ;
  filtredEmptyContainers: EmptyContainerRead[];
  onFilterChange(event: { colIndex: number; type: 'empty' | 'noEmpty' | 'clear' | 'value', value: any | null }): void {
    const columnField = this.datatableEmptyContainers.settings()[0].aoColumns[event.colIndex].mData;

    if (event.type == 'clear') 
      delete this.appliedFilters[columnField]
    else this.appliedFilters[columnField] = {
      type: event.type, 
      value: event.value
    };
    
    this.applyFilters();
  }

  private applyFilters(): void {
    const filteredData = this.emptyContainers.filter(row => {
      return Object.entries(this.appliedFilters).every(([field, filter]) => {
        const value = getNestedValue(row, field);

        switch (filter.type) {
          case 'value':
            return value.toString().toLowerCase().includes(filter.value.toLowerCase());
          case 'empty':
            return value == null || value == undefined || value == '';
          case 'noEmpty':
            return value != null && value != undefined && value != '';
          default:
            return true;
        }
      })
    })
    this.redrawDataTable(filteredData);
  }

  onSortingChange(event: { colIndex: number; order: 'asc' | 'desc' }): void {
    const columnField = this.datatableEmptyContainers.settings()[0].aoColumns[event.colIndex].mData;
    const sortedData = this.datatableEmptyContainers.data().toArray().sort((a, b) => {
      const valueA = getNestedValue(a, columnField);
      const valueB = getNestedValue(b, columnField);

      if (valueA == null) return 1;
      if (valueB == null) return -1;

      return event.order === 'asc' 
        ? valueA.toString().localeCompare(valueB.toString()) 
        : valueB.toString().localeCompare(valueA.toString());
    })
    this.redrawDataTable(sortedData);
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.isError = false;
    this.datatableConfigServ.configureDataTable();

    forkJoin({
      config: this.initializeDatatableConfig(),
      stockData: this.stockServ.getStock(this.stockId),
      emptyContainersData: this.emptyContainerServ.getAllEmptyContainersByStockId(this.stockId),     
      guidStatusDocumentData: this.guideStatusDocumentServ.getAllGuideStatusDocuments()
    }).subscribe({
      next: ({ config, stockData, emptyContainersData, guidStatusDocumentData }) => {
        this.configDatatable = config;
        this.currentStock = stockData.data;
        this.emptyContainers = emptyContainersData.data;
        this.guideStatusDocuments = guidStatusDocumentData?.data ?? [];
        this.selectedGuideStatusDocumentId = this.guideStatusDocuments.find(item => item.name == 'ПРПОРЖ')?.id.toString() ?? null;

        config = {
          ...this.datatableConfigServ.getDefaultConfig(),
          columns: this.getColumns(),
          data: this.emptyContainers
        }; 

        this.isLoading = false;
        this.cdRef.detectChanges();
        this.initializeDataTable(config);
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.toastr.error(err.statusText, 'Ошибка загрузки');
      }
    });
  }

  attachments: Docs[]; // Вложения
  // Инициализация DataTable
  private initializeDataTable(config: any): void {
    if (this.datatableRef && this.datatableRef.nativeElement)
    {
      if (this.datatableEmptyContainers) {
        this.redrawDataTable(config.data);
      }
      else {
        this.datatableEmptyContainers = new DataTable(this.datatableRef.nativeElement, config);

        this.initializeEditButton();
        this.initializedColumnFilterButton();
        this.setupColumnToggle();
        this.setupColumnToggleButton();

        this.documentServ.initializeAddAttacmentButtonListener(this.datatableRef);
        this.documentServ.selectedSessionContainerId$.subscribe(id => {
          this.selectedSessionContainerId = id;
        });

        this.documentServ.initializeLinkCountAttachemntsListener(this.datatableRef);
        this.documentServ.selectedSessionContainerId$.subscribe(id => {
          this.selectedSessionContainerId = id;

          this.documentServ.getFilesForSessionContainer(this.selectedSessionContainerId).subscribe({
            next: (result) => {
              this.attachments = result.data;
            },
            error: (err) => {
              this.toastr.error(err.error, "Ошибка");
            }
          })
        });
      }
    }
    else console.error('Таблица не найдена в DOM!');
  }
  //

  private redrawDataTable(data: any): void {
    this.datatableEmptyContainers.clear();
    this.datatableEmptyContainers.rows.add(data);
    this.datatableEmptyContainers.draw();
  }

  currentEmptyContainer: EmptyContainerRead | null = null;
  selectedEmptyContainerIds: string[] = [];
  currentEmptyContainerIndex: number = 0;

  private initializeEditButton(): void {
    this.datatableRef.nativeElement.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('[data-empty-container-id][data-modal-toggle]') as HTMLElement;

      this.selectedEmptyContainerIds = this.datatableEmptyContainers.rows({selected: true}).data().toArray().map((row: EmptyContainerRead) => row.id);
      
      if (button) {
        const emptyContainerId = button.getAttribute('data-empty-container-id');

        if (!emptyContainerId) return;

        this.currentEmptyContainerIndex = this.selectedEmptyContainerIds.findIndex(id => id == emptyContainerId)
        this.getDataEmptyContainer(emptyContainerId);
      }
    });
  }



  // Показать данные предыдущего контейнера
  showDataPrevious(): void {
    if (this.currentEmptyContainerIndex == 0) return;
    
    this.currentEmptyContainerIndex--;
    const emptyContainerId = this.selectedEmptyContainerIds[this.currentEmptyContainerIndex];
    this.getDataEmptyContainer(emptyContainerId);
  }

  // Показать данные следующего контенйнера
  showDataNext(): void {
    if (this.currentEmptyContainerIndex == this.selectedEmptyContainerIds.length - 1) return;

    this.currentEmptyContainerIndex++;
    const emptyContainerId = this.selectedEmptyContainerIds[this.currentEmptyContainerIndex];
    this.getDataEmptyContainer(emptyContainerId);
  }

  isLoadingFormContent: boolean = false;
  getDataEmptyContainer(id: string): void {
    this.isLoadingFormContent = true;
    this.emptyContainerServ.getEmptyContainer(id).subscribe({
      next: (result) => {
        this.currentEmptyContainer = result.data; 
        this.currentEmptyContainer.transportVehicle ??= { id: null, number: '' };
        this.currentEmptyContainer.driver ??= { id: null, name: '' };
        
        setTimeout(() => {
          this.isLoadingFormContent = false;
        }, 150);
      }
    });
  }
  
  searchTransport = (term: string) => {
    return this.transportVehicleServ.searchTransportVehicles(term);
  };

  searchDriver = (term: string) => {
    return this.driverServ.searchDriver(term);
  };

  onUpdateEmptyContainer(): void {
    let transportCreation$: Observable<any> = of(null);
    let driverCreation$: Observable<any> = of(null);

    const hasTransportToCreate: boolean = this.currentEmptyContainer.transportVehicleId == null && this.currentEmptyContainer.transportVehicle?.number?.trim().length > 0;
    const hasDriverToCreate: boolean = this.currentEmptyContainer.driverId == null && this.currentEmptyContainer.driver?.name?.trim().length > 0;

    if (hasTransportToCreate) {
      const createModelTransport = mapToTransportVehicleCreate(this.currentEmptyContainer.transportVehicle);
      transportCreation$ = this.transportVehicleServ.createTransportVehicle(createModelTransport)
        .pipe(tap(result => { this.currentEmptyContainer.transportVehicleId = result.data.id }))
    }

    if (hasDriverToCreate) {
      const createModelDriver = mapToDriverCreate(this.currentEmptyContainer.driver);
      driverCreation$ = this.driverServ.createDriver(createModelDriver)
        .pipe(tap(result => { this.currentEmptyContainer.driverId = result.data.id }))
    }

    forkJoin({
      transportCreation: transportCreation$,
      driverCreation: driverCreation$
    }).pipe(switchMap(() => this.performEmptyContainerUpdate(this.currentEmptyContainer)))
      .subscribe({
        next: (updateResult) => {
          if (updateResult.data) {
            this.toastr.success(updateResult.description, 'Обновление данных');
            const nextIndex = this.currentEmptyContainerIndex >= this.selectedEmptyContainerIds.length - 1
              ? 0
              : this.currentEmptyContainerIndex;

            this.selectedEmptyContainerIds.splice(this.currentEmptyContainerIndex, 1);

            const emptyContainerId = this.selectedEmptyContainerIds[nextIndex];
            this.getDataEmptyContainer(emptyContainerId);
            this.currentEmptyContainerIndex = nextIndex;
          }
        },
        error: (err) => this.toastr.error(err.error, 'Ошибка')
      });
  }

  performEmptyContainerUpdate(emptyContainerRead: EmptyContainerRead): Observable<IBaseResponse<boolean>> {
    const updateModel = mapToEmptyContainerUpdate(emptyContainerRead);
    return this.emptyContainerServ.updateEmptyContainer(updateModel);
  }

  // Инициализация конфигурации Datatable
  private initializeDatatableConfig(): Observable<any> {
    return new Observable((observer) => {
      this.datatableConfigServ.configureDataTable();
      const config = {
        ...this.datatableConfigServ.getDefaultConfig(),
        columns: this.getColumns(),
      };
      observer.next(config);
      observer.complete();
    });
  }
  //

  // Генерация и получение колонок Datatable
  private getColumns(): any[] {
    return [
      { className: 'w-10', data: null, orderable: false, hideToggle: true, render: DataTable.render.select() },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">ID</span><span class="sort-icon"></span></span>`,
        data: 'id',
        visible: false,
        hideToggle: true
      },
      {
        className: 'w-10',
        hideToggle: true,
        render: function(data: any, type, row) {
          return `<a class="btn btn-sm btn-icon btn-clear btn-light" data-empty-container-id=${row.id} data-modal-toggle="#edit_empty_container_modal">
          <i class="ki-outline ki-notepad-edit">
          </i>
         </a>`
        }
      },
      {
        className: 'min-w-36 resizable-th',
        title: `<button class="filter-button btn btn-sm btn-light btn-clear" data-col-index="3"><span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sorting-icon"><i class="ki-filled ki-arrow-up-down"></i></span></span></button>`,
        data: 'sessionContainer.container.number',
        render: function (data: any, type, row: any) {
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
        className: 'min-w-32',
        title: `<button class="filter-button btn btn-sm btn-light btn-clear" data-col-index="4"><span class="sort"><span class="sort-label font-normal text-gray-700">Тип</span><span class="sorting-icon"><i class="ki-filled ki-arrow-up-down"></i></span></span></button>`,
        data: 'sessionContainer.container.typeContainerName',
      },
      {
        className: 'min-w-32',
        title: `<button class="filter-button btn btn-sm btn-light btn-clear" data-col-index="5" data-col-type="date">
                <span class="font-normal text-gray-700">Дата приема</span><span class="sorting-icon"><i class="ki-filled ki-arrow-up-down"></i></span>
              </button>`,
        data: 'acceptanceDate',
        render: function (data: any) {
          if (data == null) return null;
          let date = new Date(data) ;
          return date.toLocaleDateString();
        }
      },
      {
        title: `<button class="filter-button btn btn-sm btn-light btn-clear" data-col-index="6" data-col-type="time"><span class="font-normal text-gray-700">Время приема</span><span class="sorting-icon"><i class="ki-filled ki-arrow-up-down"></i></span></button>`,
        data: 'acceptanceTime',
        render: function (data: any) {
          if (!data) return ''

          const [hours, minutes, seconds] = data.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, seconds);
          return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        }
      },
      {
        title: `<button class="filter-button btn btn-sm btn-light btn-clear" data-col-index="7"><span class="sort"><span class="sort-label font-normal text-gray-700">Приемный акт хранителя</span><span class="sorting-icon"><i class="ki-filled ki-arrow-up-down"></i></span></span></button>`,
        data: 'receiptActTerminalIn'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Транспорт на приеме</span><span class="sort-icon"></span></span>`,
        data: 'transportVehicle.number'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Водитель</span><span class="sort-icon"></span></span>`,
        data: 'driver.name'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Вложения</span></span>`,
        orderable: false,
        data: 'sessionContainer.documents.length',   
        render: function(data, type, row) {
          const inputId = `fileInput_${row.sessionContainer.id}`;
          if (type === 'display') console.log(data);

          return `<div class="flex items-center gap-5 justify-center"><a class="cursor-pointer text-sm font-medium text-gray-900 hover:text-primary-active mb-px" data-session-container-id=${row.sessionContainer.id} data-drawer-toggle="#kt_drawer_example" id="kt_drawer_example_toggle"><div class="flex flex-col items-center gap-1">
             <span class="text-gray-900 text-md md:text-2.5xl font-semibold">
              ${data}
             </span>
            </div></a><button id="add-attachment-button" type="button" class="btn btn-xs btn-icon btn-primary btn-outline rounded-full" data-modal-toggle="#add-attachments-modal" data-session-container-id="${row.sessionContainer.id}"><i class="ki-filled ki-plus"></i></button></div>`
        }
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Грузоподъемность</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.payload',
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Вес тары</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.tareWeight',
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Год производства</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.buildingYear',
      },
    ];
  }
  //

  // Открыть окно выбора файлов
  openFileInput(typeAttachments: AttachmentType): void {
    if (!this.selectedSessionContainerId) return;
    this.documentServ.openFileInput(typeAttachments, this.selectedSessionContainerId);
  }
  //

  // Выбор и загрузка вложений на сервер
  handleFileChange(event: Event, typeAttachments: AttachmentType): void {
    if (!this.selectedSessionContainerId) return;
    const files = this.documentServ.getSelectedFiles(event);

    if(!files || files.length == 0) {
      this.toastr.error('Не выбрано ни одного файла.', 'Ошибка')
      return;
    }

    this.documentServ.uploadFiles1(
      this.selectedSessionContainerId,
      typeAttachments,
      this.selectedGuideStatusDocumentId,
      files,
      (res) => {
        res.data.errors.length == 0 
          ? this.toastr.success(res.description, 'Загрузка файлов') 
          : this.toastr.warning('Частичная ошибка', 'Загрузка файлов');
      },
      (err) => {
        console.log(err);
        this.toastr.error(err.error, 'Ошибка загрузки файлов');
      }
    )
  }
  //


  private setupColumnToggle(): void {
    if (!this.datatableEmptyContainers) return;
  
    const api = this.datatableEmptyContainers;
    const $menu = $('#columnToggleMenu');
    $menu.empty(); // очистим на случай повторной инициализации
  
    const settings = api.settings()[0]; // получаем настройки таблицы

    api.columns().every(function (index: number) {
      const column = this;

      // получаем кастомное поле hideToggle из настроек
    const columnDef = settings.aoColumns[index];
    if ((columnDef as any).hideToggle) return; // пропустить колонку
  
      const columnTitle = $(column.header()).text().trim() || `Колонка ${index + 1}`;
      const checkedAttr = column.visible() ? 'checked' : '';
  
      const checkboxHtml = `
        <div class="form-check form-switch mb-2">
          <input class="checkbox checkbox-sm form-check-input column-toggle-checkbox" type="checkbox" data-column-index="${index}" ${checkedAttr}>
          <label class="form-check-label text-xs">${columnTitle}</label>
        </div>
      `;

      const menuItem = `
      <div class="menu-item">
    <a class="menu-link">
      <span class="menu-icon">
        <i class="ki-filled ki-arrow-up">
        </i>
      </span>
      <span class="menu-title text-sm">
        По возрастанию
      </span>
      <span class="menu-icon">
        <i class="checkmark ki-filled ki-check hidden">
        </i>
      </span>
    </a>
  </div>`;
  
      $menu.append(checkboxHtml);
      //$menu.append(menuItem);
    });
  
    $menu.on('change', '.column-toggle-checkbox', function () {
      const index = +$(this).data('column-index');
      const column = api.column(index);
      column.visible(!column.visible());
    });
  }

  private setupColumnToggleButton(): void {
    const $button = $('#columnToggleButton');
    const $menu = $('#columnToggleMenu');
  
    $button.on('click', function (e) {
      e.stopPropagation();
      $menu.toggleClass('hidden');
    });
  
    // Закрыть меню при клике вне его
    $(document).on('click', function (e) {
      if (!$(e.target).closest('#columnToggleMenu, #columnToggleButton').length) {
        $menu.addClass('hidden');
      }
    });
  }
}