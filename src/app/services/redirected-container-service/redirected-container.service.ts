import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { RedirectedContainer } from '../../models/redirected-container';
import { IBaseResponse } from '../../models/baseResponse';
import { catchError, Observable } from 'rxjs';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class RedirectedContainerService {

  constructor(
    private http: HttpClient,
    @Inject(STOCKER_API_URL) private stockerApi: string
  ) { }

  // Отправка запроса на добавление массива переадресованных контейнеов
  addRedirectedContainers(redirectedContainers: RedirectedContainer[], stockId: Guid): Observable<IBaseResponse<RedirectedContainer[]>> {
    const params = { stockId: stockId.toString() };
    return this.http.post<IBaseResponse<RedirectedContainer[]>>(`${this.stockerApi}/api/redirectedcontainers/add-redirected-containers`, redirectedContainers, { params }).pipe(catchError(err => { throw err }))
  }

  getAllRedirectedContainers(): Observable<IBaseResponse<RedirectedContainer[]>> {
    return this.http.get<IBaseResponse<RedirectedContainer[]>>(`${this.stockerApi}/api/redirectedcontainers/get-all-redirected-containers`).pipe(catchError(err => { throw err }))
  }

  getRedirectedContainersLastMonth(): Observable<IBaseResponse<RedirectedContainer[]>> {
    return this.http.get<IBaseResponse<RedirectedContainer[]>>(`${this.stockerApi}/api/redirectedcontainers/get-redirected-containers-last-month`).pipe(catchError(err => { throw err }))
  }
}
