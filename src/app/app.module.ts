import { AppConfirmModule } from './app-confirm/app-confirm.module';
import { AppLoaderModule } from './app-loader/app-loader.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GearComponent } from './gear/gear.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { TrainingComponent } from './training/training/training.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import 'hammerjs';


@NgModule({
  declarations: [
    AppComponent,
    GearComponent,
    HomeComponent,
    TrainingComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppLoaderModule,
    NoopAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppConfirmModule,
    MatInputModule,
    RouterModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
