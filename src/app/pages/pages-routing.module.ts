import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { MainPageComponent } from './main-page/main-page.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { OrganizationOpinionComponent } from './organization-opinion/organization-opinion.component';
import { RatingPageComponent } from './rating-page/rating-page.component';
import { authGuard } from '../guards/auth.guard'; // Import the authGuard
import { ConsentFormComponent } from './consent-form/consent-form.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '', // Default route
        component: MainPageComponent
      },
      {
        path: 'organization-list/:organization',
        component: OrganizationListComponent
      },
      {
        path: 'organization-opinions/:organizationid',
        component: OrganizationOpinionComponent
      },
      {
        path: 'rating/:organizationid',
        component: RatingPageComponent,
        canActivate: [authGuard] // Apply the authGuard only to this route
      },
      {
        path: 'privacy',
        component: ConsentFormComponent
      },
      {
        path: '**', // Wildcard route for a 404 page
        redirectTo: '', // Redirect to MainPageComponent
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
