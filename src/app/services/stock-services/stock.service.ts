import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL, STOCKER_AUTH_HEADER_OPT } from '../../app-injection-tokens';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { ACCESS_TOKEN_KEY } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stokerApi: string,
    @Inject(STOCKER_AUTH_HEADER_OPT) private stokerAuthHeaderOpt: {}
  ) { }

  getStocks(): Observable<IBaseResponse> {

    const headersOption =  { headers: new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_KEY) }) }

    console.log(this.stokerAuthHeaderOpt)

    return this.http.get<IBaseResponse>(`${this.stokerApi}/api/stock/get-stocks`, headersOption);
  }
}
