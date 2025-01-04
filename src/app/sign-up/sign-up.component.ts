import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserService } from '../services/user.service';

interface SignupResponse {
  token: string;
}

interface SignupFormControls {
  username: AbstractControl;
  email: AbstractControl;
  phone: AbstractControl;
  password: AbstractControl;
  terms: AbstractControl;
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  signupForm: FormGroup & { controls: SignupFormControls };
  passwordFieldType: string = 'password';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.requiredTrue]  // New field for terms and conditions
    }) as FormGroup & { controls: SignupFormControls };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const user = this.signupForm.value;
    // After successful registration, set the username in the UserService
    this.userService.setUsername(user.username);
  

    this.http.post<SignupResponse>('http://localhost:3000/signup', user)
      .pipe(
        catchError(error => {
          this.errorMessage = error.error.message || 'An error occurred while registering the user.';
          return throwError(this.errorMessage);
        })
      )
      .subscribe(
        (response: SignupResponse) => {
          console.log('User registered successfully');
          const token = response.token;
          if (token) {
            this.userService.setToken(token);
            this.userService.emitToken(token);
          }
          this.successMessage = 'Sign up successful. You will be redirected shortly.';
          setTimeout(() => {
            this.router.navigate(['/signIn']);
          }, 3000);
        },
        error => {
          console.error('Error registering user', error);
        }
      );

      
      const username = this.signupForm.value.username;
      this.userService.setUsername(username);
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  get f() {
    return this.signupForm.controls;
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
      if (control.errors['requiredTrue']) {
        return 'You must agree to the terms and conditions';
      }
    }
    return null;
  }
}
