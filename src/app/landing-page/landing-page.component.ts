import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; 
import { Router } from '@angular/router';


interface Review {
  reviewerName: string;
  reviewText: string;
  rating: number;
  reviewRatingImg: string | null;
  email: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  @ViewChild('room', { static: true }) room!: ElementRef;
  @ViewChild('service', { static: true }) service!: ElementRef;
  @ViewChild('contact', { static: true }) contact!: ElementRef;
  @ViewChild('about', { static: true }) about!: ElementRef;

  roomRef!: ElementRef;
  serviceRef!: ElementRef;
  contactRef!: ElementRef;
  aboutRef!: ElementRef;
  favRoomId: string = '';

  rooms: any[] = [];

  reviews: Review[] = [];
  visibleReviewsCount: number = 4; // Initially show only 4 reviews
  username: string | null = null;

  user: any = {
    fullname: '',
    username: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    language: '',
    profilePhoto: '',
    address: '',
  }

  error: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchReviews();
    this.fetchRooms();
    this.fetchFavRoom();
    console.log('Total Reviews:', this.reviews.length);
    console.log('Visible Reviews Count:', this.visibleReviewsCount);

  }

  
  fetchRooms() {
    this.userService.getRooms().subscribe({
      next: rooms => {
        this.rooms = rooms.map(room => ({
          ...room,
          roomImgUrl: `http://localhost:3000/${room.roomImg}`
        }));
        console.log('Rooms fetched successfully:', this.rooms);
      },
      error: error => {
        console.error('Error fetching rooms:', error);
      }
    });
  }

    fetchFavRoom() {
      console.log('fav: 2');

      this.userService.generateFavRooms().subscribe(
        data => {
          console.log('fav: ', data);
          const dataFetched = data as unknown as any
          this.favRoomId = dataFetched.roomId[0]
  
          const index = this.rooms.findIndex(obj => obj._id === this.favRoomId);
  
          if (index !== -1) {
            const [targetObject] = this.rooms.splice(index, 1);
            this.rooms.unshift(targetObject);
          }
        },
        error => {
          console.error('Error fetching fav profile:', error);
          if (error.status === 401) {
            console.log('Token invalid or expired, redirecting to login.');
            this.router.navigate(['/login']);
          }
        }
      );
    }




    ngAfterViewInit() {
      setTimeout(() => {
        this.roomRef = this.room;
        this.serviceRef = this.service;
        this.contactRef = this.contact;
        this.aboutRef = this.about;
        this.cdr.detectChanges();
      }, 0);
    }

    viewRoom(room: any) {
      localStorage.setItem('roomDetails', JSON.stringify(room));
      this.router.navigate(['/room-details']);
    }
  
    getRatingStars(rating: number): boolean[] {
      const filledStars = Array(Math.floor(rating)).fill(true); // Filled stars
      const emptyStars = Array(5 - Math.floor(rating)).fill(false); // Empty stars
      return [...filledStars, ...emptyStars];
    }

  fetchReviews() {
    this.userService.getReviewRatings().subscribe(
      
      data => {
        // Memastikan bahwa data yang diterima mengandung email
        this.reviews = data.map((review: any) => ({
          ...review,
          reviewRatingImgUrl: `http://localhost:3000/${review.reviewRatingImg}`,
          email: review.reservationId.email, // Ambil email dari reservationId
        }));
        console.log('Reviews fetched successfully:', this.reviews);
      },
      error => {
        console.error('Error fetching reviews:', error);
        this.error = 'Failed to fetch reviews. Please try again.';
      }
    );
  }

  toggleReviews(): void {
    // If all reviews are shown, reduce the count; otherwise, show all reviews
    if (this.visibleReviewsCount < this.reviews.length) {
      this.visibleReviewsCount = this.reviews.length; // Show all reviews
    } else {
      this.visibleReviewsCount = 4; // Show only the first 4 reviews
    }
  
  }
  
}
