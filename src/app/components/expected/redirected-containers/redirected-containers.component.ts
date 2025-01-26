import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import DataTable from 'datatables.net';
import { delay, finalize, forkJoin, Observable } from 'rxjs';
import { DatatableConfigService } from '../../../services/datatable-config-services/datatable-config.service';
import { RedirectedContainerService } from '../../../services/redirected-container-service/redirected-container.service';
import { RedirectedContainer } from '../../../models/redirected-container';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-redirected-containers',
  templateUrl: './redirected-containers.component.html',
  styleUrl: './redirected-containers.component.css'
})
export class RedirectedContainersComponent implements OnInit {
  @ViewChild('datatableRedirectedContainers') datatableRef: ElementRef

  readonly title: string;
  readonly subTitle: string;

  redirectedContainers: RedirectedContainer[];
  datatableRedirectedContainers: any;
  isLoading: boolean = false; // Флаг загрузки данных
  isError: boolean = false; // Флаг ошибок
  //isShowAll: boolean = false // Флаг "Показать все записи"
  configDatatable: any; // Конфигурация для Datatable

  constructor(
    private toastr: ToastrService,
    private redirectedCntrsServ: RedirectedContainerService,
    private datatableConfigServ: DatatableConfigService,
    private cdRef: ChangeDetectorRef
  ) {
    this.title = "Переадресованные";
    this.subTitle = "Список переадресованных контейнеров";
  }

  // Инициализация компонента
  ngOnInit(): void {
    this.datatableConfigServ.configureDataTable();
    this.isLoading = true;

    forkJoin({
      config: this.initializeDataTableConfig(),
      redirectedContainersData: this.redirectedCntrsServ.getRedirectedContainersLastMonth()
    })
    .subscribe({
      next: ({config, redirectedContainersData}) => {
        this.redirectedContainers = redirectedContainersData.data

        config = {
          ...this.datatableConfigServ.getDefaultConfig(),
          columns: this.getColumns(),
          data: this.redirectedContainers
        }

        this.configDatatable = config;

        this.isLoading = false;
        this.cdRef.detectChanges();
        this.initializeDataTable(config);
      }
    })
  }
  //

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
            this.initializeDataTable(this.configDatatable);
            observer.next();
            observer.complete();
          },
          error: (err) => {
            this.toastr.error(err.error.description, 'Ошибка загрузки');
            observer.error();
          }
        })
      }
      else {
        observer.next();
        observer.complete();
      }
    });
  }

  // Показать все / Показать за последний месяц
  isShowAllChange(event: Event): void {
    const check = (event.target as HTMLInputElement)
    this.reloadDatatable(check.checked).subscribe({
      error: () => this.toastr.error('Не удалось обновить таблицу', 'Ошибка')
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
      else this.datatableRedirectedContainers = new DataTable(this.datatableRef.nativeElement, config);
    }
    else console.error('Таблица не найдена в DOM!');
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

  // Генерация и получение колонок Datatable
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
        data: 'container',
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
        data: 'container.typeContainer.name'
      },
      {
        title: `<span class="sort"><span class="sort-label font-normal text-gray-700">Состояние</span><span class="sort-icon"></span></span>`,
        data: 'container.currentState.stateContainerDescription',
        render: function (data) {
          switch (data) {
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
    ];
  }
}
