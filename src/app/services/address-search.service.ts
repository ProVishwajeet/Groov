import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface AddressSuggestion {
  id: string;
  suggestion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressSearchService {
  private apiUrl = 'http://a56c1224aa69644678202f3c3fa73530-786613870.eu-west-2.elb.amazonaws.com/api/v1/business-profile-third-party-flow/find_address';
  private apiKey = 'pk-live-4NYDjpH5So0-cYWIG9ylUJi5ASL-Y8kg';

  constructor(private http: HttpClient) { }

  searchAddresses(query: string): Observable<AddressSuggestion[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    const headers = new HttpHeaders({
      'accept': 'application/json',
      'x-api-key': this.apiKey
    });

    const params = { query: query };

    console.log(`Searching addresses with query: ${query}`);
    
    return this.http.get<AddressSuggestion[]>(this.apiUrl, { headers, params })
      .pipe(
        tap(response => console.log('Address search response:', response)),
        catchError(error => {
          console.error('Error searching addresses:', error);
          return of([]);
        })
      );
  }
}
