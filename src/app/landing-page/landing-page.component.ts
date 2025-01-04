import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; 
import { Router } from '@angular/router';

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

  token: string | null = null;

  rooms: any[] = [];

  constructor(private cdr: ChangeDetectorRef, private userService: UserService, private el: ElementRef, private router: Router) {}

  ngOnInit(): void {
    this.userService.tokenEmitter.subscribe((token: string) => {
      this.token = token;
      console.log('Token received:', this.token);
    });

    this.token = this.userService.getToken();
    if (this.token) {
      console.log('Token retrieved from storage:', this.token);
    }

    this.fetchRooms();
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

  viewRoom(room: any) {
    localStorage.setItem('roomDetails', JSON.stringify(room));
    this.router.navigate(['/room-details']);
  }
}
