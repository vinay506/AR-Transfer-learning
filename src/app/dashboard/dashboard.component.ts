import { environment } from './../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public equipData = [];
  public url;
  public compResponse;
  public compPerc;
  public equipPDF;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  perc(perc){
    this.compPerc = perc;
  }

  /**
   * For getting response from child component.
   * @param response : response from child gear component.   
   */
  response(response) {
    this.compResponse = response;
    
    console.log('');
    console.log('compPerc:');
    console.log(this.compPerc);

    this.getData();

    const url = './../../assets/response.json';
    this.http.get(url).subscribe((data) => {

      console.log('');
      console.log('data: ');
      console.log(data);
      console.log('');


    //   console.log('');
    //   console.log('response: ');
    //   console.log(response['label']);
    //   console.log('');
      
       this.equipData = data['Right-View'].data;
      //  this.getData();
      
    //   console.log('');
    //   console.log('equipData: ');
    //   console.log(this.equipData);
    //   console.log('');

    //   console.log('');
    //   console.log('compResponse: ');
    //   console.log(this.compResponse);
    //   console.log('');

    //   this.getData();

    }, (error) => {
      console.log('error ::::: ', error);
    });
  }
 
  /**
  * For getting the data from couchDB
  */
  getData() {
    var url = environment.path + environment.imageDocumentId;
    url = "./../../assets/ct.jpg"

    this.url = null;
    this.http.get(url).subscribe((data) => {
      
      console.log('data:');
      console.log(data);
      console.log('');
      console.log('compResponse:');
      console.log(this.compResponse);

      

     this.url = data[this.compResponse['label'].Id].imageUrl;
    //  this.equipPDF = data[this.compResponse['label'].Id].equipPDF;
      
    //   console.log(`ImageID: ${this.compResponse['label'].Id}`);
    //   console.log('');

    //   console.log('this.equipPDF: ');
    //   console.log(this.equipPDF);
    //   console.log('');
    //   console.log('');

    }, (error) => {

    });
  }


}
