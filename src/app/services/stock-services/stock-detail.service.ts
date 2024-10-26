import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { IExpectedStock } from '../../models/expected-stock';

@Injectable({
  providedIn: 'root'
})
export class StockDetailService {

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stokerApi: string) { }

  getStockDetail(): Observable<IBaseResponse<IExpectedStock[]>> {
    return this.http.get<IBaseResponse<IExpectedStock[]>>(`${this.stokerApi}/api/expectedstock/get-all-expected-stocks`)
  }
}
