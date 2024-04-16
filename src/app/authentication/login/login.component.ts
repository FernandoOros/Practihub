import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs';
import { SharedDataService } from 'src/app/services/shared-data.service';

// google-one-tap.d.ts
declare namespace google {
  namespace accounts {
    namespace id {
      function initialize(config: any): void;
      function renderButton(parent: Element, options: any): void;
      function prompt(momentListener?: (notification: any) => void): void;
    }
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private idclient: string = environment.idclient;

  loginForm!: FormGroup;

  type: string = 'password'
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash'

  constructor(
    private _form: FormBuilder,
    private _auth: AuthenticationService,
    private _router: Router,
    private _shared: SharedDataService
  ) {}

  ngOnInit(): void {
    this.loginForm = this._form.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this._router.events.pipe(
      filter((event: NavigationEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects === '/user/login') {
        this.initializeGoogleOneTap();
      }
    });

    this.initializeGoogleOneTap();
  }

  private initializeGoogleOneTap(): void {
    // Remove any existing Google One Tap script
    const existingScript = document.getElementById('google-one-tap-script');
    if (existingScript) {
      existingScript.remove();
    }
  
    // Create a new script element
    const script = document.createElement('script');
    script.id = 'google-one-tap-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      // Initialize Google One Tap once the script is loaded
      google.accounts.id.initialize({
        client_id: this.idclient,
        callback: this.onLoginGoogle.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
  
      const buttonDiv = document.getElementById("button-google");
      if (buttonDiv) {
        google.accounts.id.renderButton(
          buttonDiv,
          { theme: "outline", size: "large", width: "100%" }
        );
      } else {
        console.error('Element with ID "buttonDiv" not found.');
      }
  
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
    };
    document.head.appendChild(script);
  }
  

  onLogin() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value)
      this._auth.logIn(this.loginForm.value).subscribe({
        next: (res) => {
          alert(res.message)
          this._auth.storeToken(res.token);
          this._shared.setUser(res.email);
          this.loginForm.reset();
          this._router.navigate(['/rating/', this._shared.getId()]);
        },
        error: (err) => {
          alert(err?.error.message)
        }
      })
    } else {
      this.validateAllFormFields(this.loginForm);
      alert("Los datos son inválidos")
    }
  }

  async onLoginGoogle(response: CredentialResponse) {
    this._auth.loginWithGoogle(response.credential).subscribe({
      next: (res) => {
        alert(res.message)
        this._auth.storeToken(res.token);
        this._shared.setUser(res.email);
        console.log(res)
        this.loginForm.reset();
        this._router.navigate(['/rating/', this._shared.getId()]);
      },
      error: (err) => {
        alert(err?.error.message)
      }
    })
  }

  private validateAllFormFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control: AbstractControl = formGroup.get(field)!;
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateAllFormFields(control as FormGroup);
      }
    });
  }

  hideShowPassword() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = 'fa-eye-slash';
    this.isText ? this.type = "text" : this.type = "password"
  }
}
