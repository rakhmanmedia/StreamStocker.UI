import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StockDetailService } from '../../services/stock-services/stock-detail.service';
import { IExpectedStock } from '../../models/expected-stock';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-expected-stock-detail',
  templateUrl: './expected-stock-detail.component.html',
  styleUrl: './expected-stock-detail.component.css'
})
export class ExpectedStockDetailComponent implements OnInit, AfterViewInit {

  expectedStocks: IExpectedStock[] = [];
  dataTableOptions: Config = {};
  dataTableTrigger: Subject<any> = new Subject();

  constructor(private stockDetailServ: StockDetailService) {
  }

  ngAfterViewInit(): void {
    this.dataTableTrigger.next(null);
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  // Loading Expected Stocks
  private OnLoad(): void {

    this.dataTableOptions = {
      processing: true,
      pagingType: 'simple_numbers',
      pageLength: 3,
      stateSave: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.stockDetailServ.getStockDetail().subscribe(resp => {
          this.expectedStocks = resp.data;
          callback({
            data: resp.data
          });
        })
      },

      columns: [
        { data: 'id', },
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
          data: 'status', render: function (data) {
            if (data == 0)
              return `<span class="badge badge-sm">WAIM</span>`
            else return `<span class="badge badge-sm">WAIL</span>`
          }
        },
        {
          render: function () {
            return `<a class="btn btn-sm btn-icon btn-clear btn-light" href="#"><i class="ki-outline ki-notepad-edit"></i></a>`
          }
        },
        {
          render: function () {
            return `<a class="btn btn-sm btn-icon btn-clear btn-light" href="#"><i class="ki-outline ki-trash"></i></a>`
          }
        }
      ],

      columnDefs: [
        { className: 'text-gray-800 font-normal', targets: [0, 1, 2, 3, 4] },
        { className: 'text-center', targets: [5, 6]},
        { visible: false, targets: [0] }
      ],

      layout: {
        topStart: 'info',
        bottomStart: { pageLength: { menu: [5, 10, 25, 50] } },
      },

      language: {
        info: '<h3 class="card-title font-medium text-sm">Показано _END_ из _TOTAL_ записей</h3>',
        infoFiltered: '',
        lengthMenu: '<div class="flex items-center gap-2 order-2 md:order-1">Показать _MENU_ на странице</div>',
        paginate: {
          next: '<i class="ki-outline ki-black-right"></i>',
          previous: '<i class="ki-outline ki-black-left"></i>',
        },
        search: '',
        searchPlaceholder: 'Поиск',
      },

      initComplete: function () {
        $('#datatable_1').removeClass('align-middle text-gray-700 font-medium text-sm dataTable');
        $('.dt-layout-row:first-of-type').addClass('card-header flex-wrap gap-2');
        $('.dt-layout-row:last-of-type').addClass('card-footer justify-center md:justify-between flex-col md:flex-row gap-5 text-gray-600 text-2sm font-medium');
        $('#dt-length-0').addClass('select select-sm w-16').removeClass('dt-input');
        $('.dt-paging paging_simple_numbers').addClass('pagination').removeClass('dt-paging paging_simple_numbers');
      }
    }
  }
}
