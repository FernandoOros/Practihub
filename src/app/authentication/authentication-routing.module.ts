import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path:'login',
    component:LoginComponent
  },
  {
    path: '',
    redirectTo:'login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  }
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
