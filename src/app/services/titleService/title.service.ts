import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {

  constructor() { }

  private title: BehaviorSubject<string> = new BehaviorSubject('Dashboard');

  getTitle(): Observable<string> {
    return this.title;
  }

  setTitle(title:string){
    this.title.next(title);
  }
}
