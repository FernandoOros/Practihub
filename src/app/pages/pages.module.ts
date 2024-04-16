import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutsModule } from './layouts/layouts.module';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { MainPageComponent } from './main-page/main-page.component';
import { FormsModule } from '@angular/forms';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { RatingPageComponent } from './rating-page/rating-page.component';
import { OrganizationOpinionComponent } from './organization-opinion/organization-opinion.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";
import { ConsentFormComponent } from './consent-form/consent-form.component';


@NgModule({
  declarations: [
    PagesComponent,
    MainPageComponent,
    OrganizationListComponent,
    RatingPageComponent,
    OrganizationOpinionComponent,
    ConsentFormComponent
  ],
  imports: [
    CommonModule,
    LayoutsModule,
    PagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ]
})
export class PagesModule { }
