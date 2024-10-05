import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../app-injection-tokens';
import { BaseResponse } from '../models/baseResponse'
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const ACCESS_TOKEN_KEY = 'stocker access token key';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient, 
    @Inject(STOCKER_API_URL) private stockerApi: string,
    private jwtHelper: JwtHelperService,
    private router: Router
    ) { }

  logIn(email: string, password: string): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.stockerApi}/api/auth/login`, { email, password }).pipe(tap(response => {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data)
    }));
  }

  isAuthenticated(): boolean {
    var token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return this.jwtHelper.isTokenExpired(token);
  }

  logOut(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.router.navigate(['auth']);
  }
}
