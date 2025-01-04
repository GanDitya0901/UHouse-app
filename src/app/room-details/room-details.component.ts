import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.css']
})
export class RoomDetailsComponent implements OnInit {

  token: string | null = null;

  rooms: any[] = [];

  roomType: string = '';
  roomDesc: string = '';
  roomImgUrl: string = '';

  constructor(private cdr: ChangeDetectorRef, 
    private userService: UserService, 
    private el: ElementRef,
    private router: Router) {}

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

    const roomDetails = JSON.parse(localStorage.getItem('roomDetails') || '{}');
    if (roomDetails) {
      this.roomType = roomDetails.roomType;
      this.roomDesc = roomDetails.roomDesc;
      this.roomImgUrl = roomDetails.roomImgUrl;
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

  @ViewChild('room', { static: true }) room!: ElementRef;
  @ViewChild('service', { static: true }) service!: ElementRef;
  @ViewChild('contact', { static: true }) contact!: ElementRef;
  @ViewChild('about', { static: true }) about!: ElementRef;

  roomRef!: ElementRef;
  serviceRef!: ElementRef;
  contactRef!: ElementRef;
  aboutRef!: ElementRef;
 
  ngAfterViewInit() {
    this.roomRef = this.room;
    this.serviceRef = this.service;
    this.contactRef = this.contact;
    this.aboutRef = this.about;
  }
  logout() {
    this.userService.logout();
    this.router.navigate(['/landing-page']);
  }

}
