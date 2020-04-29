import { environment } from './../../environments/environment';
import { AppLoaderService } from './../app-loader/app-loader.service';
import { AppConfirmService } from './../app-confirm/app-confirm.service';
import { Component, OnInit, Input, NgModule, Output, EventEmitter ,NgZone} from '@angular/core';
import * as p5 from 'p5';
import "p5/lib/addons/p5.dom";
declare const ml5: any;
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-gear',
  templateUrl: './gear.component.html',
  styleUrls: ['./gear.component.scss']
})

 

export class GearComponent implements OnInit {
  @Output() response = new EventEmitter();
  @Output() perc = new EventEmitter();
  @Input() modelResponse = [];
  @Input() numLabels: number = 3;
  @Input() accurayPercentages: number = 99.995;
  @Input() canvasHeight: number;
  @Input() canvasWidth: number;
  @Input() scannedImg: any;
  @Input() equipPDF: any;

  private video: any;
  private mobilenet: any;
  private classifier: any;
  private modelUrl;
  private turbineModel: any;
  private rightViewImg: any;
  private leftViewImg: any;
  private frontViewImg: any;
  private isLoaded: boolean = false;
  private isShowModel: boolean = false;
  private detectedObj: any;
  private canvaPositionX: any;
  private canvaPositionY: any;
  private headerLabelDiv: any;
  private lableArray = [];
  private instructionLabelDiv: any;
  private closeButton: any;
  private testModelButton: any;
  private ellipseWidth: number = 80;
  private ellipseHeight: number = 80;
  private canvas: any;
  public apiResponse;
  private currentImage: any;
  private currentVideo: any;
  private canvasReference: any;

  public frameWidth = 600;
  public frameHeight = 375;

  public pdfData;
  public currentPDF = "-";
  public currentSide = "-";

  private documentData;

  public pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  private angles = [30, 10, 45, 35, 60, 38, 75, 67];

  

  constructor(private loaderService: AppLoaderService, 
    private http: HttpClient,private zone:NgZone,private confirm:AppConfirmService) {
    this.loaderService.open();
    // this.modelUrl = environment.path + environment.documentId + '/model.json';
    this.modelUrl = './../../assets/model1.json';
  }

  ngOnInit() {
    
    this.getData();
    
    this.canvas = new p5(this.sketch); // creating instance of p5.js.

    
    //console.log('ngOnInit...');
    
  }

   /**
   * For opening the confirmation popup.
   * @param title : title for popup
   * @param message : message for popup
   */
  openConfirm(title, message) {
    this.confirm.confirm(title, message, 'Ok');
  }

  
  /**
   * For getting the data from couchDB
   */
  getData() {
    const url = environment.path + environment.documentId;
    this.http.get(url).subscribe((data) => {
      console.log('Data  : : : : ::  : :',JSON.stringify(data));
      this.documentData = data;
      this.zone.run(() => {
        this.loaderService.close();
      });
    }, (error) => {
      console.log(`Error: ${JSON.stringify(error)}`);

      this.zone.run(() => {
        this.openConfirm('ERROR', 'Failed to connect to couchDB, please reload the app.')
      });
    });
  }




  /**
   * For initialising the p5.js preload,setup and draw method. 
   */
  private sketch = (sketch) => {

    //console.log('sketch called...');

    /**
     * For loading all the assets before setup get called. 
     */
    sketch.preload = () => {
      //console.log('sketch preload...');
      this.turbineModel = sketch.loadModel('./../../assets/turbine.obj');
      this.rightViewImg = sketch.loadImage('./../../assets/ct.jpg');
      this.leftViewImg = sketch.loadImage('./../../assets/left-view.png');
      this.frontViewImg = sketch.loadImage('./../../assets/x.jpg');
      sketch.loadFont('./../../assets/avenir.otf');

      

      //console.log('this.frontViewImg: ');
      //console.log(this.frontViewImg);
    }

    /**
     * For instantiate the DOM and it will get called after preload.
     */
    sketch.setup = () => {
      //console.log('sketch setup...');
      this.frameWidth = this.canvasWidth ? this.canvasWidth : sketch.windowWidth;
      this.frameHeight = this.frameWidth;

      let constraints = this.getContraints();
      this.video = sketch.createCapture(constraints, (stream) => {
        
      });

      //console.log('mobilenet setup...');
      this.mobilenet = ml5.featureExtractor('MobileNet', {  topk: 3,
        learningRate: 0.0001,
        hiddenUnits: 100,
        epochs: 30,
        numLabels: 1000,
        batchSize: 0.4 }, () => {
        //console.log('classifier setup...');
        this.classifier = this.mobilenet.classification(this.video, () => {
          //console.log('classifier load called...');
          this.classifier.load(this.modelUrl, () => {
            this.video.hide();
            //console.log('Set Up Complete.. ');
            this.isLoaded = true;
            this.addCanvas(sketch);

            //console.log('classifier: ');
            //console.log(this.classifier);

          })
          .catch((ex)=>{
            //console.log('Failed to connect couchDb :::: ', ex);
          })
        });
      });

      

      this.video.hide();
      this.addTestModelButton(sketch);
    };

    /**
     * For rendering the ui and it will get call continuously.
     */
    sketch.draw = () => {
      if (this.isLoaded) {        
        // sketch.background(200);


        if (this.isShowModel) {
          let imgWidth = this.frameWidth * 0.5;

          // if(this.currentVideo){
          //   this.currentVideo.hide();
          // }

          // if(this.currentImage == null && this.scannedImg != null){
            if(this.currentImage == null){
            // //console.log('currentImage');
            
            this.currentImage = sketch.createImg (this.scannedImg, () => {
              
              sketch.image (this.currentImage, (0 - this.frameWidth / 2), (0 - this.frameHeight / 2), this.frameWidth, this.frameHeight);                   
            }); 


            this.currentImage.hide();
            this.labels(sketch);
            
          }
        }

        this.currentVideo = sketch.image(this.video, (0 - this.frameWidth / 2), (0 - this.frameHeight / 2), this.frameWidth, this.frameHeight);                   

        

        this.canvas.fill(300, 300, 300);
      }

     
    };

  }


   /**
   * For adding the close button.
   * @param sketch : reference of p5.js.
   */
  private addCloseButton(sketch) {
    this.closeButton = sketch.createButton('x');
    this.closeButton.parent('divContainer');
    this.closeButton.position(10, 10);
    this.closeButton.mousePressed(() => {
      this.isShowModel = false;
      this.currentImage = null;
      this.scannedImg = null;
      this.removeCloseButton();
      this.hideLables();

      // this.showPdf();

    });
    this.closeButton.size(this.ellipseWidth/2, this.ellipseHeight/2);
    this.closeButton.parent('divContainer');
  }

  /**
   * For hiding the labels. 
   */
  private hideLables() {
    if (this.lableArray && this.lableArray.length > 0) {
      for (var i = 0; i < this.lableArray.length; i++) {
        this.lableArray[i].remove();
      }
    }
  }


  

  /**
   * For creating canvas 
   * @param sketch :reference of p5.js
   */
  private addCanvas = (sketch) => {
    //console.log('addCanvas...');
    this.canvasReference = sketch.createCanvas(this.frameWidth, this.frameHeight, sketch.WEBGL);
    this.canvaPositionX = (sketch.windowWidth - sketch.width) / 2;
    this.canvaPositionY = (sketch.windowHeight - sketch.height) / 2;
    this.canvasReference.parent('divContainer');
    this.loaderService.close();
    // this.testModel(sketch);
  }

  /**
   * For testing the trained model. 
   * @param sketch : reference of p5.js
   */
  private testModel(sketch) {
    var checkPoint = 99;//this.accurayPercentages;
    this.classifier.classify(this.video)
      .then((obj) => {

        //console.log('getting current image..');
       this.currentImage = obj[0].label.imgToPredict;
       

        this.detectedObj = obj[0];

        this.detectedObj.label = JSON.parse(this.detectedObj.label);
        let perc = `${this.detectedObj.label.equipId}: ${(this.detectedObj.confidence) * 100}%`;
        this.perc.emit(perc);
        

        //console.log(`Label: ${JSON.stringify(this.detectedObj.label)}`);
        //console.log((this.detectedObj.confidence * 100));

        
        if(this.detectedObj.label.equipId === 'face'){
          checkPoint = 70;
          
        } else
        {
          checkPoint = 95;//this.accurayPercentages;
        }

        

        
        if ((this.detectedObj.confidence * 100) > checkPoint) {   

          if(this.currentPDF !== this.detectedObj.label.equipId){            
            this.isShowModel = true;    
                
          } else {
            this.isShowModel = false;
          }

          this.currentPDF = this.detectedObj.label.equipId; 
          
        } else {
          this.isShowModel = false;
        }

        

      }).catch((err) => {
        //console.log(err);
      }).then(() => {
        if (!this.isShowModel) {
          this.testModelButton.hide();   
          
          this.currentImage = null;
          this.scannedImg = null;

          // this.testModel(sketch);    
          
        } else {

          
          this.modelResponse = [];
          this.response.emit(this.detectedObj);                    

          this.addCloseButton(sketch);  
        }  

        
         
        setTimeout(() => {
          console.log('setTimeout');
          this.testModel(sketch);    
        },
        100);
        
        
        
      });
  }

  /**
   * For creating labels according to the detailed response of detected object.
   * @param sketch : reference of p5.js
   */
  labels(sketch) {

    
    this.hideLables();
    let y = 65;
    let divHeight = 60;
    let divWidth = (this.frameWidth) * 0.4;
    let col = sketch.color(0, 0, 0, 200);
    this.headerLabelDiv = sketch.createDiv(`INSTRUCTIONS FOR: ${this.detectedObj.label.equipId}`);
    this.headerLabelDiv.style('background-color', col);
    this.headerLabelDiv.style('font-family', 'avenir');
    this.headerLabelDiv.style('color', 'white');
    this.headerLabelDiv.style('padding', '10px');
    this.headerLabelDiv.style('right', '0');

    this.headerLabelDiv.size(divWidth, 30);
    this.headerLabelDiv.position(this.frameWidth - (divWidth + (this.frameWidth * 0.01)), 10);
    this.headerLabelDiv.style('left', 'auto');

    
    var img = './../../assets/b1.jpg';

    if(this.currentPDF == "face"){
      img = './../../assets/f1.jpeg';
    }

    let inner = `<img src=${img} width="100%" height="200px" (click)="showPdf()"/>`;
    let pdf = sketch.createDiv(inner);
    pdf.parent(this.headerLabelDiv);

    

    this.headerLabelDiv.parent('instructionDiv');
    this.lableArray.push(this.headerLabelDiv);

    y += pdf.height;

    const url = './../../assets/response.json';
    this.http.get(url).subscribe((data) => {
      console.log('model response');
      console.log(data);

      this.modelResponse = data['Right-View'].data;

      for (var index = 0; index < this.modelResponse.length; index++) {
        let str = this.modelResponse[index].label + '. ' + this.modelResponse[index].info;
        this.instructionLabelDiv = sketch.createDiv(str);
        this.instructionLabelDiv.style('background-color', col);
        this.instructionLabelDiv.style('font-family', 'avenir');
        this.instructionLabelDiv.style('color', 'white');
        this.instructionLabelDiv.style('padding', '10px');
        this.instructionLabelDiv.style('right', '0');
  
        this.instructionLabelDiv.size(divWidth, divHeight);
        this.instructionLabelDiv.position(this.frameWidth - (divWidth + (this.frameWidth * 0.01)), y);
        this.instructionLabelDiv.style('left', 'auto');
        y += (divHeight + 5);
        str = '';
        this.instructionLabelDiv.parent('instructionDiv');
        this.lableArray.push(this.instructionLabelDiv);
      }
    })



    
  }

 

  /**
   * For remove the close button from DOM.
   * @param btn : reference of button. 
   * @param sketch : reference of p5.js.
   */
  private removeCloseButton() {
    if(this.closeButton){
      this.closeButton.hide();  
    }
    
    // this.testModelButton.show();
    // this.testModel(sketch);
  }

  //For Testing Model...
  private addTestModelButton(sketch) {
    this.testModelButton = sketch.createButton('Test');
    this.testModelButton.parent('divContainer');
    this.testModelButton.position(this.frameWidth - this.ellipseWidth - 10, 10);
    this.testModelButton.mousePressed(() => {
      this.onTestModelClick(sketch);
    });
    this.testModelButton.size(this.ellipseWidth, this.ellipseHeight);
    this.testModelButton.parent('divContainer');
    // this.testModelButton.hide();
  }

  private onTestModelClick(sketch) {
    this.testModelButton.hide();
    this.isShowModel = false;
    this.testModel(sketch);
  }



  /**
   * For http service call.
   * @param sketch :reference of  p5.js
   */
  private apiGetCall(sketch) {
    const api = 'http://demo3746538.mockable.io/consumptionOperations%3FsourceMaterialLotId=6&workOrderId=2';
    sketch.httpGet(api, 'json', false, (success) => {
      //console.log('success from http call :::::: ', success);
      this.apiResponse = success;
    }, (error) => {
      //console.log('error from http call :::::: ', error);
    });
  }

  /**
   * For http post call by using p5.js inbuilt methods.
   * @param sketch :reference of p5.js
   */
  private apiPostCall(sketch) {
    sketch.httpPost('https://reqres.in/api/users', 'json', { "name": "morpheus", "job": "leader" }, (success) => {
      //console.log('success from http call :::::: ', success);
      // self.response.emit(success);
    }, (error) => {
      //console.log('error from http call :::::: ', error);
    });
  }

  /**
   * For checking the device to open the camera.
   */
  getContraints() {
    let constraints = {};
    if (/Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)) {
      return constraints = {
        video: {
          facingMode: {
            exact: 'environment'
          },
          mandatory: {
            minWidth: 1024,
            minHeight: 786
          },
          optional: [{ maxFrameRate: 60 }]
        },
        audio: false,
      };
    } else {
      return constraints = {
        video: {
          optional: [{ maxFrameRate: 60 }]
        },
        mandatory: {
          minWidth: 1280,
          minHeight: 720
        },
        audio: false,
        aspectRatio: 4 / 3
      };
    }
  }

  ngOnDestroy() {
    this.canvas.remove();
    this.video.elt.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

  showPdf() {

    console.log('srcPDF: ');
  //console.log(srcPDF);

      const linkSource = this.scannedImg; //'data:application/pdf;base64,';
      const downloadLink = document.createElement("a");
      const fileName = "sample.pdf";

      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
  }


}
