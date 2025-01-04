import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserService } from '../services/user.service';
import * as bootstrap from 'bootstrap'; // Import Bootstrap JavaScript
declare const Swal: any;


interface SigninResponse {
  token: string;
  role: string;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  signinForm: FormGroup;
  resetPasswordForm: FormGroup;
  generalError: string = '';
  successMessage: string = '';
  token: string = '';
  errorMessage: string = '';
  isResetPasswordMode: boolean = false;
  forgotPasswordEmail: string = '';
  forgotPasswordMessage: string = '';
  forgotPasswordError: string = '';
  

  @ViewChild('forgotPasswordModal') forgotPasswordModal!: ElementRef; // Definite assignment assertion

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.params['token'] || '';
    this.isResetPasswordMode = !!this.token;
  }

  onSubmit() {
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    const credentials = this.signinForm.value;

    this.http.post<SigninResponse>('http://localhost:3000/login', credentials)
      .pipe(
        catchError(error => {
          this.generalError = error.error.message || 'Invalid credentials. Please try again.';
          return throwError(this.generalError);
        })
      )
      .subscribe(
        (response: SigninResponse) => {
          console.log('Login successful');
          const token = response.token;
          const role = response.role;
          if (token) {
            this.userService.setToken(token);
            this.userService.emitToken(token);
          }
          this.successMessage = 'Login successful! Redirecting...';
          setTimeout(() => {
            switch (role) {
              case 'admin':
                this.router.navigate(['/dashboard']);
                break;
              case 'guest':
                this.router.navigate(['/dashboardGuest']);
                break;
              default:
                console.error('Unknown role:', role);
            }
          }, 3000); // Redirect after 3 seconds
        },
        error => {
          console.error('Error logging in', error);
        }
      );
  }

  get f() {
    return this.signinForm.controls;
  }

  getError(control: AbstractControl): string | null {
    if (control.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['email']) {
        return 'Invalid email format';
      }
      if (control.errors['minlength']) {
        return `Password must be at least ${control.errors['minlength'].requiredLength} characters long.`;
      }
    }
    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    return form.controls['password'].value === form.controls['confirmPassword'].value ? null : { mismatch: true };
  }

  onResetPassword() {
    if (this.resetPasswordForm.invalid) {
      return;
    }
  
    const password = this.resetPasswordForm.value.password;
  
    this.http.post(`http://localhost:3000/reset-password/${this.token}`, { password })
      .subscribe(
        response => {
          console.log('Password reset successful', response);
          this.successMessage = 'Password reset successful! You can now log in with your new password.';
          this.router.navigate(['/signIn']);  // Redirect to sign-in page after successful reset
        },
        error => {
          console.error('Error resetting password', error);
  
          // Handling specific error scenarios for user feedback
          if (error.status === 400) {
            if (error.error.message.includes('invalid or has expired')) {
              this.errorMessage = 'The password reset token is invalid or has expired. Please request a new password reset.';
            } else {
              this.errorMessage = 'Bad request. Please try again.';
            }
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        }
      );
  }
  

  openForgotPasswordModal(): void {
    const email = this.signinForm.get('email')?.value;
    if (!email) {
      this.generalError = 'Please enter your email to reset password';
      return;
    }
    this.forgotPasswordEmail = email;
    const modal = new bootstrap.Modal(this.forgotPasswordModal.nativeElement);
    modal.show();
  }

  onForgotPasswordSubmit() {
    this.userService.forgotPassword(this.forgotPasswordEmail).subscribe(
      response => {
        // Success case
        this.forgotPasswordMessage = 'Password reset email sent';
        this.forgotPasswordError = '';

        Swal.fire({
          icon: 'success',
          title: 'Password Reset Link Sent!',
          text: 'Please check your email to reset your password.',
          confirmButtonColor: '#90693e'
        });
      },
      error => {
        // Error case
        this.forgotPasswordError = 'Error sending password reset email';
        this.forgotPasswordMessage = '';

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:  'Something went wrong. Please try again later.',
          confirmButtonColor: '#90693e'
        });
      }
    );
  }
}