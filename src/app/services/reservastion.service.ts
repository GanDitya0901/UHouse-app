import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = 'https://u-house-app.vercel.app/api/reservation';  // Your API endpoint

  constructor(private http: HttpClient) {}

  sendEmailReminder(reservationId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/send-booking-reminder/${reservationId}`);
  }
  
}
