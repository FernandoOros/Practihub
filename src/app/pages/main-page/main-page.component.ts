import { Component } from '@angular/core';
import { Router } from '@angular/router';


declare var particlesJS: any;


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {

  searchText!: string;

    constructor(private _router: Router) { }


      ngOnInit(): void {
        particlesJS.load('particles-js', 'assets/particles.json', function() {
          console.log('callback - particles.js config loaded');
        });
      }
      

    search() {
        if (this.searchText) {
            const searchTextLowercase = this.searchText.toLowerCase();
            this._router.navigate(['/organization-list', searchTextLowercase]);
        }
    }
}
