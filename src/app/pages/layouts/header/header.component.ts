import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchText!: string;
  userEmail!: string | null;  // Property to store the user's email

  constructor(private _router: Router, private _auth: AuthenticationService) { }

  ngOnInit() {
    this.fetchEmail();
  }

  fetchEmail() {
    this.userEmail = this._auth.getEmailFromToken(); // Fetch email from token
    console.log("este es el email" , this._auth.getEmailFromToken())
  }

  search() {
      if (this.searchText) {
          const searchTextLowercase = this.searchText.toLowerCase();
          this._router.navigate(['/organization-list', searchTextLowercase]);
      }
  }

  logOut(){
    this._auth.signOn();
    this._router.navigate(['/login']); // Redirect to login after logout
  }
}
