import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { catchError, Observable } from 'rxjs';
import { UploadFilesResult } from '../../models/uploadFilesResult';
import { IBaseResponse } from '../../models/baseResponse';
import { Docs } from '../../models/document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(
    private http: HttpClient,
    @Inject(STOCKER_API_URL) private stokerApi: string
  ) { }

  uploadFiles(formData: FormData): Observable<IBaseResponse<UploadFilesResult>> {
    console.log('test');
    
    return this.http.post<IBaseResponse<UploadFilesResult>>(`${this.stokerApi}/api/document/upload-documents`, formData);
  }

  getFilesForContainer(containerId: string): Observable<IBaseResponse<Docs[]>> {
    const params = { containerId: containerId.toString() } 
    
    return this.http.get<IBaseResponse<Docs[]>>(`${this.stokerApi}/api/document/get-documents-for-container`, {params})
    .pipe(catchError(err => {throw err}));
  }

  getFileUrl(fileName: string, filePath: string): Observable<{ url: string }> {
    const params = {fileName: fileName, filePath: filePath};
    
    return this.http.get<{ url: string }>(`${this.stokerApi}/api/document/get-file-url`, {params})
    .pipe(catchError(err => {throw err}));
  }
}
