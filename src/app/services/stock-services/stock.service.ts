import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL, STOCKER_AUTH_HEADER_OPT } from '../../app-injection-tokens';
import { Observable, tap } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { ACCESS_TOKEN_KEY } from '../auth.service';
import { Guid } from 'guid-typescript';
import { IStock } from '../../models/stock';
import { CountContainers } from '../../models/countContainers';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stokerApi: string,
    @Inject(STOCKER_AUTH_HEADER_OPT) private stokerAuthHeaderOpt: {}
  ) { }

  getStock(id: Guid): Observable<IBaseResponse<IStock>> {
    return this.http.get<IBaseResponse<IStock>>(`${this.stokerApi}/api/stock/get-stock`, { headers: new HttpHeaders({'id': id.toString()}) });
  }

  getStocks(): Observable<IBaseResponse<IStock[]>> {

    const headersOption =  { headers: new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_KEY) }) }

    return this.http.get<IBaseResponse<IStock[]>>(`${this.stokerApi}/api/stock/get-all-stocks`, this.stokerAuthHeaderOpt);
  }

  getCountContainers(stockId: Guid): Observable<IBaseResponse<CountContainers>> {
    return this.http.get<IBaseResponse<CountContainers>>(`${this.stokerApi}/api/expectedstock/get-count-container`, { headers: new HttpHeaders({'stockId': stockId.toString()}) });
  }
}
