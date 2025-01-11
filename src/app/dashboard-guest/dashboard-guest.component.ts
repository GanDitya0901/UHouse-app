import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
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
  selector: 'app-dashboard-guest',
  templateUrl: './dashboard-guest.component.html',
  styleUrls: ['./dashboard-guest.component.css']
})
export class DashboardGuestComponent {
  @ViewChild('room', { static: true }) room!: ElementRef;
  @ViewChild('service', { static: true }) service!: ElementRef;
  @ViewChild('contact', { static: true }) contact!: ElementRef;
  @ViewChild('about', { static: true }) about!: ElementRef;
  

  roomRef!: ElementRef;
  serviceRef!: ElementRef;
  contactRef!: ElementRef;
  aboutRef!: ElementRef;

  token: string | null = null;
  username: string | null = null;

  reviews: Review[] = [];
  visibleReviewsCount: number = 4; // Initially show only 4 reviews
  rooms: any[] = [];
  favRoomId: string = '';

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
  };

  error: string | null = null;

  constructor(private cdr: ChangeDetectorRef, 
    private userService: UserService, 
    private el: ElementRef, private router: Router) {}

  ngOnInit(): void {

    this.userService.tokenEmitter.subscribe((token: string) => {
      this.token = token;
      console.log('Token received:', this.token);
    });

    this.token = this.userService.getToken();
    if (this.token) {
      console.log('Token retrieved from storage:', this.token);
    }

    this.fetchReviews();
    this.fetchRooms();
    this.fetchFavRoom();
    console.log('Total Reviews:', this.reviews.length);
    console.log('Visible Reviews Count:', this.visibleReviewsCount);

    this.userService.tokenEmitter.subscribe((token: string) => {
      // Retrieve username from the UserService
      this.username = this.userService.getUsername();})

      if (!this.token) {
        console.log('No token found');
      } else {
        console.log('Token found:', this.token);
        this.getUserProfile(); // Fetch the user profile when the token is available
      }

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
  
  getRatingStars(rating: number): boolean[] {
    const filledStars = Array(Math.floor(rating)).fill(true); // Filled stars
    const emptyStars = Array(5 - Math.floor(rating)).fill(false); // Empty stars
    return [...filledStars, ...emptyStars];
  }
  
  fetchUserProfile() {
    this.userService.getUserProfile().subscribe(
      data => {
        this.user = data;
      },
      error => {
        console.error('Error fetching user profile:', error);
        this.error = 'Failed to fetch user profile. Please try again.';
      }
    );
  }

  getUserProfile(): void {
    this.userService.getUserProfile().subscribe(
      data => {
        console.log('Fetched user data:', data);
        this.user = data;
      },
      error => {
        console.error('Error fetching user profile:', error);
        if (error.status === 401) {
          console.log('Token invalid or expired, redirecting to login.');
          this.router.navigate(['/login']);
        }
      }
    );
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
    this.userService.generateFavRooms().subscribe(
      data => {
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
    // Use setTimeout to defer the assignments to the next JavaScript turn
    setTimeout(() => {
      this.roomRef = this.room;
      this.serviceRef = this.service;
      this.contactRef = this.contact;
      this.aboutRef = this.about;
      
      // Manually trigger change detection
      this.cdr.detectChanges();
    }, 0);
  }
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

  viewRoom(room: any) {
    localStorage.setItem('roomDetails', JSON.stringify(room));
    this.router.navigate(['/room-details']);
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


