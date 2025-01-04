import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacilitiesService {

  private apiUrl = 'http://localhost:3000/facilities'; // Update the endpoint as necessary

  constructor(private http: HttpClient) { }

  getFacilities(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addFacility(facilityData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, facilityData);
  }

  updateFacility(id: string, facilityData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, facilityData);
  }

  deleteFacility(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
