import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpModule} from '@angular/http'
import {HttpClientModule} from '@angular/common/http'
import { AppComponent } from './app.component';
import { CommunicationsService } from './communications.service';
import { ChartModule } from 'angular-highcharts';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    HttpModule,
    HttpClientModule,
    ChartModule 
  ],
  providers: [CommunicationsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
