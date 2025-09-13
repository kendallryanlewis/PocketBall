import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DomainsService {
  constructor(private http: HttpClient) { }
  baseUrl = 'https://localhost:7055/api';

  available(domain: string) {
    return this.http.get<{ domain: string; available: boolean }>(
      `${this.baseUrl}/user-dashboard/domains/available`,
      { params: { domain } }
    );
  }

}
