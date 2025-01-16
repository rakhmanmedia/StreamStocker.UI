import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import DataTable, { Api, Config } from 'datatables.net-dt';
import { forkJoin } from 'rxjs';
import { StockDetailService } from '../../../services/stock-services/stock-detail.service';
import { ExpectedStock } from '../../../models/expected-stock';
import 'datatables.net-fixedheader';
import { Guid } from 'guid-typescript';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-deleted-containers',
  templateUrl: './deleted-containers.component.html',
  styleUrl: './deleted-containers.component.css'
})
export class DeletedContainersComponent implements OnInit {

  @ViewChild('datatableDeletedContainers') datatableRef: ElementRef

  readonly title: string;
  readonly subTitle: string;

  deletedContainers: ExpectedStock[];
  datatableDeletedContainers: Api<any>;

  constructor(private stockDetailServ: StockDetailService, private toastr: ToastrService) {
    this.title = "Удаленные контейнеры";
    this.subTitle = "Список контейнеров с отметкой на удаление";
  }

  // Инициализация компонента
  ngOnInit(): void {
    DataTable.ext.classes.length.select = 'select select-sm w-16';
    DataTable.ext.classes.paging.container = 'pagination';
    DataTable.ext.classes.paging.button = 'btn';
    DataTable.ext.classes.paging.active = 'active disabled';
    DataTable.ext.classes.table = 'table table-auto table-border align-middle text-gray-700 font-medium text-sm';
    DataTable.ext.classes.layout.tableRow = 'scrollable-x-auto';
    DataTable.select.classes.checkbox = 'checkbox';

    this.loadData();
  }
  //

  // Загрузка данных
  private loadData(): void {
    forkJoin({
      deletedContainers: this.stockDetailServ.getMarkedToDeletContainers()
    })
    .subscribe({
      next: (results) => {
        this.deletedContainers = results.deletedContainers.data;
        console.log(this.deletedContainers);

        this.initializeDataTable(this.deletedContainers);
      },
      error: () => {},
      complete: () => {}
    })
  }
  //

  // Инициализация DataTable
  private initializeDataTable(data: any[]): void {
    const configDataTable: Config = {

      processing: true,
      stateSave: true,

      drawCallback: () => {
        $('.dt-search label').append(document.querySelector('.dt-input')).addClass('input input-sm');
        $('.dt-search').removeClass('dt-search');
      },

      data: data,

      columns: [
        { className: 'w-14',data: null, orderable: false, render: DataTable.render.select() },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sort-icon"></span></span>`,
          data: 'id', 
          visible: false 
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sort-icon"></span></span>`,
          data: 'container.number' 
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Тип контейнера</span><span class="sort-icon"></span></span>`,
          data: 'container.typeContainer.name' 
        },     
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
            return new Date(data).toLocaleDateString();
          }
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Дата удаления</span><span class="sort-icon"></span></span>`,
          data: 'container.currentState.datestamp', render: function(data) {
            const date = new Date(data);
            return date.toLocaleDateString();
          }
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Судовладелец</span><span class="sort-icon"></span></span>`,
          data: 'stock.shipOwner.name' 
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Место</span><span class="sort-icon"></span></span>`,
          data: 'stock.location.name' 
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Хранитель</span><span class="sort-icon"></span></span>`,
          data: 'stock.keeper.name' 
        },
        { 
          title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Агент</span><span class="sort-icon"></span></span>`,
          data: 'stock.agent.name' 
        },
      ],

      columnDefs: [
        { className: 'text-gray-800 font-normal', targets: [1, 2, 3, 5, 6, 7, 8, 9, 10] },
      ],

      select: {
        info: false,
        items: 'row',
        style: 'multi',
        selector: 'td:first-child',
      },

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
    };

    if (this.datatableRef && this.datatableRef.nativeElement) {
      if (this.datatableDeletedContainers) {
        this.datatableDeletedContainers.clear();
        this.datatableDeletedContainers.rows.add(data);
        this.datatableDeletedContainers.draw();
      }
      else this.datatableDeletedContainers = new DataTable(this.datatableRef.nativeElement, configDataTable);
    }
    else console.error('Таблица не найдена в DOM!');
  }
  //

  onRestoreData():void {
    const selectedRowsId: Guid[] = this.datatableDeletedContainers.rows({selected: true}).data().toArray().map((row: ExpectedStock) => row.container.id);

    if (selectedRowsId.length == 0)
      {
        this.toastr.warning('Не выбрано ни одной записи.', 'Внимание')
        return;
      }

    this.stockDetailServ.restoreData(selectedRowsId).subscribe({
      next: (resp) => { 
        if (resp.data)
          {
            this.loadData();
            this.toastr.success('Записи успешно восстановлены.', 'Удаление');
          }
      },
      error: (err) => { this.toastr.error(err.error.description, 'Ошибка'); },
    })
  }
}
