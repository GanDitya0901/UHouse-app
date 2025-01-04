import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; 
import { ActivatedRoute, Router } from '@angular/router'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs';


declare const Swal: any;



interface Reservation {
  _id: string;  // Ensure `_id` is part of the Reservation interface
  name: string;
  email: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomType: string;
  roomDesc: string;
  total: number;
  status?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-review-rating',
  templateUrl: './review-rating.component.html',
  styleUrls: ['./review-rating.component.css']
})
export class ReviewRatingComponent implements AfterViewInit, OnInit {
  @ViewChild('room', { static: true }) room!: ElementRef;
  @ViewChild('service', { static: true }) service!: ElementRef;
  @ViewChild('contact', { static: true }) contact!: ElementRef;
  @ViewChild('about', { static: true }) about!: ElementRef;

  reviews: any[] = []; // Array untuk menyimpan daftar ulasan
  reservationId: string | null = null;  // ID dari URL
  reservationData: Reservation | null = null;  // Menyimpan data reservation
  token: string | null = null;
  stars: number[] = [1, 2, 3, 4, 5];
  rating: number = 0;
  hoverRatingValue: number = 0;
  reviewText: string = '';
  reviewTitle: string = '';
  reviewerName: string = '';
  review: string = ''; 
  isSubmitDisabled: boolean = true;
  showError: boolean = false;

  rooms: any[] = [];

  roomRef!: ElementRef;
  serviceRef!: ElementRef;
  contactRef!: ElementRef;
  aboutRef!: ElementRef;

  username: string | null = null;

  constructor(     
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef, 
    private userService: UserService, 
    private el: ElementRef,
    private router: Router,
    private http: HttpClient 
  ) {}

  // Set rating value
  setRating(value: number): void {
    this.rating = value; 
    this.showError = false; 
  }

    hoverRating(value: number): void {
      this.hoverRatingValue = value; 
    }
  
  
    resetHoverRating(): void {
      this.hoverRatingValue = 0; // Reset  0
    }

    // Validate form completeness
    checkFormValidity() {
      this.isSubmitDisabled = !(this.reviewText && this.reviewTitle && this.reviewerName && this.rating > 0);
    }
  
  // Submit review
  submitReview() {
    if (!this.reservationId || !this.reviewerName || !this.reviewTitle || !this.reviewText || this.rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information',
        text: 'All fields must be filled before submitting.',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    const reviewData = {
      reviewerName: this.reviewerName,
      reviewTitle: this.reviewTitle,
      reviewText: this.reviewText,
      rating: this.rating,
    };
  
    const token = this.userService.getToken(); // Ensure token is fetched from a service or storage
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Token',
        text: 'Authorization token is missing.',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.post(`http://localhost:3000/reviews/${this.reservationId}`, reviewData, { headers })
      .subscribe({
        next: (response) => {
          console.log('Review submitted successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'Review Submitted',
            text: 'Your review has been successfully submitted.',
            confirmButtonText: 'OK',
          });
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          if (error.status === 403) {
            Swal.fire({
              icon: 'error',
              title: 'Unauthorized',
              text: 'You are not authorized to perform this action.',
              confirmButtonText: 'OK',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Submission Failed',
              text: 'An error occurred while submitting the review.',
              confirmButtonText: 'OK',
            });
          }
        },
      });
  }
  
  
    // Reset form fields after successful submission
    resetForm() {
      this.rating = 0;
      this.reviewText = '';
      this.reviewTitle = '';
      this.reviewerName = '';
      this.isSubmitDisabled = true;
    }

  // Fetch reservation data
  fetchReservationData(reservationId: string) {
    const token = this.userService.getToken();
    if (!token) {
      console.error('Authorization token is missing');
      return;
    }

    this.userService.fetchReservationById(token, reservationId).subscribe({
      next: (data: Reservation) => {
        this.reservationData = data;
        console.log('Reservation Data:', this.reservationData);
      },
      error: (error) => {
        console.error('Error fetching reservation data:', error);
      }
    });
  }
  // Fetch reviews for the reservation
  fetchReviews(reservationId: string): Promise<any> {
    const token = this.userService.getToken();
    if (!token) {
      console.error('Authorization token is missing');
      return Promise.reject('Authorization token is missing');
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `http://localhost:3000/api/reviews/${reservationId}`;
  
    return lastValueFrom(this.http.get<any>(url, { headers }));
  }
  

  async ngOnInit(): Promise<void> {
    // Dapatkan `reservationId` dari URL
    this.reservationId = this.route.snapshot.paramMap.get('id');
  
    if (!this.reservationId) {
      console.error('Invalid or missing Reservation ID in URL');
      alert('Reservation ID is missing or invalid.');
      return;
    }
  
    // Fetch reservation data berdasarkan ID
    this.fetchReservationData(this.reservationId);
  
    try {
      // Fetch reviews
      const reviews = await this.fetchReviews(this.reservationId);
      console.log('Reviews fetched successfully:', reviews);
  
      if (!reviews || reviews.length === 0) {
        console.warn('No reviews found for this reservation.');
        alert('No reviews exist for this reservation. Please add one.');
      }
    } catch (error: any) {
      if (error.status === 404) {
        console.warn('No reviews found for this reservation.');
        alert('No reviews exist for this reservation. Please add one.');
      } else {
        console.error('Error fetching reviews:', error);
      }
    }
  }
  

  ngAfterViewInit() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  // Scroll to a specific section
  scrollToSection(sectionRef: ElementRef) {
    sectionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToRoom() {
    this.scrollToSection(this.roomRef);
  }

  scrollToService() {
    this.scrollToSection(this.serviceRef);
  }

  scrollToContact() {
    this.scrollToSection(this.contactRef);
  }

  scrollToAbout() {
    this.scrollToSection(this.aboutRef); 
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/landing-page']);
  }


}
