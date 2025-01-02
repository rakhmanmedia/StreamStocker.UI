import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { ExpectedStock } from '../../models/expected-stock';
import { Guid } from 'guid-typescript';
import { ImportContainerResult } from '../../models/importContainerResult';
import { Container } from '../../models/container';

@Injectable({
  providedIn: 'root'
})
export class StockDetailService {

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stokerApi: string) { }

  getStockDetail(stockId: Guid): Observable<IBaseResponse<ExpectedStock[]>> {
    return this.http.get<IBaseResponse<ExpectedStock[]>>(`${this.stokerApi}/api/expectedstock/get-expected-stock-bystockid`, { headers: new HttpHeaders({'stockId': stockId.toString()}) });
  }

  addContainerToStock(expectedStockDetail: ExpectedStock): Observable<IBaseResponse<boolean>> {
    return this.http.post<IBaseResponse<boolean>>(`${this.stokerApi}/api/expectedstock/add-stock`, expectedStockDetail);    
  }

  // Отправка запроса на сервер пометить на удаление
  markToDelete(guids: Guid[]): Observable<IBaseResponse<boolean>> {
    return this.http.post<IBaseResponse<boolean>>(`${this.stokerApi}/api/expectedstock/mark-to-delete`, guids).pipe(catchError(err => { throw err }));
  }

  checkImportData(formData: FormData): Observable<IBaseResponse<ImportContainerResult>> {
    return this.http.post<IBaseResponse<ImportContainerResult>>(`${this.stokerApi}/api/expectedstock/check-import-data`, formData);
  }

  // Вызов сервиса импорта данных
  importData(importData: Container[], stockId: Guid, isLoadedCntr: boolean): Observable<boolean> {
    const params = { stockId: stockId.toString(), isLoadedCntr: isLoadedCntr.toString() };
    console.log(params);
    return this.http.post<boolean>(
        `${this.stokerApi}/api/expectedstock/import-data`,
        importData,
        { params }
    );
  }
}
