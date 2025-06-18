import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import DataTable from 'datatables.net';
import { finalize, forkJoin, Observable } from 'rxjs';
import { DatatableConfigService } from '../../../services/datatable-config-services/datatable-config.service';
import { RedirectedContainerService } from '../../../services/redirected-container-service/redirected-container.service';
import { RedirectedContainer } from '../../../models/redirected-container';
import { Docs } from '../../../models/document';
import { ToastrService } from 'ngx-toastr';
import { DocumentService } from '../../../services/document-services/document.service';
import { AttachmentType } from '../../../models/attachment-type.enum';
import { GuideStatusDocument } from '../../../models/guide-status-document';
import { GuideStatusDocumnetService } from '../../../services/guide-status-document-services/guide-status-documnet.service';
import { Guid } from 'guid-typescript';
import { InitializeScriptService } from '../../../services/initializer-services/initialize-script.service';
import { TranslateService } from '@ngx-translate/core';
import { StateContainerEnum } from '../../../models/state-container-enum';
import { TypeDocumentService } from '../../../services/type-document-services/type-document.service';
import { TypeDocument } from '../../../models/type-document';
import { error, event } from 'jquery';
import { MetronicService } from '../../../services/metronic-services/metronic.service';
import { UploadFilesResult } from '../../../models/uploadFilesResult';
import { Container } from '../../../models/container';

@Component({
  selector: 'app-redirected-containers',
  templateUrl: './redirected-containers.component.html',
  styleUrl: './redirected-containers.component.css'
})
export class RedirectedContainersComponent implements OnInit, AfterViewChecked {
  @ViewChild('datatableRedirectedContainers') datatableRef: ElementRef;
  //@ViewChild('modalFiles') modalFilesRef: ElementRef;

  //redirectedContainers: RedirectedContainer[];
  
  images: Docs[];
  groupedOnStatusImagesArray: any[];
  groupedOnStatusDocumentsArray: any[];
  documents: Docs[];
  datatableRedirectedContainers: any;
  
  isError: boolean = false; // Флаг ошибок
  configDatatable: any; // Конфигурация для Datatable
  AttachmentType = AttachmentType;

  constructor(
    private translate: TranslateService,
    private toastr: ToastrService,
    private initScriptServ: InitializeScriptService,
    private guideStatusDocumentServ: GuideStatusDocumnetService,
    private redirectedCntrsServ: RedirectedContainerService,
    private datatableConfigServ: DatatableConfigService, // сервис конфигурации DataTable
    private documentServ: DocumentService,
    private typeDocumentServ: TypeDocumentService,
    private cdRef: ChangeDetectorRef,
    private metronicServ: MetronicService
  ) { }

  //--------------------------------- MAIN REDIRECTED CONTAINER ---------------------------------//
  //
  @ViewChild('ktaccordion') accordionRef!: ElementRef; // ссылка на DOM-элемент ktaccordion
  @ViewChild('kttabs') tabsRef!: ElementRef; // ссылка на DOM-элемент kttabs

  private isAccordionInitialized: boolean = false; // флаг инициализации компонента KTAccordion
  private isTabsInitialized: boolean = false; // флаг инициализации компонента KTTabs

  guideStatusDocuments: GuideStatusDocument[] // справочник кактегорий документов;
  redirectedContainers: RedirectedContainer[]; // массив переадресованных контейнеров
  selectedGuideStatusDocumentId: Guid; // id текущей категории документов
  typeDocuments: TypeDocument[]; // справочник типов документов
  isLoading: boolean = false; // Флаг загрузки данных
  isShowAll: boolean = false; // флаг "показать все записи"

  ngAfterViewChecked(): void {
    // Инициализация компонента Metronic KTAccordion
    if (!this.isAccordionInitialized && this.accordionRef?.nativeElement) {     
      this.metronicServ.initializeAccordion();
      this.isAccordionInitialized = true;
    }
    //
    // Инициализация компонента Metronic KTTabs
    if (!this.isTabsInitialized && this.tabsRef?.nativeElement) {     
      this.metronicServ.initializeTabs();
      this.isTabsInitialized = true;
    }
    //
  }

  // Инициализация компонента
  ngOnInit(): void {
    const savedState = localStorage.getItem('redirectedContainers_isShowAll');

    if (savedState != null) 
      this.isShowAll = JSON.parse(savedState);

    this.datatableConfigServ.configureDataTable();
    this.isLoading = true;

    forkJoin({
      config: this.initializeDataTableConfig(),
      guidStatusDocumentData: this.guideStatusDocumentServ.getAllGuideStatusDocuments(),
      redirectedContainersData: this.isShowAll ? this.redirectedCntrsServ.getAllRedirectedContainers() : this.redirectedCntrsServ.getRedirectedContainersLastMonth(),
      typeDocuments: this.typeDocumentServ.getAllTypeDocuments()
    }).subscribe({
        next: ({ config, guidStatusDocumentData, redirectedContainersData, typeDocuments }) => {
          this.guideStatusDocuments = guidStatusDocumentData?.data ?? [];
          this.selectedGuideStatusDocumentId = this.guideStatusDocuments.find(item => item.name == 'ПЕРАДР')?.id ?? null;
          this.redirectedContainers = redirectedContainersData?.data ?? [];
          this.typeDocuments = typeDocuments?.data ?? []

          console.log(this.redirectedContainers);

          config = {
            ...this.datatableConfigServ.getDefaultConfig(),
            columns: this.getColumns(),
            data: this.redirectedContainers
          }

          this.configDatatable = config;

          this.isLoading = false;
          this.cdRef.detectChanges();
          this.initializeDataTable(config);
        },
        error: (err) => {
          this.toastr.error('Ошибка при загрузке данных:', 'Ошибка загрузки данных');
          console.error('Ошибка при загрузке данных:', err);
          this.isLoading = false;
        }
      })
  }
  //

  // Инициализация конфигурации Datatable
  private initializeDataTableConfig(): Observable<any> {
    return new Observable<any>((observer) => {
      this.datatableConfigServ.configureDataTable();
      const config = {
        ...this.datatableConfigServ.getDefaultConfig(),
        columns: this.getColumns()
      }
      observer.next(config);
      observer.complete();
    });
  }
  //

  // Инициализация DataTable
  private initializeDataTable(config: any): void {
    if (this.datatableRef && this.datatableRef.nativeElement) {
      if (this.datatableRedirectedContainers) {
        this.datatableRedirectedContainers.clear();
        this.datatableRedirectedContainers.rows.add(config.data);
        this.datatableRedirectedContainers.draw();
      }
      else 
      {
        this.datatableRedirectedContainers = new DataTable(this.datatableRef.nativeElement, config);
        this.initializeLinks();
        this.initializeButton();
      }
    }
    else console.error('Таблица не найдена в DOM!');
  }
  //

  // Показать все / Показать за последний месяц
  isShowAllChange(event: Event): void {
    this.isShowAll = (event.target as HTMLInputElement).checked;
    localStorage.setItem('redirectedContainers_isShowAll', JSON.stringify(this.isShowAll));
    this.reloadDatatable(this.isShowAll).subscribe({
      error: () => this.toastr.error('Не удалось обновить таблицу', 'Ошибка')
    });
  }
  //

  // Генерация и получение колонок Datatable
  private getColumns(): any[] {
    const self = this;
    return [
      { className: 'w-14', data: null, orderable: false, render: DataTable.render.select() },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">ID</span><span class="sort-icon"></span></span>`,
        data: 'id',
        visible: false
      },
      {
        className: 'min-w-[175px]',
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container',
        render: function (data) {          
          switch (data.isValidControlDigit) {
            case true:
              return `<a href="#" class="text-sm font-medium text-gray-900 hover:text-primary">${data.number}</a> <i class="ki-filled ki-verify me-1 text-success"></i><div class="tooltip transition-opacity duration-300" id="transition_tooltip">
                Sleek tooltip with opacity transition effect.
               </div>`;
            case false:
              return `${data.number} <i class="ki-filled ki-information me-1 text-warning" data-tooltip="#transition_tooltip"></i><div class="tooltip transition-opacity duration-300" id="transition_tooltip">
                Sleek tooltip with opacity transition effect.
               </div>`;
            default:
              return data.number;
          }
        }
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Тип контейнера</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.typeContainerName'
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
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Дата переадресации</span><span class="sort-icon"></span></span>`,
        data: 'redirectionDate',
        render: function (data) {
          return new Date(data).toLocaleDateString();
        }
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Примечания</span><span class="sort-icon"></span></span>`,
        data: 'comments'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Судовладелец</span><span class="sort-icon"></span></span>`,
        data: 'stock.shipOwnerName'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Место</span><span class="sort-icon"></span></span>`,
        data: 'stock.locationName'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Хранитель</span><span class="sort-icon"></span></span>`,
        data: 'stock.keeperName'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Агент</span><span class="sort-icon"></span></span>`,
        data: 'stock.agentName'
      },
    ];
  }
  //

  //
  //--------------------------------- END MAIN REDIRECTED CONTAINER ---------------------------------//

  // Перезагрузка таблицы
  private reloadDatatable(isShowAll: boolean): Observable<void> {
    return new Observable<void>((observer) => {
      if (this.datatableRedirectedContainers) {
        this.datatableRedirectedContainers.processing(true);

        forkJoin({
          redirectedContainers: isShowAll ? this.redirectedCntrsServ.getAllRedirectedContainers() : this.redirectedCntrsServ.getRedirectedContainersLastMonth()
        })
        .pipe(
          finalize(() => this.datatableRedirectedContainers.processing(false))
        )
        .subscribe({
          next: (results) => {
            this.redirectedContainers = results.redirectedContainers.data;
            this.configDatatable = {
              data: this.redirectedContainers
            }
            console.log(this.redirectedContainers);
            this.initializeDataTable(this.configDatatable);
            observer.next();
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        })
      }
      else {
        observer.next();
        observer.complete();
      }
    });
  }
  //

  

  

  updateSpecialName(event: Event) {
    const selectedTypeDocumentId = (event.target as HTMLSelectElement).value;
    const selectedTypeDocument = this.typeDocuments.find(typeDoc => typeDoc.id.toString() == selectedTypeDocumentId)
    if (selectedTypeDocument && selectedTypeDocument.prefix) {
      this.currentAttachment.specialFileName = this.removeExistingPrefix(this.currentAttachment.specialFileName);
      this.currentAttachment.specialFileName = `${selectedTypeDocument.prefix}-${this.currentAttachment.specialFileName}`;
    }
    else {
      this.currentAttachment.specialFileName = this.removeExistingPrefix(this.currentAttachment.specialFileName);
      this.currentAttachment.typeDocumentId = null;
    }
  }

  removeExistingPrefix(fileName: string): string {
    // Собираем все префиксы из документов
    const prefixes = this.typeDocuments.map(doc => doc.prefix).filter(p => p);
    
    // Создаем регулярное выражение для поиска любого из префиксов
    const regex = new RegExp(`^(${prefixes.join('|')})-`);

    return fileName.replace(regex, ''); // Убираем только известный префикс
  }

  // Инициализация элементов Input в Datatable
  // private initializeFileInputs(): void {
  //   this.datatableRef.nativeElement.addEventListener('change', (event: Event) => {
  //     const target = event.target as HTMLInputElement;

  //     if (target && target.type == 'file') {
  //       const containerId = target.getAttribute('data-containerId');
  //       console.log(containerId);
  //       //this.uploadFiles(containerId, target.files);
  //     }
  //   })
  // }
  //

  selectedSessionContainerId: string | null = null;
  private initializeButton(): void {
    this.datatableRef.nativeElement.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button[data-session-container-id]') as HTMLButtonElement;

      if (button) {
        event.preventDefault();
        this.selectedSessionContainerId = button.getAttribute('data-session-container-id');
        console.log(this.selectedSessionContainerId)
      }
    })
  }

  // Открыть окно выбора файлов
  openFileInput(typeAttachments: AttachmentType): void {
    switch (typeAttachments) {
      case AttachmentType.Image:
        document.getElementById(`image-input-${this.selectedSessionContainerId}`)?.click();
        break;
      case AttachmentType.Document:
        document.getElementById(`document-input-${this.selectedSessionContainerId}`)?.click();
        break;
    }
  }
  //

  // Выбор загружаемых вложений
  handleFileChange(event: Event, typeAttachments: string): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0)
      this.uploadFiles(this.selectedSessionContainerId, target.files, typeAttachments);
  }
  //

  // Загрузка файлов на сервер
  private uploadFiles(sessionContainerId: string, files : FileList, typeAttachments: string): void {
    if(!files || files.length == 0) {
      this.toastr.error('Не выбрано ни одного файла.', 'Ошибка')
      return;
    }

    const formData = new FormData();

    Array.from(files).forEach(file => {formData.append('files', file)});
    
    formData.append('sessionContainerId', sessionContainerId);
    formData.append('typeAttachments', typeAttachments);
    formData.append('guideStatusDocumentId', this.selectedGuideStatusDocumentId.toString());

    this.documentServ.uploadFiles(formData).subscribe({
      next: (result) => {
        console.log(result.data);
        
        result.data.errors.length == 0 ? this.toastr.success(result.description, 'Загрузка файлов') : this.toastr.warning();
        this.updateAttachemntsCount(sessionContainerId)
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err.error, 'Ошибка загрузки файлов');
      },
    });
  }
  //

  // Обновление счетчика количества вложений
  private updateAttachemntsCount(sessionContainerId: string): void {
    this.documentServ.getCountAttachmentsForSessionContainer(sessionContainerId)
    .subscribe({
      next: (result) => {
        console.log(result.data);

        const row = this.redirectedContainers.find(row => row.sessionContainerId.toString() == sessionContainerId);
        if (!row){
          console.warn(`Строка с sessionContainerId: ${sessionContainerId} - не найдена.`);
          return;
        }
    
        const rowIndex = this.redirectedContainers.findIndex(row => row.sessionContainerId.toString() == sessionContainerId);
    
        if (rowIndex == -1) {
          console.warn(`Индекс строк с sessionContainerId: ${sessionContainerId} - не найден.`);
          return;
        }
    
        const columnIndex = this.datatableRedirectedContainers
        .columns()
        .indexes()
        .toArray()
        .find(idx => this.datatableRedirectedContainers.column(idx).dataSrc() == 'sessionContainer.documents.length') // Вычисление индекса колонки
    
        if (columnIndex == undefined) {
          console.warn(`Не удалось вычислить индекс колонки "sessionContainer.documents.length".`);
          return;
        }

        row.sessionContainer.documents.length = result.data;
        const cell = this.datatableRedirectedContainers.cell(rowIndex, columnIndex);
        cell.data(row.sessionContainer.documents.length).draw();
      },
      error: (err) => this.toastr.error(err.error, 'Ошибка подсчета количества вложений')
    })
  }
  //

  attachments: Docs[];
  showDrawer = false;

  private initializeLinks(): void {
    this.datatableRef.nativeElement.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[data-session-container-id]');

      if (link) {
        this.selectedSessionContainerId = link.getAttribute('data-session-container-id');
        this.documentServ.getFilesForSessionContainer(this.selectedSessionContainerId).subscribe({
          next: (result) => {
            this.attachments = result.data;
            const images = result.data.filter(img => img.typeAttachment == AttachmentType.Image);
            const documents = result.data.filter(doc => doc.typeAttachment == AttachmentType.Document);
            
            
            //this.cdRef.detectChanges();

            
            const groupedOnStatusImages = this.groupItemsMap(images);
            const groupedOnStatusDocuments = this.groupItemsMap(documents);

            this.groupedOnStatusImagesArray = Array.from(groupedOnStatusImages.entries()).map(([description, item]) => ({description, item}));
            console.log(this.groupedOnStatusImagesArray.length);
            
            this.groupedOnStatusDocumentsArray = Array.from(groupedOnStatusDocuments.entries()).map(([description, item]) => ({description, item}));
            console.log(this.groupedOnStatusDocumentsArray.length);
          },
          error: (err) => {
            this.toastr.error(err.error, "Ошибка");
          }
        })
      }
    })
  }

  private groupItemsMap(attachments: Docs[]): Map<string, Docs[]> {
    const groupedItems = new Map<string, Docs[]>();

    attachments.forEach(attachment => {
      if (!groupedItems.has(attachment.guideStatusDocument.description))
        groupedItems.set(attachment.guideStatusDocument.description, []);

      groupedItems.get(attachment.guideStatusDocument.description)?.push(attachment);
    });

    console.log(groupedItems);
    
    return groupedItems;
  }

  // Получение иконки по расширениб файла
  getFileIcon(fileName: string): string {
    const extention = fileName.split('.').pop()?.toLowerCase() || '';
    const iconUrls: {[key: string]: string} = {
      'jpg' : 'assets/media/file-types/image.svg'
    }

    return iconUrls[extention] || 'assets/media/file-types/default.svg';
  }
  //

  onUpdateProperties(): void {
    this.documentServ.updateDocumentProperties(this.currentAttachment).subscribe({
      next: (result) => {
        if (result.data == true) this.toastr.success(result.description, "Сохранение");
        else this.toastr.error(result.description, "Сохранение");
      },
      error: (err) => this.toastr.error(err.error, "Сохранение")
    })
  }

  

  currentAttachment: Docs // текущее вложение
  currentImageIndex: number = 0 // индекс текущего изображения
  activeGuideStatusIndex: number; // индекс активной категории вложения

  onSelectAttachment(attachment: Docs, groupIndex: number, attachmentIndex: number): void {
    this.currentAttachment = attachment;
    this.currentImageIndex = attachmentIndex;
    this.activeGuideStatusIndex = groupIndex;
    
    console.log('currentImageIndex: ' + this.currentImageIndex);
    console.log('activeGuideStatusIndex: ' + this.activeGuideStatusIndex);

    switch (this.selectedTab) {
      case 0:
        this.currentImageIndex = attachmentIndex;
        this.onOpenImageViewer(groupIndex, attachmentIndex)
        break;
      case 1:
        break;
    }
  }

  onOpenImageViewer(groupIndex, attachmentIndex): void {
    
    this.isImageViewerOpen = true;
    this.updateCurrentDocument();
  }

  //--------------------------------- IMAGE VIEWER MODAL ---------------------------------//  
  isImageViewerOpen: boolean = false; // Флаг открытия ImageViewer
  currentImageUrl: string; // Url текущего изображения
  currentImage: Docs; // текущее изображение
  isMobileView: boolean = window.innerWidth < 768

  @HostListener('window:resize', ['$event']) onResize(event: Event) {
    this.isMobileView = window.innerWidth <= 768;
  }

  // Открыть Image Viewer
  openImageViewer(image: Docs, groupIndex: number, fileIndex: number): void {
    console.log(fileIndex);
    this.currentImage = image;
    this.isImageViewerOpen = true;
    this.currentImageIndex = fileIndex;
    this.updateCurrentDocument();
  }
  //

  // Закрыть Image Viewer
  closeImageViewer(): void {
    this.isImageViewerOpen = false;
    this.currentImage = null;
    this.currentImageUrl = '';
    this.currentAttachment = null;
  }
  //

  // Загрузка изобраения в Image Viewer
  loadImage(image: Docs): void {
    this.documentServ.getFileUrl(image.uniqueFileName, image.filePath).subscribe({
      next: (result) => this.currentImageUrl = result.url,
      error: (err) => this.toastr.error(err.error, 'Ошибка загрузки изображения')
    });
  }
  //

  // Показать следующее изображение
  showNextImage(): void {    
    if (this.currentImageIndex < this.groupedOnStatusImagesArray[this.activeGuideStatusIndex]?.item.length - 1) {
      this.currentImageIndex++;
    }
    else if (this.activeGuideStatusIndex != this.groupedOnStatusImagesArray.length - 1) {
      this.clickAccordion(this.activeGuideStatusIndex);
      this.activeGuideStatusIndex++;
      this.currentImageIndex = 0;
      this.clickAccordion(this.activeGuideStatusIndex);
    }
    else return;

    this.updateCurrentDocument();
  }
  //

  // Показать предыдущее изображение
  showPreviousImage(): void {

    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
    else if (this.activeGuideStatusIndex != 0){
      this.clickAccordion(this.activeGuideStatusIndex);
      this.activeGuideStatusIndex--;
      this.currentImageIndex = this.groupedOnStatusImagesArray[this.activeGuideStatusIndex]?.item.length - 1;
      this.clickAccordion(this.activeGuideStatusIndex);
    }
    else return;

    this.updateCurrentDocument();
  }
  //

  // Раскрытие нужного аккордеона
  private clickAccordion(index: number): void {
    const toggleButton = document.querySelector(`[data-accordion-toggle="#accordion_content_guide_status_document_images_${index}"]`);
    if (toggleButton) {
      (toggleButton as HTMLElement).click();
    }
  }

  private updateCurrentDocument(): void {
    this.currentAttachment = this.groupedOnStatusImagesArray[this.activeGuideStatusIndex].item[this.currentImageIndex];  
    this.loadImage(this.currentAttachment);
  }
  //

  //
  //--------------------------------- END IMAGE VIEWER MODAL ---------------------------------//

  //--------------------------------- DRAWER ATTACHMENTS ---------------------------------//
  //
  selectedTab: number = 0; // индекс активной вкладки
  
  selectTab(tabIndex: number): void {
    this.selectedTab = tabIndex;
    this.closeImageViewer();
  }

  // Скачать архив
  downloadArchive(): void {
    this.documentServ.downloadArchive(this.documents).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'images.zip';
        link.click();
      },
      error: (err) => this.toastr.error(err, 'Ошибка скачивания архива')
    })
  }
  //

  //
  //--------------------------------- END DRAWER ATTACHMENTS ---------------------------------//

  //--------------------------------- MODAL CONFIRMATION REMOVE ATTACHMENT ---------------------------------//
  //

  selectedAttachmnetId: Guid; // id текущего вложения
  isModalConfirmRemoveOpen: boolean = false; // флаг открытия модального окна подтверждения удаления вложения

  // Открытие модального окна для подтверждения удаления вложения
  openModalConfirmRemove(attachmentId: Guid, isImage: boolean): void {
    this.selectedAttachmnetId = attachmentId
    this.isModalConfirmRemoveOpen = true;
  }
  //

  // Закрытие модального окна 
  closeModalConfirmRemove(): void {
    this.selectedAttachmnetId = null;
    this.isModalConfirmRemoveOpen = false;
  }
  //

  // Подтверждение удаления вложения
  confirmRemove(): void {
    if (!this.selectedAttachmnetId) {
      this.closeModalConfirmRemove();
      return;
    }

    this.documentServ.removeDocument(this.selectedAttachmnetId)
    .subscribe({
      next: (result) => { 
        if (result.data) {
          this.removeAttachmentFromGroups();
          this.updateAttachemntsCount(this.selectedSessionContainerId);

          if (this.isImageViewerOpen) {
            this.showNextImage();
          }

          this.toastr.success(result.description, 'Удаление вложений')
        }
        this.closeModalConfirmRemove();
      },
      error: (err) => this.toastr.error(err.error || 'Неизвестная ошибка', 'Удаление вложений')
    })
  }
  //

  // Удаление вложения из массива
  private removeAttachmentFromGroups(): void {
    const groups = this.selectedTab === 0 ? this.groupedOnStatusImagesArray : this.groupedOnStatusDocumentsArray;

    groups.forEach(group => {
      group.item = group.item.filter(item => item.id != this.selectedAttachmnetId).sort();
      group.isEmpty = group.item.length === 0;
    });
  }
  //

  //
  //--------------------------------- END MODAL CONFIRMATION REMOVE ATTACHMENT ---------------------------------//
}
