import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';  // Import Bootstrap's Modal component
import { HttpClient } from '@angular/common/http';

interface Reservation {
  id: number;  // Ensure `id` is part of the Reservation interface
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
  paymentMethod:string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnInit{
  [x: string]: any;

  reservations: Reservation[] = [];
  selectedReservation: Reservation | null = null;
  private modalInstance: Modal | null = null; // Store modal instance for control

  isDateDropdownOpen = false;


  filters = {
    name: '',
    roomType: '',
    status: '',
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null
  };

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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef, 
    private userService: UserService, 
    private router: Router,
  
  ) {}

  openModal(reservation: Reservation) {
    console.log('Opening modal with reservation:', reservation);  // Debugging
    const modalElement = document.getElementById('reserveModals');
    if (modalElement) {
      this.selectedReservation = reservation;  // Set data untuk ditampilkan di modal
      this.modalInstance = new Modal(modalElement);  // Inisialisasi instance modal
      this.modalInstance.show();  // Tampilkan modal
    }
  }
  
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();  // Tutup modal
      this.selectedReservation = null;  // Reset data setelah modal ditutup
    }
  }
  

  ngOnInit(): void {
    this.userService.tokenEmitter.subscribe((token: string) => {
      this.token = token;
      console.log('Token received:', this.token);
    });

    this.token = this.userService.getToken();
    if (this.token) {
      console.log('Token retrieved from storage:', this.token);
      this.fetchAllReservations();  // Fetch reservation data when token is available
    }
  }

  // Method to fetch reservation history from server
  // Fetch reservation history from the server
  fetchAllReservations(): void {
    const token = this.userService.getToken(); // Retrieve the token
    
    if (!token) {
      console.error('Token is missing');
      alert('Error: Token is missing. Please log in again.');
      return;
    }
  
    this.userService.getAllReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.reservations = reservations;
        console.log('Reservations fetched successfully:', this.reservations);
      },
      error: (error: any) => {
        console.error('Error fetching reservations:', error);
        alert('Error fetching reservations. Please try again later.');
      }
    });
  }
  
  logReservationId(id: number | undefined) {
    console.log('Reservation ID:', id); // This should print the ID before navigation
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


  setDateFilter(event: any) {
    const option = event.target.value;
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
  
    switch (option) {
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 1);
        break;
      case 'last7Days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
        break;
      case 'last30Days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
        startDate = null;
        endDate = null;
    }
  
    this.filters.checkInDate = startDate;
    this.filters.checkOutDate = endDate;
  }

  filteredReservations(): Reservation[] {
    console.log("Filtering reservations:", this.reservations); // Check if reservations are here
  
    return this.reservations.filter((reservation) => {
      const reservationCheckInDate = new Date(reservation.checkInDate).setHours(0, 0, 0, 0);
      const reservationCheckOutDate = new Date(reservation.checkOutDate).setHours(0, 0, 0, 0);
      const { name, roomType, status, checkInDate, checkOutDate } = this.filters;
  
      const startDateTimestamp = checkInDate ? new Date(checkInDate).setHours(0, 0, 0, 0) : null;
      const endDateTimestamp = checkOutDate ? new Date(checkOutDate).setHours(0, 0, 0, 0) : null;
  
      return (
        (!name || reservation.name.includes(name)) &&
        (!roomType || reservation.roomType === roomType) &&
        (!status || reservation.status === status) &&
        (!startDateTimestamp || reservationCheckInDate >= startDateTimestamp) &&
        (!endDateTimestamp || reservationCheckOutDate <= endDateTimestamp)
      );
    });
  }
}
