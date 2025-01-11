import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacilitiesService } from '../services/facilities.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fasiities-admin-service',
  templateUrl: './fasiities-admin-service.component.html',
  styleUrls: ['./fasiities-admin-service.component.css'],
})
export class FasiitiesAdminServiceComponent implements OnInit {
  facilitiesForm: FormGroup;
  facilitiesList: any[] = [];
  rooms: string[] = []; // To hold the room types fetched from the backend
  roomTypes: any[] = []; // To hold the full room type objects

  constructor(
    private fb: FormBuilder,
    private facilitiesService: FacilitiesService,
    private userService: UserService,
    private router: Router
  ) {
    // Initialize the form
    this.facilitiesForm = this.fb.group({
      roomTypeId: ['', Validators.required], // Add roomTypeId to the form
      /*
       * Engga butuh roomType, karena udah berelasi sama roomManage dari roomTypeId. Delete aja.
       * Author: @VV
       */
      // roomType: ['', Validators.required],
      parking: [false],
      swimmingPool: [false],
      airConditioner: [false],
      balcony: [false],
      towel: [false],
      bathAmenities: [false],
      sunBed: [false],
      outdoorShower: [false],
    });
  }

  ngOnInit(): void {
    this.getRoomsType();
    this.getFacilities();
  }

  // Fetch available room types from backend
  getRoomsType(): void {
    this.userService.getRooms().subscribe({
      next: (rooms: any[]) => {
        this.roomTypes = rooms;
      },
      error: (error) => {
        console.error('Failed to fetch room types', error);
      },
    });
  }

  onRoomTypeChange(): void {
    const roomTypeId = this.facilitiesForm.get('roomTypeId')?.value;
    if (roomTypeId) {
      this.getFacilityByRoomTypeId(roomTypeId);
    }
  }

  getFacilityByRoomTypeId(roomTypeId: string): void {
    this.facilitiesService.getFacilityByRoomTypeId(roomTypeId).subscribe({
      next: (facility: any) => {
        this.setFormData(facility);
      },
      error: (error) => {
        console.error('Failed to fetch facility for room type', error);
      },
    });
  }

  setFormData(facility: any): void {
    if (!facility) {
      console.error('Invalid facility data:', facility);
      return;
    }

    this.facilitiesForm.patchValue({
      roomTypeId: facility.roomTypeId,
      roomType: facility.roomType,
      parking: facility.parking || false,
      swimmingPool: facility.swimmingPool || false,
      airConditioner: facility.airConditioner || false,
      balcony: facility.balcony || false,
      towel: facility.towel || false,
      bathAmenities: facility.bathAmenities || false,
      sunBed: facility.sunBed || false,
      outdoorShower: facility.outdoorShower || false,
    });
  }

  getFacilities(): void {
    this.facilitiesService.getFacilities().subscribe({
      next: (data: any[]) => {
        console.log('Facilities fetched successfully:', data);
      },
      error: (error) => {
        console.error('Failed to fetch facilities', error);
      },
    });
  }

  addFacility(): void {
    if (this.facilitiesForm.invalid) return;
    const facilityData = this.facilitiesForm.value;

    this.facilitiesService.addFacility(facilityData).subscribe({
      next: (response: any) => {
        console.log('Facility added successfully', response);
        this.facilitiesForm.reset();
        this.getFacilities();
      },
      error: (error) => {
        console.error('Failed to add facility', error);
      },
    });
  }

  updateFacility(): void {
    if (this.facilitiesForm.invalid) return;

    const updatedFacilityData = this.facilitiesForm.value;
    const roomTypeId = updatedFacilityData.roomTypeId;

    this.facilitiesService
      .updateFacility(roomTypeId, updatedFacilityData)
      .subscribe({
        next: (response: any) => {
          console.log('Facility updated successfully', response);
          this.facilitiesForm.reset();
          this.getFacilities();
        },
        error: (error) => {
          console.error('Failed to update facility', error);
        },
      });
  }
}

// dropdown nya ngefetch get all ke room management (nanti show di dropdown semua room yang tersedia)
// siapin data facilities yang di centang
// simpannya ke table faciliities 1, dan ke table room manage
