import { Component, OnInit } from '@angular/core';
import { StockDetailService } from '../../services/stock-services/stock-detail.service';
import { IExpectedStock } from '../../models/expected-stock';
import { ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import DataTable, { Api } from 'datatables.net-dt';
import 'datatables.net-select';
import 'datatables.net-colreorder-dt';
import { StockService } from '../../services/stock-services/stock.service';
import { IStock } from '../../models/stock';

@Component({
  selector: 'app-expected-stock-detail',
  templateUrl: './expected-stock-detail.component.html',
  styleUrl: './expected-stock-detail.component.css'
})
export class ExpectedStockDetailComponent implements OnInit {

  expectedStocks: IExpectedStock[] = [];
  currentStock: IStock;
  private id: Guid;
  loadedCount: number = 0;
  emptyCount: number = 0;

  datatable: Api<any>;

  constructor(private stockDetailServ: StockDetailService, private stockServ: StockService, activateRoute: ActivatedRoute) {
    this.id = activateRoute.snapshot.params['id'];
  }

  ngOnInit(): void {

    // loading current stock data
    console.log(this.id);
    this.stockServ.getStock(this.id).subscribe(async resp => { console.log(resp.data); this.currentStock = await resp.data; console.log(this.currentStock) });
    console.log(this.currentStock);
    

    DataTable.ext.classes.length.select = 'select select-sm w-16';
    DataTable.ext.classes.paging.container = 'pagination';
    DataTable.ext.classes.paging.button = 'btn';
    DataTable.ext.classes.paging.active = 'active disabled';
    DataTable.ext.classes.table = 'table table-auto table-border align-middle text-gray-700 font-medium text-sm';
    DataTable.ext.classes.layout.tableRow = 'scrollable-x-auto';

    this.OnLoad();
  }

  // Loading Expected Stocks
  private OnLoad(): void {

    

    this.datatable = new DataTable('#datatable_1', {
      processing: true,
      stateSave: true,
      pageLength: 10,

      colReorder: {
        columns: [4, 5]
      },

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
          data: 'state', render: function (data) {
            if (data == 0)
              return `<span class="badge badge-danger badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-danger me-1.5"></span>Порожний</span>`
            else return `<span class="badge badge-success badge-outline rounded-[30px]"><span class="size-1.5 rounded-full badge-success me-1.5"></span>Груженый</span>`
          }
        },
        {
          data: 'applicationDate', render: function (data) {
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
        {
          data: null,
          className: 'text-center',
          render: function () {
            return `<a class="btn btn-sm btn-icon btn-clear btn-light" href="#"><i class="ki-outline ki-notepad-edit"></i></a>`
          }
        },
        {
          data: null,
          className: 'text-center',
          render: function () {
            return `<a class="btn btn-sm btn-icon btn-clear btn-light" href="#"><i class="ki-outline ki-trash"></i></a>`
          }
        }
      ],

      select: {
        info: false,
        items: 'row',
        style: 'multi',
        selector: 'td:first-child',
      },

      columnDefs: [
        
        { className: 'text-gray-800 font-normal', targets: [1, 2, 3, 4, 5] },
      ],

      layout: {
        topStart: null,
        topEnd: null,
        bottomStart: null,
        bottomEnd: null,

        top: {
          className: 'card-header flex-wrap gap-2',
          features: {
            info: { text: '<h3 class="card-title font-medium text-sm">Показано _END_ из _TOTAL_ записей</h3>' },
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

      initComplete: function () {
        $('.dt-search label').append(document.querySelector('.dt-input')).addClass('input input-sm');
        $('.dt-search').removeClass('dt-search');
      },

      // loading data
      ajax: (dataTablesParameters: any, callback) => {
        setTimeout(() => {
          this.stockDetailServ.getStockDetail(this.id).subscribe(resp => {
            this.expectedStocks = resp.data;
            this.loadedCount = resp.data.filter(el => el.state == 1 && el.stockId == this.id).length;
            this.emptyCount = resp.data.filter(el => el.state == 0 && el.stockId == this.id).length;
            callback({
              data: resp.data,
            });
          })
        }, 1500);
        
      },
    });
  }

  // autofilter in column
  filterOnColumn(object: any): void {      
    this.datatable.column(object.getAttribute('data-index')).search(object.value).draw();
  }
}
