import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// shared-data.service.ts
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private id: string ='';
  private iduser?: string;

  constructor() { }

  setId(value: string) {
    this.id = value;
  }

  getId() {
    return this.id;
  }

  setUser(value: string) {
    this.iduser = value;
  }

  getUser() {
    return this.iduser;
  }
}
