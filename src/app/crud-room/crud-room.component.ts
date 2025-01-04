import { Component, OnInit, ElementRef } from '@angular/core';
import { UserService } from '../services/user.service';
import { Modal } from 'bootstrap';  // Import Bootstrap's Modal component

@Component({
  selector: 'app-crud-room',
  templateUrl: './crud-room.component.html',
  styleUrls: ['./crud-room.component.css']
})
export class CrudRoomComponent implements OnInit {
  selectedFile: File | null = null;
  token: string | null = null;

  roomType: string = '';
  roomNum: number | null = null;
  roomPolicy: string = '';
  roomDesc: string = '';
  roomBathroom: string = '';
  roomFloor: number | null = null;
  bedType: string = '';
  numBeds: number | null = null;
  roomPrice: number | null = null;
  facilities: any = {
    parking: false,
    swimmingPool: false,
    airConditioner: false,
    balcony: false,
    towel: false,
    bathAmenities: false,
    sunBed: false,
    outdoorShower: false
  };

  rooms: any[] = [];
  showSuccessMessage = false;
  isEditMode: boolean = false;
  editRoomId: string | null = null;

  maximumGuest: number = 1;
  maxAdult: number = 1;
  maxChildren: number = 1;

  constructor(private userService: UserService, private el: ElementRef) {}

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
          roomImgUrl: `http://localhost:3000/${room.roomImg}`,
          facilities: room.facilities 
        }));
        console.log('Rooms fetched successfully:', this.rooms);
      },
      error: error => {
        console.error('Error fetching rooms:', error);
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('File selected:', this.selectedFile);
  }

  onUpload() {
    const roomData = {
      roomType: this.roomType,
      roomNum: this.roomNum,
      roomPolicy: this.roomPolicy,
      roomDesc: this.roomDesc,
      roomBathroom: this.roomBathroom,
      roomFloor: this.roomFloor,
      bedType: this.bedType,
      numBeds: this.numBeds,
      roomPrice: this.roomPrice,
      facilities: this.facilities
    };
  
    if (!roomData.roomType || !roomData.roomNum || !roomData.roomPolicy || !roomData.roomDesc || !roomData.roomBathroom || !roomData.roomFloor||!roomData.bedType||!roomData.numBeds) {
      console.error('Missing required fields', roomData);
      alert('Please fill in all required fields.');
      return;
    }
  
    const formData = new FormData();
  
    if (this.selectedFile) {
      formData.append('roomImg', this.selectedFile, this.selectedFile.name);
    }
  
    // Append each key-value pair to formData, converting numbers to strings and filtering out null values
    for (const key in roomData) {
      if (roomData[key as keyof typeof roomData] !== null) {
        formData.append(key, String(roomData[key as keyof typeof roomData]));
      }
    }
  
    if (this.isEditMode && this.editRoomId) {
      this.userService.updateRoom(this.editRoomId, formData).subscribe({
        next: response => {
          console.log('Update success', response);
          this.showSuccessMessage = true;
          this.fetchRooms();
          this.clearForm();
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: error => {
          console.error('Update error', error);
        }
      });
    } else {
      if (!this.selectedFile) {
        console.error('No file selected');
        return;
      }
  
      this.userService.uploadFile(this.selectedFile, roomData).subscribe({
        next: response => {
          console.log('Upload success', response);
          console.log('datamasuk', roomData)
          this.showSuccessMessage = true;
          this.fetchRooms();
          this.clearForm();
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: error => {
          console.error('Upload error', error);
        }
      });
    }
  }
  

  openModal() {
    this.isEditMode = false;
    this.clearForm();
    const modalElement = this.el.nativeElement.querySelector('#staticBackdrop');
    const modal = new Modal(modalElement);  // Initialize the modal using the imported Modal component
    modal.show();
  }

  closeModal() {
    const modalElement = this.el.nativeElement.querySelector('#staticBackdrop');
    const modal = Modal.getInstance(modalElement);  // Get the instance of the modal
    if (modal) {
      modal.hide();
    }
  }

  minus(type: string) {
    if (type === 'guest' && this.maximumGuest !== 1) {
      this.maximumGuest--;
    } else if (type === 'adult' && this.maxAdult !== 1) {
      this.maxAdult--;
    } else if (type === 'children' && this.maxChildren !== 1) {
      this.maxChildren--;
    }
  }

  plus(type: string) {
    if (type === 'guest' && this.maximumGuest !== 5) {
      this.maximumGuest++;
    } else if (type === 'adult' && this.maxAdult !== 5) {
      this.maxAdult++;
    } else if (type === 'children' && this.maxChildren !== 5) {
      this.maxChildren++;
    }
  }

  clearForm() {
    this.roomType = '';
    this.roomNum = null;
    this.roomPolicy = '';
    this.roomDesc = '';
    this.roomBathroom = '';
    this.roomFloor = null;
    this.bedType = '';
    this.numBeds = null;
    this.selectedFile = null;
    this.isEditMode = false;
    this.editRoomId = null;
    this.facilities = {
      parking: false,
      swimmingPool: false,
      airConditioner: false,
      balcony: false,
      towel: false,
      bathAmenities: false,
      sunBed: false,
      outdoorShower: false
    };
    this.selectedFile = null;
  }

  onEdit(room: any) {
    this.isEditMode = true;
    this.editRoomId = room._id;
    this.roomType = room.roomType;
    this.roomNum = room.roomNum;
    this.roomPolicy = room.roomPolicy;
    this.roomDesc = room.roomDesc;
    this.roomBathroom = room.roomBathroom;
    this.roomFloor = room.roomFloor;
    this.bedType = room.bedType;
    this.numBeds = room.numBeds;

    const modalElement = this.el.nativeElement.querySelector('#staticBackdrop');
    const modal = new Modal(modalElement);  // Initialize the modal using the imported Modal component
    modal.show();
  }

  onDelete(roomId: string) {
    if (confirm('Are you sure you want to delete this room?')) {
      this.userService.deleteRoom(roomId).subscribe({
        next: response => {
          console.log('Room deleted successfully', response);
          this.fetchRooms();
        },
        error: error => {
          console.error('Error deleting room:', error);
        }
      });
    }
  }
}
