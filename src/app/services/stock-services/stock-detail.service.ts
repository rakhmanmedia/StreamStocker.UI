import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { IExpectedStock } from '../../models/expected-stock';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class StockDetailService {

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stokerApi: string) { }

  getStockDetail(stockId: Guid): Observable<IBaseResponse<IExpectedStock[]>> {
    return this.http.get<IBaseResponse<IExpectedStock[]>>(`${this.stokerApi}/api/expectedstock/get-expected-stock-bystockid`, { headers: new HttpHeaders({'stockId': stockId.toString()}) });
  }
}
