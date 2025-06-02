import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

export interface ConsentPageResponse {
  consentMessage: string;
  businessClientName: string;
  institutionId: string;
  institutionName: string;
  institutionLogoUrl: string;
  institutionSettings: {
    id: string;
    includeConsent: boolean;
    logoName: string;
    logoUrl: string;
    icon: string;
    backgroundColor: string;
    backgroundHoverColor: string;
    font: string;
    redirectUrl: string;
    hostedPageCopy: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private baseApiUrl = 'http://a56c1224aa69644678202f3c3fa73530-786613870.eu-west-2.elb.amazonaws.com/authorization/consent';
  private defaultToken = 'pk-live-4NYDjpH5So0-cYWIG9ylUJi5ASL-Y8kg';
  
  private _token: string;
  private _institutionAccountId: string;
  
  constructor(private http: HttpClient) {
    // Initialize with default values
    this._token = this.defaultToken;
    this._institutionAccountId = 'c234'; // Default institution account ID
  }
  
  // Set token and institutionAccountId
  setCredentials(token?: string, institutionAccountId?: string) {
    if (token) {
      this._token = token;
    }
    
    if (institutionAccountId) {
      this._institutionAccountId = institutionAccountId;
    }
  }
  
  getConsentPage(): Observable<ConsentPageResponse> {
    const apiUrl = `${this.baseApiUrl}/get-consent-page`;
    console.log('Requesting API:', apiUrl);
    
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'token': this._token
    });
    
    // Add institution account ID to query params
    let params: any = {
      institutionAccountId: this._institutionAccountId
    };
    
    return this.http.get<ConsentPageResponse>(apiUrl, { headers, params }).pipe(
      tap(response => {
        console.log('Consent page data received:', response);
      }),
      catchError(error => {
        console.error('Error fetching consent page data:', error);
        return of({} as ConsentPageResponse);
      })
    );
  }
}
