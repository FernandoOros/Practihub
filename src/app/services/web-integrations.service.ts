import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../authentication/authentication.service'; // Update the path as needed

const baseURL: string = environment.baseURL;

@Injectable({
  providedIn: 'root'
})
export class WebIntegrationsService {
  headers: any;
  constructor(private http: HttpClient, private authService: AuthenticationService, private router: Router) {}

  private getHeaders() {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json'});
    return
  }

  private getAuthHeaders(){
    if (this.authService.isTokenExpired()) {
      this.router.navigate(['/login']);
      return null;
    }
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return
  }

  retrieve(endpoint: string, params?: HttpParams) {
    this.getHeaders();
    return this.http.get(`${baseURL}/${endpoint}`, { params, headers: this.headers, observe: 'response'});
  }

  executePost(endpoint: string, body: any, params?: HttpParams) {
    this.getHeaders();
    return this.http.post(`${baseURL}/${endpoint}`, body, { params, headers: this.headers, observe: 'response'});
  }

  executePostAuth(endpoint: string, body: any, params?: HttpParams) {
    this.getAuthHeaders();
    return this.http.post(`${baseURL}/${endpoint}`, body, { params, headers: this.headers, observe: 'response'});
  }
}
