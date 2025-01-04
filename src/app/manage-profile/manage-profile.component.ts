import { Component, ViewChild, ElementRef, 
  AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { countries } from 'countries-list';
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';





@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.component.html',
  styleUrls: ['./manage-profile.component.css']
})
export class ManageProfileComponent implements OnInit {
  @ViewChild('photoPreviewModal') photoPreviewModal!: ElementRef;


  countryList: { code: string; name: string }[] = [];
  successMessage: string = '';
  samePassMessage: string = '';
  errorMessage: string = '';
  isPhotoModalOpen = false;


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
  error: string = '';
  token: string | null = localStorage.getItem('jwtToken');
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  selectedFile: File | null = null; 
  temporaryPhotoUrl: string | null = null;
  editing = false;
  positionX = 0;
  positionY = 0;
  isDragging = false;
  startX = 0;
  startY = 0;
  translateX = 0;
  translateY = 0;

  isPhotoSelected: boolean = false;



  constructor(private userService: UserService, 
    private router: Router, 
    private http: HttpClient) { }

  ngOnInit(): void {
    if (!this.token) {
      console.log('No token found, redirecting to login.');
      this.router.navigate(['/login']);
    } else {
      console.log('Token found:', this.token);
      this.getUserProfile();
      console.log('User data:', this.token);
    }


    this.countryList = Object.values(countries).map((country) => ({
      code: country.name,
      name: country.name,
    }));
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

  saveChanges(): void {
  const formData = new FormData();

  if (this.user.fullname) formData.append('fullname', this.user.fullname);
  if (this.user.username) formData.append('username', this.user.username);
  if (this.user.email) formData.append('email', this.user.email);
  if (this.user.address) formData.append('address', this.user.address);
  if (this.user.phone) formData.append('phone', this.user.phone);
  if (this.user.dateOfBirth) formData.append('dateOfBirth', this.user.dateOfBirth);
  if (this.user.gender) formData.append('gender', this.user.gender);
  if (this.user.country) formData.append('country', this.user.country);
  if (this.user.language) formData.append('language', this.user.language);

  console.log('address:', this.user.address);
  console.log('profilephoto:', this.user.profilePhoto);

  if (this.selectedFile) {
    formData.append('profilePhoto', this.selectedFile, this.selectedFile.name);
  }

  this.userService.updateUserProfile(formData).subscribe(
    response => {
      console.log('Profile updated successfully:', response);
      // Update the user object with the new profile photo path
      if (response.profilePhoto) {
        this.user.profilePhoto = response.profilePhoto;
      }
    },
    error => {
      console.error('Error updating profile:', error);
    }
  );

  
}

  
  



onPhotoChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.temporaryPhotoUrl = e.target.result;
      this.isPhotoSelected = true;

      const modalElement = document.getElementById('photoPreviewModal');
      if (modalElement) {
        const photoModal = new bootstrap.Modal(modalElement);
        photoModal.show();
      }
    };
    reader.readAsDataURL(this.selectedFile);
  }
}




  
triggerFileInput() {
  const fileInput = document.getElementById('fileInput') as HTMLElement;
  fileInput.click();
}
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.uploadPhoto(this.selectedFile);
      console.log('selectedImg: ', this.selectedFile);
    }
  }

  uploadPhoto(file: File): void {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    formData.append('userId', this.user._id);
  
    this.http.post<{ profilePhoto: string }>('http://localhost:3000/uploads', formData).subscribe(
      (response) => {
        this.user.profilePhoto = response.profilePhoto;
      },
      (error) => {
        console.error('Error uploading photo', error);
      }
    );
  }
  
  
  

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      console.error('New password and confirm password do not match');
      this.samePassMessage = 'New password and confirm password do not match';
      setTimeout(() => {
        this.samePassMessage = '';
      }, 3000); 
    }
    else {
      this.userService.changeUserPassword(this.currentPassword, this.newPassword).subscribe(
        response => {
          console.log('Password changed successfully:', response);
          this.successMessage = "Password changed successfully"
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error => {
          console.error('Error changing password:', error);
          this.errorMessage = 'Error changing password'; 
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      );
    }
  }
  getFullImagePath(imagePath: string): string {
    return `http://localhost:3000/${imagePath}`;
}


  logout() {
    this.userService.logout();
    this.router.navigate(['/landing-page']);
  }

  viewRoom(room: any) {
    localStorage.setItem('roomDetails', JSON.stringify(room));
    this.router.navigate(['/room-details']);
  }

    // CSS transform style for positioning the image
  get transformStyle(): string {
    return `translate(${this.positionX}px, ${this.positionY}px)`;
  }
  
    
  
    movePhoto(direction: string): void {
      const step = 10; // Move distance in pixels
      switch (direction) {
        case 'up':
          this.positionY -= step;
          break;
        case 'down':
          this.positionY += step;
          break;
        case 'left':
          this.positionX -= step;
          break;
        case 'right':
          this.positionX += step;
          break;
      }
    }
  
    savePhoto(): void {
      if (this.selectedFile) {
        this.uploadPhoto(this.selectedFile);
        this.user.profilePhoto = this.temporaryPhotoUrl;
        this.temporaryPhotoUrl = null;
        this.selectedFile = null;
        this.positionX = 0;
        this.positionY = 0;
        this.closePreviewModal();
        this.isPhotoModalOpen = !this.isPhotoModalOpen;
      }
      
    }
    
    
    
    
  

  cancelPhotoChange(): void {
    this.temporaryPhotoUrl = null;
    this.selectedFile = null;
    this.positionX = 0;
    this.positionY = 0;

    const modalElement = document.getElementById('photoPreviewModal');
    if (modalElement) {
      const photoModal = bootstrap.Modal.getInstance(modalElement);
      photoModal?.hide();
    }
    
  }

  closePreviewModal() {
    const modalElement = document.getElementById('photoPreviewModal');
    if (modalElement) {
      const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
      bootstrapModal?.hide();
    }
  }

  startDrag(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
    event.preventDefault();
  }
  
  onDrag(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.translateX = event.clientX - this.startX;
    this.translateY = event.clientY - this.startY;
  }
  
  endDrag(): void {
    this.isDragging = false;
  }
  
  getTransformStyle(): string {
    return `translate(${this.translateX}px, ${this.translateY}px)`;
  }

  openPhotoModal() {
    this.isPhotoModalOpen = true;
  }
  
  closePhotoModal() {
    this.isPhotoModalOpen = false;
  }
  
// component.ts
deletePhoto() {
  this.userService.deleteUserProfilePhoto().subscribe(
    (response) => {
      console.log(response.message);
      this.user.profilePhoto = ''; // Clear the photo locally
      this.closePhotoModal();
    },
    (error) => {
      console.error('Error deleting profile photo:', error);
    }
  );
}

goBack() {
  
  this.router.navigate(['/dashboardGuest']);
}

  
    
  
  
}
