import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpResponse} from '@angular/common/http';
import { WebIntegrationsService } from 'src/app/services/web-integrations.service';
import { FormBuilder, FormGroup, Validators ,ValidationErrors, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, finalize, switchMap , tap} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-rating-page',
  templateUrl: './rating-page.component.html',
  styleUrls: ['./rating-page.component.css']
})
export class RatingPageComponent {
  organizationId:any;
  organizationInfo:any;
  services:any;
  opinionForm!: FormGroup;

  badWords: string[] = [
    'pene', 'puta', 'negro', 'chingar', 'cabrón', 'pendejo', 'mierda', 'verga', 'culero', 'pinche', 'joder', 'huevón',
    'cojones', 'chingada', 'maricón', 'chingado', 'chingón', 'mamada', 'puto', 'cagar', 'chingada madre', 'chingar a su madre',
    'puta madre', 'gilipollas', 'coño', 'pendejadas', 'cabrona', 'perra', 'hijo de puta', 'cojer', 'chinga tu madre',
    'chingón', 'marica', 'putita', 'culiado', 'culiadero', 'zorra', 'cagada', 'pendejeando', 'huevones', 'chingonas', 'mamon',
    'putón', 'putísimo', 'cabronear', 'mierdero', 'pajero', 'putón verbenero', 'culeros', 'mariconadas', 'chingársela',
    'verga', 'vergazo', 'vergon', 'vergonzoso', 'vergüenza', 'pelotudo', 'pendejez', 'pitorreo', 'polla', 'poronga', 'pendeja'
  ];


  constructor(
    private _route: ActivatedRoute, 
    private _service:WebIntegrationsService, 
    private fb: FormBuilder,
    private _router: Router,
    private _spinner: NgxSpinnerService,
    private _shared: SharedDataService,
    private _auth: AuthenticationService) {}


    ngOnInit() {
      this.organizationId = this._route.snapshot.paramMap.get('organizationid')?.toString();
      this._spinner.show(); // Show spinner before starting the requests
    
      this.getCurrentOrganization().pipe(
        switchMap(() => this.getServices()),
        finalize(() => this._spinner.hide()) 
      ).subscribe({
        error: (error) => {
          console.error('Error occurred:', error);
          this._spinner.hide(); 
        }
      });
      this.prepareForm();
    }
    
    getCurrentOrganization(): Observable<any> {
      const params = new HttpParams().set("organizationId", this.organizationId);
    
      return this._service.retrieve('Opinion/organization', params).pipe(
        tap((resp: any) => {

          this.organizationInfo = resp.body;
          if (this.organizationInfo == null || this.organizationInfo == '') {
            this._router.navigate(['/main-page/']);
            return;
          }
        }),
        catchError((error) => {
          if (error.status === 500) {
            this._router.navigate(['/main-page/']);
          }
          throw error;
        })
      );
    }
    
    getServices(): Observable<any> {
      return this._service.retrieve('Opinion/services').pipe(
        tap((resp: any) => {
          this.services = resp.body;
          if(this.services == null || this.services  =='' || resp.body.status == 500){
            this._router.navigate(['/main-page/']);
            return
          }
        })
      );
    }

  prepareForm(){
    this.opinionForm = this.fb.group({
      organizationId : this.organizationId,
      preparationType: ['', Validators.required],
      easeActivities: ['', Validators.required],
      environment: ['', Validators.required],
      help: ['', Validators.required],
      services: this.fb.array([]),
      comment: ['', Validators.required],
      email: this._shared.getUser()
    });
  }

  onSubmit() {
    if (this.opinionForm.valid) {
      const comment = this.opinionForm.get('comment')?.value;
      if (this.containsBadWords(comment)) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Your comment contains inappropriate language. Please remove any offensive words before submitting.',
        });
        return;
      }
  
      this._spinner.show();
      console.log(this.opinionForm.value);
  
      if (this._auth.isTokenExpired()) {
        this._router.navigate(['/user/login']);
        return;
      }
  
      this._service.executePostAuth('Opinion/opinion-submit', this.opinionForm.value).subscribe({
        next: (resp: any) => {
          this._spinner.hide();
          this._router.navigate(['/organization-opinions/', this.organizationId], {});
        },
        error: (error) => {
          console.error('Error:', error);
          this._spinner.hide();
        },
      });
    } else {
      alert('Error');
    }
  }  

  onServiceChange(event: any, serviceName: string) {
    const selectedServices = this.opinionForm.get('services') as FormArray;
    
    if (event.target.checked) {
      if (selectedServices.length < 3) {
        selectedServices.push(this.fb.control(serviceName));
      } else {
        event.target.checked = false;
      }
    } else {
      const index = selectedServices.value.findIndex((name: string) => name === serviceName);
      if (index > -1) {
        selectedServices.removeAt(index);
      }
    }
  }


  containsBadWords(comment: string): boolean {
    return this.badWords.some(badWord => comment.toLowerCase().includes(badWord.toLowerCase()));
  }
  
}


