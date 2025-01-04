import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';


declare const Swal: any;


@Component({
  selector: 'app-manage-request',
  templateUrl: './manage-request.component.html',
  styleUrls: ['./manage-request.component.css']
})
export class ManageRequestComponent {

  showDeclineReasonForm: { [key: number]: boolean } = {};
  guestRequests: any[] = [];
  showDeclineReasonInput: boolean = false;
declineReason: string = '';
request: any = {
  extraBedDetails: {
    declineReason: ''
  },
  // Initialize other properties if necessary
};

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
activeSection: string = 'pending'; // Default selection


  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.getUserProfile();
    setTimeout(() => {
      this.activeSection = 'pending';  // Ensure user profile is fetched
      this.loadAndFilterRequests();
  }, 200);  // Delay of 2000 milliseconds (2 seconds)
   // Load and filter requests immediately when the page loads
  }

  getUserProfile(): void {
    this.userService.getUserProfile().subscribe(
      (data) => {
        console.log('Fetched user data:', data);
        this.user = data;
        
        if (this.user.role === 'admin') {
          console.log('User is admin, loading and filtering requests...');
          this.refreshRequests();  // Directly call refreshRequests after fetching user profile
          console.log('called');
        } else {
          console.log('User is not an admin, redirecting...');
          this.router.navigate(['/dashboardGuest']);
        }
      },
      (error) => {
        console.error('Error fetching user profile:', error);
        if (error.status === 401) {
          console.log('Token invalid or expired, redirecting to login.');
          this.router.navigate(['/login']);
        }
      }
    );
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
  
  

    // Method to update status
    updateStatus(
      requestId: string,
      requestType: string,
      status: 'approved' | 'declined',
      declineReason: string = '',
      approveMessage: string = ''
    ) {
      // Prompt the user for confirmation before approving or declining
      Swal.fire({
        title: status === 'approved' ? 'Approve Request?' : 'Decline Request?',
        text: `Are you sure you want to ${status} this request?`,
        icon: status === 'approved' ? 'info' : 'warning',
        showCancelButton: true,
        confirmButtonColor: status === 'approved' ? '#3085d6' : '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: status === 'approved' ? 'Yes, approve it!' : 'Yes, decline it!',
        cancelButtonText: 'No, cancel',
        input: status === 'declined' ? 'textarea' : status === 'approved' ? 'text' : null,
        inputPlaceholder: status === 'declined'
          ? 'Please provide a reason for declining...'
          : status === 'approved'
          ? 'Optional: Provide an approval message...'
          : '',
        inputValidator: (value: string) => {
          if (status === 'declined' && !value) {
            return 'You need to provide a reason for declining!';
          }
          return null;
        }
      }).then((result: any) => {
        if (result.isConfirmed) {
          // If the status is declined, get the reason from the input
          if (status === 'declined') {
            declineReason = result.value;
          } else if (status === 'approved') {
            approveMessage = result.value;
          }
    
          // Show loading spinner
          Swal.fire({
            title: 'Please wait...',
            text: 'Processing your request. Do not close this page.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
    
          // Proceed to update the request status
          this.userService.updateRequestStatus(requestId, requestType, status, declineReason, approveMessage).subscribe(
            (response) => {
              const request = this.guestRequests.find(r => r._id === requestId);
              if (request) {
                request[requestType].status = status;
                if (status === 'declined') {
                  request[requestType].declineReason = declineReason;
                }
                if (status === 'approved') {
                  request[requestType].approveMessage = approveMessage;
                }
              }
    
              // Hide loading and show success message
              Swal.fire({
                title: 'Request Updated!',
                text: `The request has been ${status} successfully, and an email notification has been sent.`,
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
              });
    
              // Refresh the request list
              this.refreshRequests();
            },
            (error) => {
              console.error('Error updating status:', error);
    
              // Hide loading and show error message
              Swal.fire({
                title: 'Error!',
                text: 'There was an error updating the request status or sending the email. Please try again.',
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
              });
            }
          );
        } else {
          console.log('User canceled the action.');
        }
      });
    }
    
    
    

  promptDeclineReason(id: number) {
    this.showDeclineReasonForm[id] = true;
  }



  showSection(section: string) {
    this.activeSection = section;
    this.refreshRequests();
    console.log('working');
  }

  goBack() {
  
    this.router.navigate(['/dashboard']);
  }

  filteredRequestsData: any[] = [];
  
  loadAndFilterRequests() {
    this.loadGuestRequests();  // Load guest requests (if not already loaded)
    this.filterRequests();  // Filter the requests based on activeSection
  }

  // Filter the requests based on the active section
  filterRequests() {
    this.filteredRequestsData = this.guestRequests.map(request => {
      // Iterate over each subdocument and update it based on the active section's status
      request.extraBedDetails = request.extraBedDetails?.status === this.activeSection ? request.extraBedDetails : null;
      request.earlyCheckInDetails = request.earlyCheckInDetails?.status === this.activeSection ? request.earlyCheckInDetails : null;
      request.lateCheckInDetails = request.lateCheckInDetails?.status === this.activeSection ? request.lateCheckInDetails : null;
      request.lateCheckOutDetails = request.lateCheckOutDetails?.status === this.activeSection ? request.lateCheckOutDetails : null;
      request.earlyBreakfastDetails = request.earlyBreakfastDetails?.status === this.activeSection ? request.earlyBreakfastDetails : null;
      request.amenities = request.amenities?.status === this.activeSection ? request.amenities : null;
      request.specialRequests = request.specialRequests?.status === this.activeSection ? request.specialRequests : null;
      request.specialServices = request.specialServices?.status === this.activeSection ? request.specialServices : null;

      // Remove null values from the request (subdocuments that do not match the active section)
      Object.keys(request).forEach(key => {
        if (request[key] === null) {
          delete request[key];
        }
      });

      // Return the updated guestRequest if it has any subdocument (non-null)
      return Object.keys(request).length > 1 ? request : null; // Ensures we don't return empty requests
    }).filter(request => request !== null); // Remove any null requests
  }

  // Call this method when you want to refresh the data
  refreshRequests() {
    this.loadAndFilterRequests();
  }

  hasActiveStatus(request: any): boolean {
    console.log('Request:', request);
    
    // List of all subdocuments with status
    const subdocuments = [
      request.extraBedDetails,
      request.earlyCheckInDetails,
      request.lateCheckInDetails,
      request.lateCheckOutDetails,
      request.earlyBreakfastDetails,
      request.amenities,
      request.specialServices,
      request.specialRequests
    ];
    
    // Check if at least one subdocument has a status that matches activeSection
    return subdocuments.some(subdoc => subdoc && subdoc.status === this.activeSection);
  }

  hasAnyActiveRequest(): boolean {
    return this.filteredRequestsData.some(request => this.hasActiveStatus(request));
  }
  
  
  
  
  
  
  
  

  
  

}