import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacilitiesService {

  private apiUrl = 'http://localhost:3000/api/facilities';  // Your API endpoint

  constructor(private http: HttpClient) {}

  getFacilities(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getFacilityByRoomTypeId(roomTypeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/room/${roomTypeId}`);
  }

  addFacility(facilityData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, facilityData);
  }

  updateFacility(roomTypeId: string, facilityData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${roomTypeId}`, facilityData);
  }
  
}
