import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { ExpectedStock } from '../../models/expected-stock';
import { Guid } from 'guid-typescript';
import { ImportContainerResult } from '../../models/importContainerResult';
import { Container } from '../../models/container';
import { ExpectedContainer } from '../../models/expected-container-read';
import { ExpectedContainerCreate } from '../../models/expected-container-create';

@Injectable({
  providedIn: 'root'
})
export class StockDetailService {

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stokerApi: string) { }

  getAllExpectedContainersByStockId(stockId: Guid): Observable<IBaseResponse<ExpectedContainer[]>> {
    return this.http.get<IBaseResponse<ExpectedContainer[]>>(`${this.stokerApi}/api/expectedcontainer/get-all-expected-containers-by-stockid`, { headers: new HttpHeaders({'stockId': stockId.toString()}) })
    .pipe(catchError(err => { throw err; })); 
  }

  addExpectedContainer(createExpectedContainer: ExpectedContainerCreate, state:string): Observable<IBaseResponse<boolean>> {
    const params = { state: state };
    
    return this.http.post<IBaseResponse<boolean>>(`${this.stokerApi}/api/expectedcontainer/add-expected-container`, createExpectedContainer, { params })
    .pipe(catchError(err => { 
      if (err.status == 0) 
        return throwError(() => new Error('Сервер недоступен. Проверьте соединение.'));
      
      return throwError(() => err);
    }));    
  }

  // Отправка запроса на сервер пометить на удаление
  markToDelete(guids: Guid[]): Observable<IBaseResponse<boolean>> {
    return this.http.post<IBaseResponse<boolean>>(`${this.stokerApi}/api/expectedcontainer/mark-to-delete`, guids)
    .pipe(catchError(err => { throw err }));
  }

  // Восстановление контейнеров с пометкой на удаление
  restoreData(guids: Guid[], stockId: Guid, stateContaner: any): Observable<IBaseResponse<boolean>> {
    const params: any = { };
    if (stockId != null)
      params.stockId = stockId.toString();
    if (stateContaner != null)
      params.stateContaner = stateContaner;

    return this.http.post<IBaseResponse<boolean>>(`${this.stokerApi}/api/expectedcontainer/restore-data`, guids, { params })
    .pipe(catchError(err => {
      if (err.status == 404) 
        return throwError(() => new Error("Страница не найдена."));
      else return throwError(() => err);
      }));
  }

  // Получение списка контейнеров с пометкой на удаление
  getMarkedToDeletContainers(): Observable<IBaseResponse<ExpectedStock[]>> {
    return this.http.get<IBaseResponse<ExpectedStock[]>>(`${this.stokerApi}/api/expectedcontainer/get-deleted-containers`)
    .pipe(catchError(err => { throw err }));
  }

  // Проверка импортируемых данных из файла
  checkImportData(formData: FormData): Observable<IBaseResponse<ImportContainerResult>> {
    return this.http.post<IBaseResponse<ImportContainerResult>>(`${this.stokerApi}/api/expectedcontainer/check-import-data`, formData)
    .pipe(catchError(err => { throw err }));;
  }























  

  

  

  // Вызов сервиса импорта данных
  importData(importData: Container[], stockId: Guid, stateContainer: string): Observable<IBaseResponse<boolean>> {
    console.log(importData);
    console.log(stockId);
    const params = { stockId: stockId.toString(), stateContainer: stateContainer };
    console.log(params);
    const test: string = 'test';
    return this.http.post<IBaseResponse<boolean>>(`${this.stokerApi}/api/expectedcontainer/import-data`, importData, { params });
  }

  

  // Переадресация контейнеров
  redirect(guids: Guid[]): Observable<IBaseResponse<boolean>> {
    return this.http.post<IBaseResponse<boolean>>(`${this.stokerApi}/api/expectedstock/redirect`, guids)
    .pipe(catchError(err => {throw err}));
  }
}
