import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/User';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';

  constructor(private router: Router) { }

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    let user: User = {
      email: this.email,
      roles: [],
      id: '',
      firstName: '',
      lastName: '',
      onboardingCompleted: false,
      platforms: []
    };
    if (this.email === 'admin@gmail.com' && this.password === 'admin') {
      this.error = '';
      user.roles = ['admin']; // temporary assignment
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['/dashboard']);
    } else if (this.email && this.password) {
      // Simulate a non-admin user login
      localStorage.setItem('user', JSON.stringify(user));
      this.error = '';
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
