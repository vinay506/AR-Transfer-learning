import { AppLoaderService } from './../app-loader/app-loader.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private loader: AppLoaderService,
    private router: Router) { }

  ngOnInit() {
  }

  goToPage(route) {
    this.loader.open();
    this.router.navigateByUrl(route);
  }

}
