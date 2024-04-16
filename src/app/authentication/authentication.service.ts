import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private baseURL: string = environment.baseURL;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  loginWithGoogle(credentials: string): Observable<any>{
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this.http.post(`${this.baseURL}/Authentication/authenticate-google`, JSON.stringify(credentials), {headers: header})
  }

  registerWithGoogle(credentials: string): Observable<any>{
    const header = new HttpHeaders().set('Content-type', 'application/json');
    return this.http.post(`${this.baseURL}/Authentication/register-google`, JSON.stringify(credentials), {headers: header})
  }

  signUp(userObj: any){
    return this.http.post<any>(`${this.baseURL}/Authentication/register`, userObj)
  }

  logIn(loginObj: any){
    return this.http.post<any>(`${this.baseURL}/Authentication/authenticate`, loginObj)
  }

  signOn(){
    localStorage.clear();
  }

  storeToken(tokenValue: string){
    localStorage.setItem('token', tokenValue)
  }

  getToken(){
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    return !token || this.jwtHelper.isTokenExpired(token);
  }

  getEmailFromToken(): string | null {
    const token = this.getToken();
    console.log(token)

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.unique_name;  // Make sure the token has an 'email' claim
    }
    return null;
  }

}

