import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { catchError, Observable } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { GuideStatusDocument } from '../../models/guide-status-document';

@Injectable({
  providedIn: 'root'
})
export class GuideStatusDocumnetService {

  constructor(
    private http: HttpClient,
    @Inject(STOCKER_API_URL) private stockerApi: string
  ) { }

  getAllGuideStatusDocuments(): Observable<IBaseResponse<GuideStatusDocument[]>> {
    return this.http.get<IBaseResponse<GuideStatusDocument[]>>(`${this.stockerApi}/api/guidestatusdocument/get-all-guide-status-doucments`)
    .pipe(catchError(err => {throw err}));
  }
}
