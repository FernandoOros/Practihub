import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpResponse} from '@angular/common/http';
import { WebIntegrationsService } from 'src/app/services/web-integrations.service';
import { finalize, switchMap , tap} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Token } from '@angular/compiler';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import Swal from 'sweetalert2';

interface Opinion {
  opinionId: string;
  preparationType:string;
  easeActivities: number;
  environment: number;
  help: number;
  comment:string;
  average?: number;
  imageToShow?: string;
  services:[any];
  submitIn:any;
}

@Component({
  selector: 'app-organization-opinion',
  templateUrl: './organization-opinion.component.html',
  styleUrls: ['./organization-opinion.component.css']
})
export class OrganizationOpinionComponent {

  organizationId:any;
  organizationDetail:any;
  organizationServices:any;
  opinions!: Opinion[];

  constructor(
    private _route: ActivatedRoute, 
    private _service:WebIntegrationsService, 
    private _router:Router,
    private _spinner: NgxSpinnerService,
    private _shared: SharedDataService,
    private _auth: AuthenticationService) {
  
  }

  ngOnInit() {
    this.organizationId = this._route.snapshot.paramMap.get('organizationid')?.toString();
  
    this._spinner.show();
    this.getCurrentOrganization().pipe(
      switchMap(() => this.getServicesOrganization()),
      switchMap(() => this.getOpinionsOrganization()),
      finalize(() => this._spinner.hide())
    ).subscribe({
      error: (error) => {
        // Handle error
        console.error('Error occurred:', error);
        this._spinner.hide();
      }
    });
  }
  getCurrentOrganization(): Observable<any> {
    const params = new HttpParams().set("organizationId", this.organizationId);
    this._shared.setId(this.organizationId);
  
    return this._service.retrieve('Opinion/organization-detail', params).pipe(
      tap((resp: any) => {
        this.organizationDetail = resp.body;
        console.log(this.organizationDetail);
      })
    );
  }
  
  getServicesOrganization(): Observable<any> {
    const params = new HttpParams().set("organizationId", this.organizationId);
    this._shared.setId(this.organizationId);

    return this._service.retrieve('Opinion/organization-services', params).pipe(
      tap((resp: any) => {
        this.organizationServices = resp.body;
        console.log(this.organizationServices);
      })
    );
  }
  
  getOpinionsOrganization(): Observable<any> {
    const params = new HttpParams().set("organizationId", this.organizationId);
    this._shared.setId(this.organizationId);
  
    return this._service.retrieve('Opinion/opinions', params).pipe(
      tap((resp: any) => {
        console.log(resp.body)
        this.opinions = resp.body;
        this.opinions.forEach(opinion => {
          opinion.average = this.calculateAverage(
            opinion.easeActivities,
            opinion.environment,
            opinion.help
          );
          opinion.imageToShow = this.getImageBasedOnAverage(opinion.average);
        });
      })
    );
  }

  calculateAverage(ease: number | string, environment: number | string, help: number | string): number {
    let numEase = typeof ease === 'string' ? parseFloat(ease) : ease;
    let numEnvironment = typeof environment === 'string' ? parseFloat(environment) : environment;
    let numHelp = typeof help === 'string' ? parseFloat(help) : help;
    return (numEase + numEnvironment + numHelp) / 3;
  }
  

  getImageBasedOnAverage(average: number): string {
    if (average >= 4) {
      return './assets/images/happy.png';
    } else if (average >= 3) {
      return './assets/images/neutral.png';
    } else if (average >= 2) {
      return './assets/images/sad.png'
    } else {
      return './assets/images/sad.png';
    }
  }

  navigateToRate(){
    /*this._router.navigate(['/rating/', this.organizationId], {});*/

    if(this._auth.isTokenExpired()){
      this._router.navigate(['/user/login/']);
    }else{
      console.log(this._shared.getId())
      this._router.navigate(['/rating/', this._shared.getId()])
    }
    
  }


  reportOpinion(opinionId: string): void {
    // Sweet Alert confirmation dialog
    Swal.fire({
      title: '¿Estás seguro de querer reportar esta valoración  ?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, reportar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // User confirmed the action
        console.log("report button", opinionId);
        const params = new HttpParams().set("opinionId", opinionId);
        this._service.retrieve('Opinion/report', params).pipe(
          tap((resp: any) => {
            console.log(resp.body);
          }),
          switchMap(() => this.getOpinionsOrganization()) // Switch to the getOpinionsOrganization observable
        ).subscribe({
          next: () => {
            console.log('Opinions updated:', this.opinions);
          },
          error: (error) => {
            console.error('Error reporting opinion:', error);
          }
        });
      }
    });
  }
  
}

