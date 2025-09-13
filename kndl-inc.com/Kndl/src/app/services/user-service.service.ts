import { Injectable } from '@angular/core';
import { User } from '../models/User';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  defaultUrl = 'https://localhost:7055/Auth';
  //https://localhost:7055/Auth/Get-User/asdfasdf
  constructor(private httpClient: HttpClient) { }

  getUser(email: string): Observable<User | undefined> {
    const url = `${this.defaultUrl}/Get-User/${email}`;
    /*this.httpClient.get<User>(url).subscribe(user => {
      console.log('User data:', user);
    });*/
    return this.httpClient.get<User>(url);
  }
}
