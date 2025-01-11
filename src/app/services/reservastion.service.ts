import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = 'http://localhost:3000/api/reservation';  // Your API endpoint

  constructor(private http: HttpClient) {}

  sendEmailReminder(reservationId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/send-booking-reminder/${reservationId}`);
  }
  
}
