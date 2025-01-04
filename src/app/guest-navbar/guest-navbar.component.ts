
import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; 
import { Router } from '@angular/router';


@Component({
  selector: 'app-guest-navbar',
  templateUrl: './guest-navbar.component.html',
  styleUrls: ['./guest-navbar.component.css']
})
export class GuestNavbarComponent {
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

  rooms: any[] = [];

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

  dynamicText: string = '';
  dynamicLink: string = '';
  isReservationOrAdditionalRequestPage: boolean = false;
  isReserveHistoryOrReviewPage: boolean = false;


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

    this.updateNavbar();
    // Optional: Update navbar on route changes
    this.router.events.subscribe(() => {
      this.updateNavbar();
    });

    this.fetchRooms();
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

  private updateNavbar(): void {
    const currentUrl = this.router.url;

    if (currentUrl === '/reservation') {
      this.dynamicText = 'Reservation';
      this.dynamicLink = '/reservation';
      this.isReservationOrAdditionalRequestPage = true;
      this.isReserveHistoryOrReviewPage = false;
    } else if (currentUrl === '/additionalRequest') {
      this.dynamicText = 'Request';
      this.dynamicLink = '/additionalRequest';
      this.isReservationOrAdditionalRequestPage = true;
      this.isReserveHistoryOrReviewPage = false;
    } else if (currentUrl === '/reserveHistory' || currentUrl === '/review-rating') {
      this.isReservationOrAdditionalRequestPage = false;
      this.isReserveHistoryOrReviewPage = true;
    } else {
      this.isReservationOrAdditionalRequestPage = false;
      this.isReserveHistoryOrReviewPage = false;
    }
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

  isCurrentPage(url: string): boolean {
    return this.router.url === url;
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

}
