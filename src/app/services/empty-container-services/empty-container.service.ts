import { Inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { EmptyContainerRead } from '../../models/empty-container-read';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { EmptyContainerCreate } from '../../models/empty-container-create';
import { Guid } from 'guid-typescript';
import { EmptyContainerUpdate } from '../../models/empty-container-update';

@Injectable({
  providedIn: 'root'
})
export class EmptyContainerService {

  constructor(
    private http: HttpClient,
    @Inject(STOCKER_API_URL) private stokerApi: string
  ) { }

  addEmptyContainers(emptyContainers: EmptyContainerCreate[]): Observable<IBaseResponse<EmptyContainerRead[]>> {
    return this.http.post<IBaseResponse<EmptyContainerRead[]>>(`${this.stokerApi}/api/emptycontainer/add-empty-container`, emptyContainers)
      .pipe(catchError(err => { throw err }))
  }

  getAllEmptyContainersByStockId(stockId: Guid): Observable<IBaseResponse<EmptyContainerRead[]>> {
    return this.http.get<IBaseResponse<EmptyContainerRead[]>>(`${this.stokerApi}/api/emptycontainer/get-all-empty-containers-by-stockid`, { headers: new HttpHeaders({ 'stockId': stockId.toString() }) })
      .pipe(catchError(err => { throw err; }));
  }

  getEmptyContainer(id: string): Observable<IBaseResponse<EmptyContainerRead>> {
    return this.http.get<IBaseResponse<EmptyContainerRead>>(`${this.stokerApi}/api/emptycontainer/get-empty-container/${id}`)
      .pipe(catchError(err => { throw err; }));
  }

  updateEmptyContainer(updateEmptyContainer: EmptyContainerUpdate): Observable<IBaseResponse<boolean>> { 
    return this.http.put<IBaseResponse<boolean>>(`${this.stokerApi}/api/emptycontainer/update-empty-container`, updateEmptyContainer)
    .pipe(catchError(err => { throw err; }))
  }
}
