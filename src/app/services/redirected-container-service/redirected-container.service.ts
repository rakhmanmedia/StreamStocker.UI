import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { RedirectedContainer } from '../../models/redirected-container';
import { IBaseResponse } from '../../models/baseResponse';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RedirectedContainerService {

  constructor(
    private http: HttpClient,
    @Inject(STOCKER_API_URL) private stockerApi: string
  ) { }

  // Отправка запроса на добавление массива переадресованных контейнеров
  addRedirectedContainers(redirectedContainers: RedirectedContainer[]): Observable<IBaseResponse<RedirectedContainer[]>> {
    return this.http.post<IBaseResponse<RedirectedContainer[]>>(`${this.stockerApi}/api/redirectedcontainers/add-redirected-containers`, redirectedContainers)
    .pipe(catchError(err => { throw err }))
  }


  // Отправка запроса на получение всех переадресованных контейнеров
  getAllRedirectedContainers(): Observable<IBaseResponse<RedirectedContainer[]>> {
    return this.http.get<IBaseResponse<RedirectedContainer[]>>(`${this.stockerApi}/api/redirectedcontainers/get-all-redirected-containers`)
    .pipe(catchError(err => { throw err }))
  }

  // Отправка запроса на получение переадресованных контейнеров за последний месяц
  getRedirectedContainersLastMonth(): Observable<IBaseResponse<RedirectedContainer[]>> {
    return this.http.get<IBaseResponse<RedirectedContainer[]>>(`${this.stockerApi}/api/redirectedcontainers/get-redirected-containers-last-month`)
    .pipe(catchError(err => { throw err }))
  }
}
