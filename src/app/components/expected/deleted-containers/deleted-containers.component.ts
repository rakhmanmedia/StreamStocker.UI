import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import DataTable, { Api, Config } from 'datatables.net-dt';
import { forkJoin } from 'rxjs';
import { StockDetailService } from '../../../services/stock-services/stock-detail.service';
import { ExpectedStock } from '../../../models/expected-stock';
import 'datatables.net-fixedheader';
import { Guid } from 'guid-typescript';
import { ToastrService } from 'ngx-toastr';
import { DatatableConfigService } from '../../../services/datatable-config-services/datatable-config.service';
import { StateContainerEnum } from '../../../models/state-container-enum';

@Component({
  selector: 'app-deleted-containers',
  templateUrl: './deleted-containers.component.html',
  styleUrl: './deleted-containers.component.css'
})
export class DeletedContainersComponent implements OnInit {

  @ViewChild('datatableDeletedContainers') datatableRef: ElementRef

  deletedContainers: ExpectedStock[];
  datatableDeletedContainers: Api<any>;
  isLoading: boolean = false;
  isError: boolean = false;

  constructor(
    private stockDetailServ: StockDetailService, 
    private datatableConfigServ: DatatableConfigService,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef
  ) { }

  // Инициализация компонента
  ngOnInit(): void {
    this.datatableConfigServ.configureDataTable();
    this.loadData();
  }
  //

  // Загрузка данных
  private loadData(): void {
    this.isLoading = true;
    this.isError = false;
    this.datatableConfigServ.configureDataTable();

    forkJoin({
      deletedContainers: this.stockDetailServ.getMarkedToDeletContainers()
    })
    .subscribe({
      next: (results) => {
        this.deletedContainers = results.deletedContainers.data;
        const config = {
          ...this.datatableConfigServ.getDefaultConfig(),
          data: this.deletedContainers,
          columns: this.getColumns()
        };
        this.isLoading = false;
        this.cdRef.detectChanges();
        this.initializeDataTable(config);
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.toastr.error(err.error, "Ошибка загрузки");
      }
    })
  }
  //

  // Формирование колонок Datatable
  private getColumns(): any[] {
    return [
      { className: 'w-14', data: null, orderable: false, render: DataTable.render.select() },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sort-icon"></span></span>`,
        data: 'id',
        visible: false
      },
      {
        className: 'min-w-[250px]',
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Контейнер</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.number',
        render: function (data: any) {
          return `${data}`
        }
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Тип контейнера</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.container.typeContainerName'
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
          return new Date(data).toLocaleDateString();
        }
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Дата удаления</span><span class="sort-icon"></span></span>`,
        data: 'sessionContainer.currentSessionContainerState.datestamp', 
        render: function (data: any) {
          const date = new Date(data);
          return date.toLocaleDateString();
        }
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

  // Инициализация DataTable
  private initializeDataTable(config: any): void {
    if (this.datatableRef && this.datatableRef.nativeElement) {
      if (this.datatableDeletedContainers) {
        this.datatableDeletedContainers.clear();
        this.datatableDeletedContainers.rows.add(config.data);
        this.datatableDeletedContainers.draw();
      }
      else this.datatableDeletedContainers = new DataTable(this.datatableRef.nativeElement, config);
    }
    else console.error('Таблица не найдена в DOM!');
  };
  //

  // Восстановление данных
  onRestoreData(): void {
    const selectedRowsId: Guid[] = this.datatableDeletedContainers.rows({ selected: true }).data().toArray().map((row: ExpectedStock) => row.sessionContainer.id);
    console.log(selectedRowsId);
    if (selectedRowsId.length == 0) {
      this.toastr.warning('Не выбрано ни одной записи.', 'Внимание')
      return;
    }

    this.stockDetailServ.restoreData(selectedRowsId, null, null).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.loadData();
          this.toastr.success(resp.description, 'Восстановление');
        }
      },
      error: (err) => { console.error(err); this.toastr.error(err.error, 'Ошибка восстановления'); },
    })
  }
  //
}
