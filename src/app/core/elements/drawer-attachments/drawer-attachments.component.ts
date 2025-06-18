import { AfterViewChecked, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Docs } from '../../../models/document';
import { AttachmentType } from '../../../models/attachment-type.enum';
import { DocumentService } from '../../../services/document-services/document.service';
import { ToastrService } from 'ngx-toastr';
import { MetronicService } from '../../../services/metronic-services/metronic.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-drawer-attachments',
  templateUrl: './drawer-attachments.component.html',
  styleUrl: './drawer-attachments.component.css'
})
export class DrawerAttachmentsComponent implements OnChanges, AfterViewChecked {
  
  constructor (
    private documentServ: DocumentService,
    private toastr: ToastrService,
    private metronicServ: MetronicService
  ) {}

  @Input() id: string = '';
  @Input() attachments: Docs[] | null = null;
  @HostBinding('attr.data-drawer') dataDrawer = 'true';
  @Output() closed = new EventEmitter<void>();
  @ViewChild('ktaccordion') accordionRef!: ElementRef; // ссылка на DOM-элемент ktaccordion
  @ViewChild('kttabs') tabsRef!: ElementRef; // ссылка на DOM-элемент kttabs

  selectedTab: number = 0; // индекс активной вкладки
  currentAttachment: Docs // текущее вложение
  currentImageIndex: number = 0 // индекс текущего изображения
  activeGuideStatusIndex: number; // индекс активной категории вложения
  isImageViewerOpen: boolean = false;
  currentImageUrl: string;
  groupedOnStatusImagesArray: any[];
  groupedOnStatusDocumentsArray: any[];
  private isAccordionInitialized: boolean = false; // флаг инициализации компонента KTAccordion
  private isTabsInitialized: boolean = false; // флаг инициализации компонента KTTabs

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attachments'] && this.attachments?.length) {
      const images = this.attachments.filter(img => img.typeAttachment == AttachmentType.Image);
      const documents = this.attachments.filter(doc => doc.typeAttachment == AttachmentType.Document);

      const groupedOnStatusImages = this.groupItemsMap(images);
      const groupedOnStatusDocuments = this.groupItemsMap(documents);

      this.groupedOnStatusImagesArray = Array.from(groupedOnStatusImages.entries()).map(([description, item]) => ({ description, item }));
      this.groupedOnStatusDocumentsArray = Array.from(groupedOnStatusDocuments.entries()).map(([description, item]) => ({ description, item }));
    }
  }

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

  close(): void {
    this.closed.emit();
  }

  selectTab(tabIndex: number): void {
    this.selectedTab = tabIndex;
    this.closeImageViewer();
  }

  private groupItemsMap(attachments: Docs[]): Map<string, Docs[]> {
    const groupedItems = new Map<string, Docs[]>();

    attachments.forEach(attachment => {
      if (!groupedItems.has(attachment.guideStatusDocument.description))
        groupedItems.set(attachment.guideStatusDocument.description, []);

      groupedItems.get(attachment.guideStatusDocument.description)?.push(attachment);
    });

    return groupedItems;
  }

  onSelectAttachment(attachment: Docs, groupIndex: number, attachmentIndex: number): void {
    this.currentAttachment = attachment;
    this.currentImageIndex = attachmentIndex;
    this.activeGuideStatusIndex = groupIndex;

    switch (this.selectedTab) {
      case 0:
        this.currentImageIndex = attachmentIndex;
        this.onOpenImageViewer()
        break;
      case 1:
        break;
    }
  }

  onOpenImageViewer(): void {
    this.isImageViewerOpen = true;
    this.updateCurrentDocument();
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

  //--------------------------------- IMAGE VIEWER MODAL ---------------------------------//  
  //
  
    currentImage: Docs; // текущее изображение
    isMobileView: boolean = window.innerWidth < 768
  
    @HostListener('window:resize', ['$event']) onResize(event: Event) {
      this.isMobileView = window.innerWidth <= 768;
    }
  
    // Открыть Image Viewer
    openImageViewer(image: Docs, groupIndex: number, fileIndex: number): void {
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
    //
  
    private updateCurrentDocument(): void {
      this.currentAttachment = this.groupedOnStatusImagesArray[this.activeGuideStatusIndex].item[this.currentImageIndex];  
      this.loadImage(this.currentAttachment);
    }
    //
  
    //
    //--------------------------------- END IMAGE VIEWER MODAL ---------------------------------//

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
              //this.updateAttachemntsCount(this.selectedSessionContainerId);
    
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
