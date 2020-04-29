import { DashboardComponent } from './dashboard/dashboard.component';
import { TrainingComponent } from './training/training/training.component';
import { HomeComponent } from './home/home.component';
import { GearComponent } from './gear/gear.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: 'scanning', component: GearComponent },
  { path: 'home', component: HomeComponent },
  { path: 'videoTraining', component: TrainingComponent },
  { path: 'dashboard', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
