  import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
  import { UserService } from '../services/user.service'; 
  import { Router } from '@angular/router';
  import { FormBuilder, FormGroup } from '@angular/forms';

  declare const bootstrap: any;

  @Component({
    selector: 'app-manage-room-availability',
    templateUrl: './manage-room-availability.component.html',
    styleUrls: ['./manage-room-availability.component.css']
    
  })
  export class ManageRoomAvailabilityComponent {
    @ViewChild('room', { static: true }) room!: ElementRef;
    @ViewChild('service', { static: true }) service!: ElementRef;
    @ViewChild('contact', { static: true }) contact!: ElementRef;
    @ViewChild('about', { static: true }) about!: ElementRef;
    
    dateRange = {
      start: new Date().toISOString().split('T')[0], // Default to today
      end: ''
    };

    selectedDate: Date = new Date(); // Default to today
    dates: { day: string; date: string }[] = [];
    roomTypes: string[] = []; // Menyimpan daftar tipe kamar

    fetchRoomTypes() {
      this.roomTypes = [...new Set(this.rooms.map(room => room.roomType))]; // Mengambil tipe kamar unik
    }


    currentBulkRoomType: string = '';
    selectedRoomType: string = 'all';
    selectedBulkRoomType: string = 'all';
    bulkEditData = {
      roomStatus: 1,
      roomsToSell: null as number | null,
      standardRate: null as number | null,
      startDate: '', // Default empty date
      endDate: '',   // Default empty date
    };
    


    roomRef!: ElementRef;
    serviceRef!: ElementRef;
    contactRef!: ElementRef;
    aboutRef!: ElementRef;
    selectedType: string = 'all'; // Add this to track the selected type
    showRoomNumbers: boolean = false; // To control whether room numbers should be displayed
    selectedRoom: any;
    filteredRooms: any[] = [];
    standardRate: number | null = null;

    showModal: boolean = false; // Controls the modal visibility
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

      constructor(private cdr: ChangeDetectorRef, 
      private userService: UserService, 
      private el: ElementRef, private router: Router) {}

      ngOnInit(): void {
        // Generate the calendar first
        this.generateCalendar(new Date());
      
        // Fetch rooms after the calendar is ready
        this.fetchRooms();
      
      
      
        // Set default room type and adjust room numbers
        this.selectedRoomType = 'all';
        this.adjustRoomNumbers();
      
        // Listen for token changes
        this.userService.tokenEmitter.subscribe((token: string) => {
          this.token = token;
          console.log('Token received:', this.token);
        });
      
        // Get token and user profile
        this.token = this.userService.getToken();
        if (this.token) {
          console.log('Token retrieved from storage:', this.token);
          this.getUserProfile(); // Fetch the user profile if token is present
        } else {
          console.log('No token found');
        }
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


    generateCalendar(startDate: Date): void {
      this.dates = [];
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      const daysToGenerate = Math.min(28, daysInMonth); // Generate up to 31 days
    
      for (let i = 0; i < daysToGenerate; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = currentDate.toISOString().split('T')[0];
    
        this.dates.push({ day: dayName, date: formattedDate });
      }
    }
    

    // onDateChange(event: Event): void {
    //   const input = event.target as HTMLInputElement;
    //   const selectedDate = new Date(input.value);
    //   const today = new Date();
    //   const oneMonthLater = new Date(today);
    //   oneMonthLater.setDate(today.getDate() + 28);
    
    //   if (selectedDate > oneMonthLater) {
    //     alert('Tanggal melebihi batas 31 hari! Gunakan filter untuk melihat lebih jauh.');
    //     this.selectedDate = today;
    //   } else {
    //     this.selectedDate = selectedDate;
    //   }
    
    //   this.generateCalendar(this.selectedDate);
    // }
    


    adjustRoomNumbers(event?: Event): void {
      if (event) {
        const selectedType = (event.target as HTMLSelectElement).value;
        this.selectedRoomType = selectedType;
      }
    
      this.filteredRooms = this.selectedRoomType === 'all'
        ? this.rooms
        : this.rooms.filter(room => room.roomType === this.selectedRoomType);
    
      this.filteredRooms.forEach(room => {
        room.roomsToSell = Array(this.dates.length).fill(room.roomNum);
        room.status = room.roomsToSell.every((sell: number) => sell === 0) ? 'sold-out' : 'available';
      });
    }
    
    
    
    updateRoomsToSell(room: any, index: number): void {
      // Validate and update roomsToSell for each room
      if (room.roomsToSell[index] < 0) {
        room.roomsToSell[index] = 0;
      }
    }
    
    
    openEditModal(room: any): void {
      this.selectedRoom = { ...room }; // Clone room object to avoid mutations
      this.showModal = true;
    }
    toggleModal() {
      this.showModal = !this.showModal;
    }

  

    getWeekDates(): string[] {
      const startDate = new Date(this.dateRange.start);
      const days = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        days.push(currentDate.getDate().toString()); // Only the day number
      }
      return days;
    }
    getWeekDays(): string[] {
      const startDate = new Date(this.dateRange.start);
      const weekDays: string[] = [];
      
      // Loop through the dates array to generate formatted days
      for (const date of this.dates) {
        const currentDate = new Date(date.date); // Parse each date
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' }); // Short day name
        const dayOfMonth = currentDate.getDate(); // Numeric day of the month
    
        // Format with or without leading zeros
        weekDays.push(`${dayName} ${dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth}`);
      }
      
      return weekDays;
    }
    
    
    getMonthForDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short' }); // e.g., 'Nov', 'Dec'
    }
    
    isFirstDateOfMonth(dateString: string, index: number): boolean {
      const date = new Date(dateString);
      
      // Check if it's the first date in the grid or if the previous date was in a different month
      return index === 0 || new Date(this.dates[index - 1].date).getMonth() !== date.getMonth();
    }
    
    

updateRoomAvailability(): void {
  this.rooms.forEach((room, roomIndex) => {
    room.status = room.roomsToSell.every((sell: number) => sell === 0) ? 'sold-out' : 'available';
  });
}

  // Toggle room status when a cell is clicked
  // toggleRoomStatus(index: number): void {
  //   if (this.roomsToSell[index] > 0) {
  //     this.roomsToSell[index] = this.roomsToSell[index] === 0 ? 1 : 0;
  //   }
  // }



  // Trigger Weekly Rate Recalculation when Standard Rate changes
updateStandardRate(index: number): void {
  const standardRate = this.filteredRooms.forEach((room) => {
    room.standardRates[index] = room.standardRates[index] || 0;
  });
}

  // Function to calculate weekly rate based on the standard rate (Standard Rate - 5%)
// Calculate Weekly Rate dynamically
calculateWeeklyRate(standardRate: number): string {
  const weeklyRate = standardRate ? standardRate - standardRate * 0.05 : 0;
  return `IDR ${weeklyRate.toFixed(0)}`;
}


openModal(modalId: string, roomType: string): void {
  this.currentBulkRoomType = roomType;

  this.bulkEditData = {
    roomStatus: 1, // Default to 'Bookable'
    roomsToSell: null, // Default to null to track changes
    standardRate: null, // Default to null to track changes
    startDate: this.dateRange.start,
    endDate: this.dateRange.end,
  };

  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}


  
saveBulkChanges(): void {
  const { roomStatus, roomsToSell, standardRate, startDate, endDate } = this.bulkEditData;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Loop through all dates in the range
  for (let currentDate = start; currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
    const formattedDate = new Date(currentDate).toISOString().split('T')[0];

    this.filteredRooms.forEach((room) => {
      if (room.roomType === this.currentBulkRoomType) {
        const dateIndex = this.dates.findIndex((d) => d.date === formattedDate);
        if (dateIndex !== -1) {
          // Only update fields that are not null
          if (roomsToSell !== null) {
            room.roomsToSell[dateIndex] = roomsToSell;
          }
          if (standardRate !== null) {
            room.standardRates[dateIndex] = standardRate;
          }
          room.statuses[dateIndex] = roomStatus === 1 ? 'bookable' : 'closed';

          // Update the backend for the date
          this.updateRoomStatus(
            room,
            formattedDate,
            room.statuses[dateIndex],
            room.roomsToSell[dateIndex],
            room.standardRates[dateIndex]
          );
        }
      }
    });
  }

  // Refresh the filteredRooms array
  this.filteredRooms = [...this.filteredRooms];

  // Close the modal
  const modalElement = document.getElementById('bulkEditModal');
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  }
}




  //new
  fetchAvailability(): void {
    const startDate = this.dates[0].date;
    const endDate = this.dates[this.dates.length - 1].date;
  
    this.userService.getAvailability(this.selectedRoomType, startDate, endDate).subscribe({
      next: (data) => {
        this.rooms.forEach((room) => {
          // Iterate through dates and update room availability
          this.dates.forEach((date, index) => {
            const availability = data.find((r: any) =>
              r.roomType === room.roomType &&
              new Date(r.date).toISOString().split('T')[0] === date.date
            );
  
            if (availability) {
              room.roomsToSell[index] = availability.roomsToSell; 
              room.netBooked[index] = availability.netBooked || 0;
              room.statuses[index] = availability.status;
              room.standardRates[index] = availability.standardRate || 0; 
            }
          });
        });
      },
      error: (err) => console.error('Error fetching availability:', err),
    });
  }
  
  
  
  
  
  
  
  
  
  

  // Toggle room status on click
// Toggle room status between closed/bookable on click, but not if sold out
toggleRoomStatus(room: any, date: string, index: number): void {
  if (room.roomsToSell[index] === 0) return; // Prevent toggling if sold out

  const newStatus = room.statuses[index] === 'closed' ? 'bookable' : 'closed';
  room.statuses[index] = newStatus;

  // Update the backend with the specific date, room status, and standard rate
  this.updateRoomStatus(
    room,
    date,
    newStatus,
    room.roomsToSell[index],
    room.standardRates[index] || 0 // Include standardRate or default to 0
  );
}

fetchRooms(): void {
  this.userService.getRooms().subscribe({
    next: (rooms) => {
      this.rooms = rooms.map((room) => ({
        ...room,
        roomNum: room.roomNum, // Fetch total room count from CRUD component
        roomsToSell: Array(this.dates.length).fill(room.roomNum), // Initialize with roomNum
        netBooked: Array(this.dates.length).fill(0), // Initialize netBooked with 0
        statuses: Array(this.dates.length).fill('bookable'), // Default status to 'closed'
        standardRates: Array(this.dates.length).fill(room.roomPrice || 0), // Use roomPrice for standard rates
      }));
      console.log('Rooms fetched successfully:', this.rooms);

      // Fetch availability after generating dates and rooms
      if (this.dates.length > 0) {
        this.fetchAvailability();
      } else {
        console.error('Dates array is empty, skipping fetchAvailability.');
      }

      this.adjustRoomNumbers(); // Ensure room numbers are adjusted properly
    },
    error: (error) => console.error('Error fetching rooms:', error),
  });
}


onRoomsToSellChange(room: any, date: string, index: number): void {
  const roomsToSell = room.roomsToSell[index];
  const standardRate = room.standardRates[index] || 0;

  if (roomsToSell > room.roomNum) {
    room.roomsToSell[index] = room.roomNum;
    alert(`Rooms to sell cannot exceed total room number: ${room.roomNum}`);
  // } else if (roomsToSell < room.netBooked[index]) {
  //   room.roomsToSell[index] = room.netBooked[index];
  //   alert(`Rooms to sell cannot be less than net booked: ${room.netBooked[index]}`);
  } else {
    const status = roomsToSell === 0 ? 'sold-out' : room.statuses[index];
    room.statuses[index] = status;
    this.updateRoomStatus(room, date, status, roomsToSell, standardRate);
  }
}






// Function to update room status and save it in the backend
updateRoomStatus(
  room: any,
  date: string,
  status: string,
  roomsToSell: number,
  standardRate: number
): void {
  console.log('Payload being sent to backend:', {
    roomType: room.roomType,
    date,
    status,
    roomsToSell,
    standardRate,
  });

  this.userService.updateAvailability(room.roomType, date, status, roomsToSell, standardRate).subscribe({
    next: (response) => {
      console.log('Room status successfully updated:', response);
    },
    error: (err) => {
      console.error('Error updating room status:', err);
    },
  });
}



onStandardRateChange(room: any, index: number): void {
  console.log('Standard rate changed for room:', {
    roomType: room.roomType,
    date: this.dates[index].date,
    standardRate: room.standardRates[index],
  });

  // Trigger backend update
  this.updateRoomStatus(
    room,
    this.dates[index].date,
    room.statuses[index],
    room.roomsToSell[index],
    room.standardRates[index]
  );
}







updateNetBooked(room: any, index: number, newBookings: number): void {
  const currentNetBooked = room.netBooked[index] + newBookings;
  console.log(`Updating netBooked: ${currentNetBooked}, Current roomsToSell: ${room.roomsToSell[index]}`);

  if (currentNetBooked > room.roomNum) {
    alert(`Cannot book more than the available rooms: ${room.roomNum}`);
    return;
  }

  room.netBooked[index] = currentNetBooked;

  if (room.roomsToSell[index] > 0) {
    room.roomsToSell[index] -= newBookings;
    if (room.roomsToSell[index] < 0) {
      room.roomsToSell[index] = 0;
    }
    console.log(`Updated roomsToSell: ${room.roomsToSell[index]}`);
    this.updateRoomStatus(
      room,
      this.dates[index].date,
      room.statuses[index],
      room.roomsToSell[index],
      room.standardRates[index] || 0 // Include standardRate or default to 0
    );
  }
}

// filterRoomsByDateRange(): void {
//   const { start, end } = this.dateRange;

//   if (!start || !end) {
//     this.filteredRooms = [...this.rooms]; 
//     return;
//   }

//   const startDate = new Date(start);
//   const endDate = new Date(end);

//   this.filteredRooms = this.rooms.filter(room => {
//     const roomDate = new Date(room.date);
//     return roomDate >= startDate && roomDate <= endDate;
//   });
// }

filterDates(start: string, end: string): void {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Generate new dates array
  this.dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    const formattedDate = currentDate.toISOString().split('T')[0];
    this.dates.push({
      day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      date: formattedDate,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log('Filtered dates:', this.dates);

  // Fetch rooms after updating dates
  if (this.dates.length > 0) {
    this.fetchRooms();
  } else {
    console.error('No dates to fetch rooms for.');
  }
}



onDateRangeChange(): void {
  const startDate = new Date(this.dateRange.start);
  const endDate = new Date(this.dateRange.end);
  

  if (!this.dateRange.start || !this.dateRange.end || startDate > endDate) {
    console.error('Invalid date range');
    this.dates = []; // Clear dates if invalid
    return;
  }

  this.filterDates(this.dateRange.start, this.dateRange.end);
}




  }