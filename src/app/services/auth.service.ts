import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../app-injection-tokens';
import { IBaseResponse } from '../models/baseResponse'
import { Observable, tap, of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IUser } from "../models/user";

export const ACCESS_TOKEN_KEY = 'stocker access token key';
export const CURRENT_USER = 'current user'

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private user: BehaviorSubject<IUser> | undefined;

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stockerApi: string,
    private jwtHelper: JwtHelperService,
    private router: Router) { }

  logIn(email: string, password: string): Observable<IBaseResponse<string>> {
    return this.http.post<IBaseResponse<string>>(`${this.stockerApi}/api/auth/login`, { email, password }).pipe(tap(response => {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data);
    }));
  }

  isAuthenticated(): boolean {
    var token = localStorage.getItem(ACCESS_TOKEN_KEY);

    //console.log(token);
    //console.log(this.jwtHelper.tokenGetter());
    //console.log(this.jwtHelper.isTokenExpired(token));
    return !this.jwtHelper.isTokenExpired(token);
  }

  logOut(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.router.navigate(['auth']);
  }

  // private setAccount(email: string, password: string) {
  //   this.http.get<IBaseResponse>(`${this.stockerApi}/api/user/get-user`, {headers: { email, password } }).pipe(tap(response => this.user?.next(response.data)));
  // }
}
