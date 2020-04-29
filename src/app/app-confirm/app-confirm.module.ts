import { NgModule } from '@angular/core';
import {
  MatDialogModule,
  MatButtonModule
} from '@angular/material';



import { AppConfirmComponent } from './app-confirm.component';
import { AppConfirmService } from './app-confirm.service';

@NgModule({
  imports: [
    MatButtonModule,
    MatDialogModule
  ],
  exports: [AppConfirmComponent],
  declarations: [AppConfirmComponent],
  providers: [AppConfirmService],
  entryComponents: [AppConfirmComponent]
})
export class AppConfirmModule { }
