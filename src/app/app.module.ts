import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ManageProfileComponent } from './manage-profile/manage-profile.component';
import { TestComponent } from './test/test.component';
import { CrudRoomComponent } from './crud-room/crud-room.component';
import { RoomDetailsComponent } from './room-details/room-details.component';
import { SidebarAdminComponent } from './sidebar-admin/sidebar-admin.component';
import { NavbarAdminComponent } from './navbar-admin/navbar-admin.component';
import { FasiitiesAdminServiceComponent } from './fasiities-admin-service/fasiities-admin-service.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardGuestComponent } from './dashboard-guest/dashboard-guest.component';
import { AdditonalRequestComponent } from './additonal-request/additonal-request.component';
import { ManageRequestComponent } from './manage-request/manage-request.component';
import { GuestNavbarComponent } from './guest-navbar/guest-navbar.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReviewRatingComponent } from './review-rating/review-rating.component';
import { ReserveHistoryComponent } from './reserve-history/reserve-history.component';
import { ManageRoomAvailabilityComponent } from './manage-room-availability/manage-room-availability.component';
import { ManagePaymentComponent } from './manage-payment/manage-payment.component';
import { ReportComponent } from './report/report.component';
import { OnsiteReservationComponent } from './onsite-reservation/onsite-reservation.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    NavbarComponent,
    SignInComponent,
    SignUpComponent,
    ManageProfileComponent,
    TestComponent,
    CrudRoomComponent,
    RoomDetailsComponent,
    SidebarAdminComponent,
    NavbarAdminComponent,
    FasiitiesAdminServiceComponent,
    DashboardComponent,
    DashboardGuestComponent,
    AdditonalRequestComponent,
    ManageRequestComponent,
    GuestNavbarComponent,
    ReservationComponent,
    ReviewRatingComponent,
    ReserveHistoryComponent,
    ManageRoomAvailabilityComponent,
    ManagePaymentComponent,
    ReportComponent,
    OnsiteReservationComponent


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule, // Add ReactiveFormsModule here
    // Other modules
    RouterModule.forRoot([
    { path: 'reset-password/:token', component: SignInComponent }, 
    { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
    { path: 'signIn', component:SignInComponent},
    { path: 'signUp', component:SignUpComponent},
    { path: 'manage-profile', component: ManageProfileComponent},
    { path: 'test', component: TestComponent},
    { path: 'crudRoom', component: CrudRoomComponent}, 
    {path: 'room-details', component: RoomDetailsComponent},
    { path: 'fasilitiesAndService', component:FasiitiesAdminServiceComponent},
    {path: 'dashboard', component:DashboardComponent},
    {path: 'dashboardGuest', component:DashboardGuestComponent}

    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
