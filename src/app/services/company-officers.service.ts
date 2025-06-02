import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

export interface CompanyOfficer {
  name: string;
  email?: string;
  occupation?: string;
  nationality?: string;
  officerRole?: string;
  appointedOn?: string;
  resignedOn?: string;
  identification?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyOfficersService {
  private baseApiUrl = 'http://a56c1224aa69644678202f3c3fa73530-786613870.eu-west-2.elb.amazonaws.com/api/v1/business-profile-third-party-flow';
  private _token: string = '';

  constructor(private http: HttpClient) {}

  setToken(token: string): void {
    this._token = token;
  }

  getCompanyOfficers(companyNumber: string): Observable<CompanyOfficer[]> {
    const apiUrl = `${this.baseApiUrl}/company_officers`;
    
    // Build headers with API key
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'x-api-key': this._token
    });

    // Add company number to query params
    const params = {
      companyNumber: companyNumber
    };

    return this.http.get<any>(apiUrl, { headers, params }).pipe(
      tap(response => {
        console.log('Company officers fetched successfully');
      }),
      catchError(error => {
        console.error('Error fetching company officers:', error);
        return of([]);
      })
    );
  }
}
