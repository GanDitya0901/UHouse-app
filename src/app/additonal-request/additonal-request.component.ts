import { Component, ElementRef } from '@angular/core';
import * as bootstrap from 'bootstrap'; 
import { UserService } from '../services/user.service'; 
import { Router } from '@angular/router';

declare const Swal: any;



@Component({
  selector: 'app-additonal-request',
  templateUrl: './additonal-request.component.html',
  styleUrls: ['./additonal-request.component.css']
})
export class AdditonalRequestComponent {
  section: string = 'requestForm';

  showMenuImage = false;  // Controls the visibility of the breakfast menu image
  // selectedRequestType: string | undefined;
  selectedRequestType: string = ''; // Initial empty value to show the placeholder

  // selectedSpecialService: string | undefined;
  selectedSpecialService: string | undefined = undefined;
 // Initializes to show the placeholder
  currentRequestDetails: any = null;

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

  requestDetails: string | undefined;
  selectedService: string = '';


  extraBedDetails = {
    adults: undefined,
    children: undefined,
    bedType: undefined,
    instructions: undefined
  };
  
  amenities = {
    extraTowels: undefined,
    toiletries: undefined,
    coffeeTea: undefined,
    extraPillows: undefined,
    extraBlanket: undefined,
    crib: undefined,
    ironBoard: undefined,
    other: undefined
  };
  
  earlyBreakfastDetails = { 
    menuItems: undefined, 
    time: undefined 
  };
  
  earlyCheckInDetails = { time: undefined, instructions: undefined };
  lateCheckInDetails = { time: undefined, instructions: undefined };
  lateCheckOutDetails = { time: undefined, instructions: undefined };
  
  specialRequestDetails = {
    description: undefined
  };
  
  airportPickupDetails = { 
    flightNumber: undefined, 
    arrivalTime: undefined, 
    specialInstructions: undefined 
  };
  
  token: string | null = null;
  username: string | null = null;
  error: string | null = null;

  previousValue: string = '';

  guestRequests: any[] = [];
  selectedRequests: { type: string; details: any }[] = [];


  constructor(private userService: UserService, 
    private el: ElementRef, private router: Router){}
  ngOnInit(): void {
    this.fetchUserProfile();
    this.loadGuestRequests();

    this.userService.tokenEmitter.subscribe((token: string) => {
      this.token = token;
      console.log('Token received:', this.token);
    });

    this.token = this.userService.getToken();
    if (this.token) {
      console.log('Token retrieved from storage:', this.token);
    }
  }

  loadGuestRequests(): void {
    this.userService.getGuestRequests().subscribe(
      (data: { updatedAt: string }[]) => {
        // Sort guestRequests by updatedAt in descending order
        this.guestRequests = data.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        console.log('Sorted guest requests by updatedAt:', this.guestRequests);
      },
      (error) => {
        console.error('Error loading guest requests:', error);
      }
    );
  }
  
  

  
  fetchUserProfile() {
    this.userService.getUserProfile().subscribe(
      data => {
        this.user = data;
        console.log('User profile fetched:', this.user);
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
  

  onRequestTypeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
  
    if (selectedValue === '') {
      return;
    }
  
    // Set the selected request type based on the dropdown value
    this.selectedRequestType = selectedValue;
  
    // Open the corresponding modal based on the selected value
    switch (selectedValue) {
      case 'extraBed':
        this.openModal('extraBedModal');
        break;
      case 'earlyCheckIn':
        this.openModal('earlyCheckInModal');
        break;
      case 'lateCheckIn':
        this.openModal('lateCheckInModal');
        break;
      case 'lateCheckout':
        this.openModal('lateCheckOutModal');
        break;
      case 'addAmenities':
        this.openModal('addAmenitiesModal');
        break;
      case 'earlyBreakfast':
        this.openModal('earlyBreakfastModal');
        break;
      case 'specialRequests':
        this.openModal('specialRequestsModal');
        break;
      default:
        break;
    }
  
    // Reset the selected value in the dropdown to allow re-selection of the same option
    selectElement.value = '';
  }
  

  onSpecialServiceChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
  
    if (selectedValue === '') {
      return;
    }
  
    this.selectedSpecialService = selectedValue;
  
    // If 'airportPickup' is selected, open the modal
    if (selectedValue === 'airportPickup') {
      this.openModal('airportPickupModal');
    } else {
      // Reset the airport pickup details if another option is selected
      this.airportPickupDetails = { 
        flightNumber: undefined, 
        arrivalTime: undefined, 
        specialInstructions: undefined 
      };
    }
  }

  onSelectFocus(event: FocusEvent): void {
    // Save the current selection before focusing
    const selectElement = event.target as HTMLSelectElement;
    this.previousValue = selectElement.value;
    
    // Reset the value to blank when focus is gained (optional behavior)
    selectElement.value = '';
  }

  // Triggered when the select loses focus
  onSelectBlur(event: FocusEvent): void {
    const selectElement = event.target as HTMLSelectElement;

    // If no selection has been made, restore the previous value
    if (selectElement.value === '') {
      selectElement.value = this.previousValue;
    }
  }
  
  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // closeModal(modalId: string) {
  //   const modalElement = document.getElementById(modalId);
  //   if (modalElement) {
  //     const modalInstance = bootstrap.Modal.getInstance(modalElement);
  //     modalInstance?.hide();
  //   }
  //   console.log(this.extraBedDetails);
  // }
  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  
    // Reset request type if modal closes without saving required details
    if (modalId === 'extraBedModal' && !this.extraBedDetails.bedType) {
      this.selectedRequestType = '';
    } else if (modalId === 'earlyCheckInModal' && !this.earlyCheckInDetails.time) {
      this.selectedRequestType = '';
    } else if (modalId === 'lateCheckInModal' && !this.lateCheckInDetails.time) {
      this.selectedRequestType = '';
    } else if (modalId === 'lateCheckOutModal' && !this.lateCheckOutDetails.time) {
      this.selectedRequestType = '';
    } else if (modalId === 'addAmenitiesModal' && !Object.values(this.amenities).some(value => value)) {
      this.selectedRequestType = '';
    } else if (modalId === 'earlyBreakfastModal' && (!this.earlyBreakfastDetails.menuItems || !this.earlyBreakfastDetails.time)) {
      this.selectedRequestType = '';
    } else if (modalId === 'specialRequestsModal' && !this.specialRequestDetails.description) {
      this.selectedRequestType = '';
    } else if (modalId === 'airportPickupModal' && (!this.airportPickupDetails.flightNumber || !this.airportPickupDetails.arrivalTime || !this.airportPickupDetails.specialInstructions)) {
      this.selectedSpecialService = '';
    }
  
    console.log("Modal closed, selection cleared if not saved");
  }
  


  saveExtraBedDetails() {
    if (!this.extraBedDetails.bedType) {
      Swal.fire({
        icon: 'warning',
        title: 'Bed Type Required',
        text: 'Please select your preferred bed type for extra bed.',
      });
      return;
    }

      // Add the request details to the selectedRequests array
  this.selectedRequests.push({
    type: 'Extra Bed',
    details: this.extraBedDetails,
  });


    console.log('Extra Bed Details:', this.extraBedDetails);
    this.closeModal('extraBedModal');
    
    Swal.fire({
      icon: 'success',
      title: 'Details Saved',
      text: 'Your Extra Bed details have been saved successfully.'
    });
  
  }

  saveEarlyCheckInDetails() {
    if (!this.earlyCheckInDetails.time) {
      Swal.fire({
        icon: 'warning',
        title: 'Time Required',
        text: 'Please select your preferred check-in time for early check-in.',
      });
      return;
    }

      // Add the request details to the selectedRequests array
  this.selectedRequests.push({
    type: 'Early Check-In',
    details: this.earlyCheckInDetails,
  });

    console.log('Early Check-In Details:', this.earlyCheckInDetails);
    this.closeModal('earlyCheckInModal');
    
    Swal.fire({
      icon: 'success',
      title: 'Details Saved',
      text: 'Your Early Check-In details have been saved successfully.'
    });
  }

  saveLateCheckInDetails() {
    if (!this.lateCheckInDetails.time) {
      Swal.fire({
        icon: 'warning',
        title: 'Time Required',
        text: 'Please select your preferred check-in time for late check-in.',
      });
      return;
    }

      // Add the request details to the selectedRequests array
  this.selectedRequests.push({
    type: 'Late Check-In',
    details: this.lateCheckInDetails,
  });

    console.log('Late Check-In Details:', this.lateCheckInDetails);
    this.closeModal('lateCheckInModal');
    
    Swal.fire({
      icon: 'success',
      title: 'Details Saved',
      text: 'Your Late Check-In details have been saved successfully.'
    });
   
  }

  saveLateCheckOutDetails() {
    if (!this.lateCheckOutDetails.time) {
      Swal.fire({
        icon: 'warning',
        title: 'Time Required',
        text: 'Please select your preferred check-out time for late check-out.',
      });
      return;
    }

      // Add the request details to the selectedRequests array
  this.selectedRequests.push({
    type: 'Late Check-Out',
    details: this.lateCheckOutDetails,
  });

    console.log('Late Check-Out Details:', this.lateCheckOutDetails);
    this.closeModal('lateCheckOutModal');
    
    Swal.fire({
      icon: 'success',
      title: 'Details Saved',
      text: 'Your Late Check-Out details have been saved successfully.'
    });  
  }

  saveAmenities() {

      // Add the request details to the selectedRequests array
  this.selectedRequests.push({
    type: 'Amenities',
    details: this.amenities,
  });

    console.log('Selected Amenities:', this.amenities); 
    this.closeModal('addAmenitiesModal'); 
    Swal.fire({
      icon: 'success',
      title: 'Details Saved',
      text: 'Your Amenities details have been saved successfully.'
    });
  }

  toggleMenuImage() {
    this.showMenuImage = !this.showMenuImage;
  }
 
  saveEarlyBreakfastDetails() {
    if (!this.earlyBreakfastDetails.menuItems) {
      Swal.fire({
        icon: 'warning',
        title: 'Menu Description Required',
        text: 'Please enter your breakfast menu items before saving.',
      });
      return;
    }
    if (!this.earlyBreakfastDetails.time) {
      Swal.fire({
        icon: 'warning',
        title: 'Time Required',
        text: 'Please select your preferred breakfast time for early breakfast.',
      });
      return;
    }

      // Add the request details to the selectedRequests array
  this.selectedRequests.push({
    type: 'Early Breakfast',
    details: this.earlyBreakfastDetails,
  });

    console.log('Early Breakfast Details:', this.earlyBreakfastDetails);
    this.closeModal('earlyBreakfastModal');
    
    Swal.fire({
      icon: 'success',
      title: 'Details Saved',
      text: 'Your Early Breakfast details have been saved successfully.'
    });
    
}

// save method for airport pick-up
saveAirportPickupDetails() {
  if (!this.airportPickupDetails.flightNumber) {
    Swal.fire({
      icon: 'warning',
      title: 'Flight Number Required',
      text: 'Please enter your flight number.',
    });
    return;
  }
  if (!this.airportPickupDetails.arrivalTime) {
    Swal.fire({
      icon: 'warning',
      title: 'Time Required',
      text: 'Please select your arrival time for Airport Pickup.',
    });
    return;
  }
  if (!this.airportPickupDetails.specialInstructions) {
    Swal.fire({
      icon: 'warning',
      title: 'WhatsApp Number Required',
      text: 'Please enter your WhatsApp Number.',
    });
    return;
  }

  console.log('Airport Pick-up Details:', this.airportPickupDetails);
  this.closeModal('airportPickupModal');
  Swal.fire({
    icon: 'success',
    title: 'Details Saved',
    text: 'Your Airport Pickup details have been saved successfully.'
  });
 
}



saveSpecialRequestDetails() {
  if (!this.specialRequestDetails.description) {
    Swal.fire({
      icon: 'warning',
      title: 'Description Required',
      text: 'Please enter your special request details.',
    });
    return;
  }

    // Add the request details to the selectedRequests array
    this.selectedRequests.push({
      type: 'Special Request',
      details: this.specialRequestDetails,
    });
  
  console.log('Special Request Details:', this.specialRequestDetails);
  this.closeModal('specialRequestsModal');
  
  Swal.fire({
    icon: 'success',
    title: 'Details Saved',
    text: 'Your special Request details have been saved successfully.'
  }); 
}


saveRequestDetails() {
  // Check if requestDetails is required but not filled
  if (
    (this.selectedService === 'spaPackage' || 
     this.selectedService === 'romanticSetup' || 
     this.selectedService === 'birthdaySurprise') &&
    (!this.requestDetails || this.requestDetails.trim() === '')
  ) {
    Swal.fire({
      icon: 'warning',
      title: 'Request Details Required',
      text: 'Please provide additional details for your selected special service.',
    });
    return;
  }

  // If all validation passes
  Swal.fire({
    icon: 'success',
    title: 'Request Submitted',
    text: 'Your request has been submitted successfully.',
  });
  console.log('Request Details:', this.requestDetails);
  // Add logic to close the modal or submit the request here
}


saveGuestRequest() {
  const requestData = {
    username: this.user.username,
    requestDetails: this.requestDetails,
    specialRequests: {
      description: this.specialRequestDetails.description
    },
    extraBedDetails: {
      adults: this.extraBedDetails.adults, 
      children: this.extraBedDetails.children, 
      bedType: this.extraBedDetails.bedType, 
      instructions: this.extraBedDetails.instructions 
    },
    amenities: this.amenities,
    earlyBreakfastDetails: {
      menuItems: this.earlyBreakfastDetails.menuItems,
      time: this.earlyBreakfastDetails.time
    },
    earlyCheckInDetails: {
      time: this.earlyCheckInDetails.time,
      instructions: this.earlyCheckInDetails.instructions
    },
    lateCheckInDetails: {
      time: this.lateCheckInDetails.time,
      instructions: this.lateCheckInDetails.instructions
    },
    lateCheckOutDetails: {
      time: this.lateCheckOutDetails.time,
      instructions: this.lateCheckOutDetails.instructions
    },
    airportPickupDetails: {
      flightNumber: this.airportPickupDetails.flightNumber,
      arrivalTime: this.airportPickupDetails.arrivalTime,
      specialInstructions: this.airportPickupDetails.specialInstructions
    },
    specialServices: {
      service: this.selectedSpecialService
    },
  
  
    requestType: this.selectedRequestType ,
    userId: this.user._id
  };

  console.log('Request Data:', requestData);

// Check if the request data is valid
const isDataValid = this.isValidRequestData(requestData);

if (!isDataValid) {
  // If data is invalid, show an error message and prevent submission
  Swal.fire({
    title: 'Error!',
    text: 'You must fill in at least one of the request details before submitting.',
    icon: 'error',
    confirmButtonColor: '#d33',
    confirmButtonText: 'OK'
  });
  return; // Prevent submission
}

  // Call the service to save the guest request
// Call the service to save the guest request
// Prompt the user for confirmation before saving
// Prompt the user for confirmation before requesting
Swal.fire({
  title: 'Are you sure?',
  text: 'Do you want to submit this guest request?',
  icon: 'question',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, request it!',
  cancelButtonText: 'No, cancel'
}).then((result: any) => {
  if (result.isConfirmed) {
    // Call the service to submit the guest request if confirmed
    this.userService.saveGuestRequest(requestData).subscribe(
      response => {
        console.log('Guest request submitted successfully:', response);
        
        // Show success message
        Swal.fire({
          title: 'Request Submitted!',
          text: 'The guest request was submitted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        }).then((result: any) => {
          if (result.isConfirmed) {
            // Reload the page after user confirms success message
            window.location.reload();
          }
        });
      },
      error => {
        console.error('Error submitting guest request:', error);
        
        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'There was an error submitting the guest request. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
    );
  } else {
    console.log('User canceled the guest request.');
  }
});
}


// Helper function to check if the request data is valid// Helper function to check if the request data is valid
isValidRequestData(data: any) {
  // Check if at least one of the fields (excluding userId and username) is filled (non-null, non-empty)
  const isNonEmptyField = (field: any) => field !== null && field !== undefined && field !== '';

  // Iterate over the fields in requestData, skipping 'userId' and 'username'
  return Object.keys(data).some(key => {
    if (key !== 'userId' && key !== 'username') {
      const fieldValue = data[key];
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        // If it's an object (like subdocuments), check each nested field
        return Object.values(fieldValue).some(isNonEmptyField);
      }
      // For non-object fields, just check if it's non-empty
      return isNonEmptyField(fieldValue);
    }
    return false;
  });
}


activeSection: string = 'form'; // Default selection

showSection(section: string) {
  this.activeSection = section;
}


onSubmit() {
  this.saveGuestRequest();
}

goBack() {
  
  this.router.navigate(['/dashboardGuest']);
}
viewSavedRequest() {
  if (this.selectedRequestType) {
    this.currentRequestDetails = this.getSavedRequestDetails(this.selectedRequestType);
    this.openModal('viewRequestModal');
  } else {
    console.log("No request type selected.");
  }
}

getSavedRequestDetails(requestType: string) {
  switch (requestType) {
    case 'earlyCheckIn':
      return this.earlyCheckInDetails;
    case 'lateCheckIn':
      return this.lateCheckInDetails;
    case 'lateCheckout':
      return this.lateCheckOutDetails;
    case 'extraBed':
      return this.extraBedDetails;
    case 'earlyBreakfast':
      return this.earlyBreakfastDetails;
    case 'addAmenities':
      return this.amenities;
    case 'specialRequests':
      return this.specialRequestDetails;
    default:
      return null;
  }
}


// Method to remove a specific request by index
removeRequest(index: number) {
  const removedRequest = this.selectedRequests[index];
  this.resetRequestDetails(removedRequest.type);
  this.selectedRequests.splice(index, 1);
  Swal.fire({
    icon: 'info',
    title: 'Request Removed',
    text: 'The selected request has been removed.',
  });
}

// Method to clear all selected requests and reset all form data
clearAllRequests() {
  this.selectedRequests = [];
  this.resetAllRequestDetails();
  Swal.fire({
    icon: 'info',
    title: 'All Requests Cleared',
    text: 'All selected requests and form data have been reset.',
  });
}

// Method to reset form data for a specific request type
resetRequestDetails(type: string) {
  switch (type) {
    case 'Early Check-In':
      this.earlyCheckInDetails = { time: undefined, instructions: undefined };
      break;
    case 'Late Check-In':
      this.lateCheckInDetails = { time: undefined, instructions: undefined };
      break;
    case 'Late Check-Out':
      this.lateCheckOutDetails = { time: undefined, instructions: undefined };
      break;
    case 'Extra Bed':
      this.extraBedDetails = {
        adults: undefined,
        children: undefined,
        bedType: undefined,
        instructions: undefined,
      };
      break;
    case 'Add Amenities':
      this.amenities = {
        extraTowels: undefined,
        toiletries: undefined,
        coffeeTea: undefined,
        extraPillows: undefined,
        extraBlanket: undefined,
        crib: undefined,
        ironBoard: undefined,
        other: undefined,
      };
      break;
    case 'Early Breakfast':
      this.earlyBreakfastDetails = { menuItems: undefined, time: undefined };
      break;
    case 'Other Special Requests':
      this.specialRequestDetails = { description: undefined };
      break;
    default:
      break;
  }
}

// Method to reset all form data for all request types
resetAllRequestDetails() {
  this.extraBedDetails = {
    adults: undefined,
    children: undefined,
    bedType: undefined,
    instructions: undefined,
  };

  this.amenities = {
    extraTowels: undefined,
    toiletries: undefined,
    coffeeTea: undefined,
    extraPillows: undefined,
    extraBlanket: undefined,
    crib: undefined,
    ironBoard: undefined,
    other: undefined,
  };

  this.earlyBreakfastDetails = { menuItems: undefined, time: undefined };
  this.earlyCheckInDetails = { time: undefined, instructions: undefined };
  this.lateCheckInDetails = { time: undefined, instructions: undefined };
  this.lateCheckOutDetails = { time: undefined, instructions: undefined };
  this.specialRequestDetails = { description: undefined };
}

// Remove airport pickup details (clear them)
removeAirportPickupDetails() {
  this.airportPickupDetails = { 
    flightNumber: undefined, 
    arrivalTime: undefined, 
    specialInstructions: undefined 
  };
  console.log('Airport Pickup details cleared.');
  Swal.fire({
    icon: 'info',
    title: 'Details Removed',
    text: 'Your Airport Pickup details have been cleared.'
  });
}

}