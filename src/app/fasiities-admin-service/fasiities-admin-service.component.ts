import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacilitiesService } from '../services/facilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fasiities-and-service',
  templateUrl: './fasiities-admin-service.component.html',
  styleUrls: ['./fasiities-admin-service.component.css']
})
export class FasiitiesAdminServiceComponent implements OnInit {

  facilitiesForm: FormGroup;
  facilitiesList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private facilitiesService: FacilitiesService,
    private router: Router
  ) {
    this.facilitiesForm = this.fb.group({
      roomType: ['', Validators.required],
      parking: [false],
      swimmingPool: [false],
      airConditioner: [false],
      balcony: [false],
      towel: [false],
      bathAmenities: [false],
      sunBed: [false],
      outdoorShower: [false]
    });
  }

  ngOnInit(): void {
    this.getFacilities();
  }

  getFacilities(): void {
    this.facilitiesService.getFacilities().subscribe(
      (data: any) => {
        this.facilitiesList = data;
        if (this.facilitiesList.length > 0) {
          this.setFormData(this.facilitiesList[0]); // Set form with the first facility
        }
      },
      (error: any) => {
        console.error('Failed to fetch facilities', error);
      }
    );
  }

  setFormData(facility: any): void {
    this.facilitiesForm.patchValue({
      roomType: facility.roomType,
      parking: facility.facilities.parking,
      swimmingPool: facility.facilities.swimmingPool,
      airConditioner: facility.facilities.airConditioner,
      balcony: facility.facilities.balcony,
      towel: facility.facilities.towel,
      bathAmenities: facility.facilities.bathAmenities,
      sunBed: facility.facilities.sunBed,
      outdoorShower: facility.facilities.outdoorShower
    });
  }

  addFacility(): void {
    if (this.facilitiesForm.invalid) {
      return;
    }

    const facilityData = {
      roomType: this.facilitiesForm.value.roomType,
      facilities: {
        parking: this.facilitiesForm.value.parking,
        swimmingPool: this.facilitiesForm.value.swimmingPool,
        airConditioner: this.facilitiesForm.value.airConditioner,
        balcony: this.facilitiesForm.value.balcony,
        towel: this.facilitiesForm.value.towel,
        bathAmenities: this.facilitiesForm.value.bathAmenities,
        sunBed: this.facilitiesForm.value.sunBed,
        outdoorShower: this.facilitiesForm.value.outdoorShower
      }
    };

    this.facilitiesService.addFacility(facilityData).subscribe(
      (response: any) => {
        console.log('Facility added successfully', response);
        this.getFacilities();
        this.facilitiesForm.reset();
      },
      (error: any) => {
        console.error('Failed to add facility', error);
      }
    );
  }
}
