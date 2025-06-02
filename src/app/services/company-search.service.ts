import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

export interface CompanySearchResult {
  companyName: string;
  companyNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanySearchService {
  private baseApiUrl = 'http://a56c1224aa69644678202f3c3fa73530-786613870.eu-west-2.elb.amazonaws.com/api/v1';
  private defaultApiKey = 'pk-live-4NYDjpH5So0-cYWIG9ylUJi5ASL-Y8kg';
  
  private _apiKey: string;
  
  constructor(private http: HttpClient) {
    // Initialize with default API key
    this._apiKey = this.defaultApiKey;
  }
  
  // Set API key
  setApiKey(apiKey?: string) {
    if (apiKey) {
      this._apiKey = apiKey;
    }
  }
  
  // Set token (alias for setApiKey for consistency with other services)
  setToken(token?: string) {
    this.setApiKey(token);
  }
  
  // Get the current token/API key
  getToken(): string {
    return this._apiKey;
  }
  
  // Search for companies by name
  searchCompanies(searchTerm: string): Observable<CompanySearchResult[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return of([]);
    }
    
    const apiUrl = `${this.baseApiUrl}/business-profile-third-party-flow/search/company_name`;
    console.log('Searching companies with API:', apiUrl);
    
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'x-api-key': this._apiKey
    });
    
    // Add search term to query params
    const params: any = {
      searchCharacter: searchTerm.trim()
    };
    
    return this.http.get<CompanySearchResult[]>(apiUrl, { headers, params }).pipe(
      tap(response => {
        console.log('Company search results received:', response);
      }),
      catchError(error => {
        console.error('Error searching companies:', error);
        return of([]);
      })
    );
  }
}
