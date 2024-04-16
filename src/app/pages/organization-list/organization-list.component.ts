import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpResponse} from '@angular/common/http';
import { WebIntegrationsService } from 'src/app/services/web-integrations.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css']
})
export class OrganizationListComponent {
  searchResult!: any;
  matchedOrganizations: any;
  private routeSub!: Subscription;

  constructor(
    private _route: ActivatedRoute, 
    private _service:WebIntegrationsService, 
    private _router:Router,
    private _spinner: NgxSpinnerService
    ) { 
      
    }

  ngOnInit() {
    this.searchResult = this._route.snapshot.paramMap.get('organization')?.toString();
    this.routeSub = this._route.paramMap.subscribe(params => {
      this.searchResult = params.get('organization')?.toString() || '';
      this.searchOrganization();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  searchOrganization(){
    const params = new HttpParams().set("organization", this.searchResult.toString());

    this._spinner.show();

    this._service.retrieve('Opinion/search-organization', params).subscribe({
      next: (resp: any) => {
        this.matchedOrganizations = resp?.body ?? []; // Default to an empty array if undefined
        console.log(this.matchedOrganizations);
        this._spinner.hide();
      },
      error: (error) => {
        console.error('Error:', error);
        this._spinner.hide(); 
      }
    });
  }    

  navigateToOrganizationOpinions(organizationId: any) {
    this._router.navigate(['/organization-opinions/', organizationId], {});
  }
}