import {
  Component, ViewChild, ElementRef,
  AfterViewInit, ChangeDetectorRef, OnInit
} from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router'
import { param } from 'jquery';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
declare const Swal: any;

declare var window: any;



@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})



export class ReservationComponent implements OnInit {

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
    _id: ''
  };

  checkIn: Date | null = null;
  checkOut: Date | null = null;
  adults: Number | null = null;
  children: Number | null = null;

  token: string | null = null;

  rooms: any[] = [];

  roomId: string = '';
  roomType: string = '';
  roomDesc: string = '';
  roomImgUrl: string = '';

  reservation = {
    roomManageId: '',
    name: '',
    email: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 0,
    children: 0,
    roomType: '',
    roomDesc: '',
    total: 0,
    paymentMethod: '', // No default value



  };

  totalPrice = 0;

  constructor(private userService: UserService,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute) { }
    


  ngOnInit(): void {
    this.userService.tokenEmitter.subscribe((token: string) => {
      this.token = token;
      console.log('Token received:', this.token);
    });

    this.token = this.userService.getToken();
    if (this.token) {
      console.log('Token retrieved from storage:', this.token);
      this.fetchUserProfile();

      console.log('user: ', this.user)

    }

    this.fetchRooms();

    const roomDetails = JSON.parse(localStorage.getItem('roomDetails') || '{}');
    if (roomDetails) {
      this.roomType = roomDetails.roomType;
      this.roomDesc = roomDetails.roomDesc;
      this.roomImgUrl = roomDetails.roomImgUrl;
    }
  }
  fetchUserProfile() {
    this.userService.getUserProfile().subscribe(
      data => {
        this.user = data;
        console.log('User profile fetched:', this.user);
        this.reservation.name = this.user.username;
        this.reservation.email = this.user.email;
      },
      error => {
        console.error('Error fetching user profile:', error);
        error = 'Failed to fetch user profile. Please try again.';
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

  submitReservation() {
    console.log('usr', this.user);
    const total = this.calculateTotal();
    this.reservation.total = this.totalPrice;

    this.userService.getAvailability(this.reservation.roomType, this.reservation.checkInDate, this.reservation.checkOutDate).subscribe(
      (availability) => {
        // Check if any of the selected dates are closed or sold out
        const isDateAvailable = availability.every(item => item.status !== 'closed' && item.status !== 'sold-out');
  
        if (!isDateAvailable) {
          // If any date is closed or sold out, show an alert with SweetAlert2 and return early
          Swal.fire({
            icon: 'error',
            title: 'Dates Not Available',
            text: 'The selected dates are not available for booking. Please choose different dates.',
            confirmButtonText: 'Ok'
          });
          return; // Exit early if dates are not available, stop further execution
        }
  
// Add a payment method selection to the reservation object
if (!this.reservation.paymentMethod) {
  Swal.fire({
    icon: 'warning',
    title: 'Payment Method Required',
    text: 'Please select a payment method to proceed.',
    confirmButtonText: 'OK',
  });
  return;
}

  
    if (this.reservation.paymentMethod === 'On-site') {
      // Add confirmation before proceeding with On-site Payment
      Swal.fire({
        icon: 'question',
        title: 'Confirm On-site Payment',
        text: `Your total is ${this.totalPrice}. Are you sure you want to confirm your reservation with on-site payment?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, Confirm',
        cancelButtonText: 'Cancel',
      }).then((result: any) => {
        
        if (result.isConfirmed) {
          Swal.fire({
            icon: 'success',
            title: 'Reservation Confirmed!',
            text: 'Your reservation has been successfully created. Please complete the payment at the hotel.',
            confirmButtonText: 'OK',
          }).then(() => {
            this.userService.addReservation(this.reservation).subscribe({
              next: (response: any) => {
                console.log('Reservation saved for On-site Payment:', response);
                this.router.navigate(['/dashboardGuest']);
              },
              error: (error: any) => {
                console.error('Error saving reservation:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'There was an issue saving your reservation. Please try again.',
                  confirmButtonText: 'OK',
                });
              },
            });
          });
        } else {
          console.log('On-site Payment reservation cancelled by user.');
          Swal.fire({
            icon: 'info',
            title: 'Reservation Cancelled',
            text: 'Your reservation has not been submitted.',
            confirmButtonText: 'OK',
          });
        }
      });
  
    } else if (this.reservation.paymentMethod === 'online') {
      // Handle "Online Payment" logic
      Swal.fire({
        icon: 'question',
        title: 'Confirm Reservation',
        text: `Your total is ${this.totalPrice}. Do you want to proceed with the reservation?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel',
      }).then((result: any) => {
        if (result.isConfirmed) {
          const paymentPayload = {
            orderId: `ORDER-${Date.now()}`, // Unique order ID
            amount: this.totalPrice,
            customerDetails: {
              userId: this.user._id, // Fetch user ID from service or session
            },
          };
  
          this.userService.createTransaction(paymentPayload).subscribe(
            (transaction: any) => {
              window.snap.pay(transaction.token, {
                onSuccess: (result: any) => {
                  console.log('Payment successful:', result);
  
                  // Proceed to submit reservation after successful payment
                  this.userService.addReservation(this.reservation);
                  this.userService.makeReservation(this.reservation).subscribe({
                    next: (response) => {
                      if (!response.success && response.warning) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'No Availability',
                          text: response.warning,
                          confirmButtonText: 'OK',
                        });
                      } else {
                        Swal.fire({
                          icon: 'success',
                          title: 'Reservation Successful!',
                          text: 'Your reservation and payment have been successfully completed.',
                          showCancelButton: true,
                          confirmButtonText: 'Download Receipt',
                          cancelButtonText: 'Go to Dashboard',
                        }).then((result: unknown) => {
                          if (result && (result as any).isConfirmed) {
                            this.downloadReceipt();
                          }
                          setTimeout(() => {
                            this.router.navigate(['/dashboardGuest']);
                            console.log('Redirected to dashboard');
                          }, 2000); // 20 seconds delay
                        });
                      }
                    },
                    error: (error) => {
                      console.error('Error creating reservation:', error);
                      Swal.fire({
                        icon: 'warning',
                        title: 'Error',
                        text: 'There was an issue creating your reservation. Please try again.',
                        confirmButtonText: 'OK',
                      });
                    },
                  });
                },
                onError: (error: any) => {
                  console.error('Payment failed:', error);
                  Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: 'Your payment could not be processed. Please try again.',
                    confirmButtonText: 'OK',
                  });
                },
                onClose: () => {
                  console.log('Payment popup closed.');
                },
              });
            },
            (error: any) => {
              console.error('Error creating transaction:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to initiate payment. Please try again.',
                confirmButtonText: 'OK',
              });
            }
          );
        } else {
          console.log('Reservation cancelled by user.');
          Swal.fire({
            icon: 'info',
            title: 'Reservation Cancelled',
            text: 'Your reservation has not been submitted.',
            confirmButtonText: 'OK',
          });
        }
      });
    }
  },
  (error) => {
    console.error('Error checking availability:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while checking availability. Please try again later.',
      confirmButtonText: 'Ok'
    });
  }
);
  }
  


  // submitReservation() {
  //   const total = this.calculateTotal();
  //   this.reservation.total = total;

  //   // Add reservation to the UserService
  //   this.userService.addReservation(this.reservation);
  //   alert('Reservation successful!');

  //   console.log('Reservation data being sent:', this.reservation); // Debugging line

  //   this.userService.makeReservation(this.reservation).subscribe({
  //     next: (response) => {
  //       console.log('Reservation successful:', response);
  //       alert('Reservation successful!');
  //       this.router.navigate(['/dashboardGuest']); // Redirect user after success
  //     },
  //     error: (error) => {
  //       console.error('Error creating reservation:', error);
  //       alert('Error creating reservation. Please try again.');
  //     } 
  //   });
  // }

  onRoomTypeChange() {
    const selectedRoom = this.rooms.find(room => room.roomType === this.reservation.roomType);
    if (selectedRoom) {
      this.reservation.roomDesc = selectedRoom.roomDesc;
      this.reservation.roomManageId = selectedRoom._id
      this.calculateTotal();  // Recalculate total price
    }
  }

  onDateChange() {
    this.calculateTotal();
  }


  // calculateTotal(): number {
  //   const basePrice = 100; // Example base price per night
  //   const nights = Math.ceil(
  //     (new Date(this.reservation.checkOutDate).getTime() -
  //       new Date(this.reservation.checkInDate).getTime()) /
  //       (1000 * 60 * 60 * 24)
  //   );
  //   return nights * basePrice;
  // }

  calculateTotal() {
    const { roomType, checkInDate, checkOutDate } = this.reservation;

    if (roomType && checkInDate && checkOutDate) {
      this.userService.calculateTotal(roomType, checkInDate, checkOutDate).subscribe(
        (response) => {
          this.totalPrice = response.total;
        },
        (error) => {
          console.error('Error fetching total price:', error);
          this.totalPrice = 0;
        }
      );
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/landing-page']);
  }








  downloadReceipt(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Calculate stay duration
    const checkIn = new Date(this.reservation.checkInDate);
    const checkOut = new Date(this.reservation.checkOutDate);
    const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const unitPrice = this.totalPrice / duration; // Calculate unit price per night
    const receiptNumber = `UHB-${Date.now()}`; // Unique receipt number
    const receiptDate = new Date().toLocaleDateString('en-US'); // Current date
  
    // Add company logo
    this.convertImageToBase64('assets/Images/logo.png')
      .then((base64Img) => {
        const logoWidth = 40;
        const logoHeight = 20;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(base64Img, 'PNG', logoX, 10, logoWidth, logoHeight);
      })
      .catch((error) => {
        console.error('Error loading logo image:', error);
      })
      .finally(() => {
        let yPos = 40;
  
        // Company Info
        doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor('#ffa500');
        doc.text(' U House Bali ', pageWidth / 2, yPos, { align: 'center' });
  
        yPos += 7;
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#333333');
        doc.text(
          '• Seminyak, Bali  • +62 813-3878-7766  • uhousebali@gmail.com',
          pageWidth / 2,
          yPos,
          { align: 'center' }
        );
  
        // Separator line
        yPos += 5;
        doc.setFillColor("#ffa500");
        doc.setDrawColor(200, 200, 200).line(20, yPos, pageWidth - 20, yPos);
  
        // Receipt Title
        yPos += 10;
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor('#ffa500');
        doc.text('RECEIPT', pageWidth - 20, yPos, { align: 'right' });
  
        // Receipt Details
        yPos += 10;
        doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#000000');
        doc.text('Receipt', pageWidth - 70, yPos);
        doc.text(receiptNumber, pageWidth - 20, yPos, { align: 'right' });
  
        yPos += 5;
        doc.text('Receipt Date', pageWidth - 70, yPos);
        doc.text(receiptDate, pageWidth - 20, yPos, { align: 'right' });
  
        // Billed To Section
        yPos += 15;
        doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#ffa500');
        doc.text('Paid By', 20, yPos);
  
        yPos += 5;
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#000000');
        doc.text(this.reservation.name, 20, yPos);
        yPos += 5;
        doc.text(this.reservation.email, 20, yPos);
  
        // Booking Details Section
        yPos += 15;
        doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#ffa500');
        doc.text('Booking Details', 20, yPos);
  
        const bookingDetails = [
          { label: 'Check-in:', value: checkIn.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
          { label: 'Check-out:', value: checkOut.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
          { label: 'Guests:', value: `${this.reservation.adults} adults, ${this.reservation.children} children` },
          { label: 'Unit:', value: this.reservation.roomType },
        ];
  
        yPos += 7;
        bookingDetails.forEach((detail) => {
          doc.setFont('helvetica', 'normal').setTextColor('#000000');
          doc.text(detail.label, 20, yPos);
          doc.text(detail.value, 60, yPos);
          yPos += 5;
        });
// Table Header with lines
yPos += 10;
doc.setDrawColor(255, 165, 0); // Line color: #ffa500
doc.setLineWidth(0.5);
doc.line(20, yPos - 5, pageWidth - 20, yPos - 5); // Top line of header

// Header text
doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#000000');
doc.text('Quantity', 25, yPos);
doc.text('Description', 60, yPos);
doc.text('Unit Price', 120, yPos);
doc.text('Amount', 160, yPos);

// Bottom line of header
yPos += 5;
doc.line(20, yPos, pageWidth - 20, yPos);

// Table Rows
const items = [
  { qty: duration, description: `Nights in ${this.reservation.roomType}`, unitPrice: `$${unitPrice.toFixed(2)}`, amount: `$${this.totalPrice.toFixed(2)}` },
];

yPos += 10;
items.forEach((item) => {
  doc.setFont('helvetica', 'normal').setTextColor('#000000');
  doc.text(item.qty.toString(), 25, yPos);
  doc.text(item.description, 60, yPos);
  doc.text(item.unitPrice, 120, yPos);
  doc.text(item.amount, 160, yPos);

  yPos += 10;
  doc.line(20, yPos, pageWidth - 20, yPos); // Line after each row
});

// Total Row
yPos += 5;
doc.line(20, yPos, pageWidth - 20, yPos); // Top line of total section
yPos += 10;

doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#000000');
doc.text('Total', 120, yPos);
doc.text(`$${this.totalPrice.toFixed(2)}`, 160, yPos, { align: 'right' });

yPos += 5;
doc.line(20, yPos, pageWidth - 20, yPos); // Bottom line of total section


  
        // Footer Note
        yPos += 15;
        doc.setFontSize(10).setFont('helvetica', 'italic').setTextColor('#333333');
        doc.text('Thank you for staying with us. We look forward to your next visit!', pageWidth / 2, yPos, { align: 'center' });
  
        // Add Paid Stamp
        this.convertImageToBase64('assets/Images/paid.png')
          .then((base64Paid) => {
            const stampWidth = 50;
            const stampHeight = 50;
            const stampX = (pageWidth - stampWidth) / 2;
            yPos += 10;
            doc.addImage(base64Paid, 'PNG', stampX, yPos, stampWidth, stampHeight);
  
            // Save the PDF
            doc.save(`Receipt_${receiptNumber}.pdf`);
          })
          .catch((error) => {
            console.error('Error loading paid image:', error);
          });
      });
  }
  
  

// Helper function to convert image to Base64
convertImageToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (error) => {
      console.error('Failed to load image:', url, error);
      reject(error);
    };
    img.src = url;
  });
}

onPaymentMethodChange(): void {
  console.log('Payment method selected:', this.reservation.paymentMethod);
}

  

}