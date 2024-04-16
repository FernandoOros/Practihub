import { Component } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, FormArray} from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { CredentialResponse, PromptMomentNotification} from 'google-one-tap';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs';

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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  private idclient: string = environment.idclient;

  type:string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';
  registerForm!: FormGroup;

  constructor(private _form: FormBuilder,
    private _auth: AuthenticationService,
    private _router: Router
    ){}

  ngOnInit():void{
  
    this.registerForm = this._form.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this._router.events.pipe(
      filter((event: NavigationEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects === '/user/register') {
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
        callback: this.onSignUpGoogle.bind(this),
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
  

  onRegister(){
    if(this.registerForm.valid){
      console.log(this.registerForm.value)
      this._auth.signUp(this.registerForm.value).subscribe({
        next: (res) =>{
          alert(res.message)
          this.registerForm.reset();
          this._router.navigate(['/user/login']);
        },
        error:(err)=>{
          alert(err?.error.message)
        }
      })
    }else{
      this.validateAllFormFields(this.registerForm);
      alert("Los datos son inválidos")
    }
  }

  async onSignUpGoogle(response: CredentialResponse){

    this._auth.registerWithGoogle(response.credential).subscribe({
      next: (res) =>{
        alert(res.message)
        this._auth.storeToken(res.token);
        this.registerForm.reset();
        this._router.navigate(['/user/login']);
      },
      error:(err)=>{
        alert(err?.error.message)
      }
    })
}

  hideShowPassword(){
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = 'fa-eye-slash';
    this.isText ? this.type = "text" : this.type = "password"
  }


  private validateAllFormFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control: AbstractControl = formGroup.get(field)!; // '!' asserts that we get a non-null control.
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateAllFormFields(control as FormGroup); // Cast to FormGroup to satisfy TypeScript
      }
    });
  }

}
