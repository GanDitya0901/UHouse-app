import { Component, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() homeRef!: ElementRef;
  @Input() roomRef!: ElementRef;
  @Input() serviceRef!: ElementRef;
  @Input() contactRef!: ElementRef;
  @Input() aboutRef!: ElementRef;
  @Input() signInRef!: ElementRef;
  @Input() signUpRef!: ElementRef;

  constructor(private userService: UserService, private router: Router) {}

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
