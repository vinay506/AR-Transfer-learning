import { AppConfirmService } from '../../app-confirm/app-confirm.service';
import { environment } from '../../../environments/environment';
import { AppLoaderService } from '../../app-loader/app-loader.service';
import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, NgForm } from '@angular/forms';
import * as FileSaver from 'file-saver';

declare let ml5: any;
import * as p5 from 'p5';
import "p5/lib/addons/p5.dom";
// import { EROFS } from 'constants';



@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit, AfterViewInit {

  public mobileNetFeatureExtractor;
  public featureClassifier;
  public equipId;
  @ViewChild('video', { static: true }) public video: ElementRef;
  @ViewChild('canvas', { static: true }) public canvas: ElementRef;

  @ViewChild('captcha', { static: true }) public captcha: ElementRef;

  @ViewChild('dynamicForm', { static: true }) dynamicForm: NgForm;
  public captures: Array<any>;
  public currentCapture: any;
  public currentSketch: any;
  public equipName;
  public equipDirection;
  public response = {};
  private documentData;
  private demoObj = {};
  private defaultCanvas;
  private addOnImgCount = 5;
  public directions = ['Front-View', 'Left-View', 'Right-View'];
  public isTrained: boolean = true;
  public labels = [3, 4, 5, 6, 7, 8, 9, 10];
  public accuracy = [90, 91, 92, 93, 94, 95, 96, 97, 98, 99];
  public numOfLabels = 3;
  public accPercentages = 90;
  public isShow = false;
  private cameraEnvironment = "user";
  public metaDataObject = {};
  public frameWidth = 800;
  public frameHeight = 600;
  public _sketch;
  private mouseBox = {};
  private _draw = 'none';
  private quad : any;
  private rightViewImg;
  private sampleImg;
  private samplePdf;
  


  constructor(private zone: NgZone,
    private loader: AppLoaderService,
    private http: HttpClient,
    private confirm: AppConfirmService) {
    this.captures = [];
  }

  ngOnInit(): void {
    
    this.addSketchElement();

    
    this.mobileNetFeatureExtractor = ml5.featureExtractor('MobileNet', () => {
      this.featureClassifier = this.mobileNetFeatureExtractor.classification(this.video.nativeElement, {
        topk: 3,
        learningRate: 0.0001,
        hiddenUnits: 100,
        epochs: 30,
        numLabels: 1000,
        batchSize: 0.4
      }, () => {
        console.log('Ready..');

        
        this.getData();  
        
        this.updateID();
            
      });
    });

  }

  addSketchElement(){
    this.captcha = new p5(this.skecth);    
  }

  
  /**
   * For adding the images for training.
   */
  addImage() {
    this.currentSketch = null;

    this.isShow = true;
    // this.zone.run(() => {
    //   this.loader.open();
    // });

    // this.canvas.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, 320, 240);
    // this.captures.push(this.canvas.nativeElement.toDataURL('image/png'));
    
    this.demoObj['equipId'] = this.equipId;
    this.demoObj['equipName'] = this.equipName;
    this.demoObj['equipDirection'] = 'left';


    

    if (this.equipId && this.equipName) {
      
     
      var img = this._sketch.createImg(this.sampleImg, () => {});
      img.hide();

      for(var i = 0; i < this.addOnImgCount; i++){

        console.log('this.demoObj: ');
        console.log('this.demoObj: ');
        console.log('this.demoObj: ');
        console.log('this.demoObj: ');
        console.log(this.demoObj);
        this.featureClassifier.addImage(img.elt, JSON.stringify(this.demoObj), (res) => {
          
        }).catch((ex) => {
          console.log(`addImage: ${ex}`);
        })
      }
      
      
      const vidElement = img.elt;
      this.capture(vidElement);        
      
       
    }
  }

  public capture(imgObj) {
    
    this._draw = "none";
    this.canvas.nativeElement.getContext('2d').drawImage(imgObj ? imgObj : this.video.nativeElement, 0, 0, this.frameWidth, this.frameHeight);
    
    this.currentCapture = this.sampleImg //this.canvas.nativeElement.toDataURL('image/png'); 

    this.captures.push(this.currentCapture);

    
    this.metaDataObject[this.demoObj['Id']] = {
      "imageUrl": this.currentCapture,
      "equipPDF": this.samplePdf
    };

    

    // for(let index = 0; index < this.addOnImgCount ; index++){
    
    //   this.featureClassifier.addImage(this.currentCapture, JSON.stringify(this.demoObj), () => {
    //     console.log(`#${index} Added Image..`);                             
    //   }).catch((ex) => {
    //     console.log(`addImage: ${ex}`);
    //   })
    // }

    // this.zone.run(() => {
    //   setTimeout(() => {
    //     this.loader.close();
    //   }, 1000);
    // });
    console.log('image added.')

    
  }

  /**
   * For training the application by using added images.
   */
  train() {
    this.loader.open();
    console.log('train called');
    this.featureClassifier.train((loss) => {
      if (loss == null) {
        console.log('Training completed.');
        this.loader.close();
        this.isTrained = false;
        this.openConfirm('SUCCESS', 'Training completed.');
        console.log('featureClassifier: ', this.featureClassifier);
      }
    });
  }

  public ngAfterViewInit() {
    console.log(webkitURL);
    if (/Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)) {
      this.cameraEnvironment = 'environment';
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: this.cameraEnvironment === 'environment' ? { facingMode: { exact: this.cameraEnvironment } } : true
      }).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
      });
    }
  }

  /**
   * For capturing the images. 
   */
  



  /**
   * For testing the application training.
   */
  test() {
    this.mobileNetFeatureExtractor.classify(this.video.nativeElement)
      .then((results) => {
        console.log(`${results[0].label} : ${results[0].confidence * 100}`);
        if ((results[0].confidence * 100) >= this.accPercentages) {
          this.zone.run(() => {
            this.response = JSON.parse(results[0].label);
          });
        } else {
          this.zone.run(() => {
            this.test();
          });
        }
      }).catch((err) => {
        console.log('Some error has occured', err);
      });
  }

  /**
   * For getting the model.json and model.weight.bin file.
   */
  saveModel() {
    this.zone.run(() => {
      this.loader.open();
    });

    console.log('getting into mobilefeatureextractor.save')
    this.mobileNetFeatureExtractor.save((bin, json) => {
      console.log("printing bin value");
      console.log(bin)
      console.log(json)
      console.log('getting into uploadmodel');
       this.savelocal(bin, json);
      this.uploadModel(bin, json);
      console.log('model uploaded.');
    }, "model");
  }
  savelocal(weights, json) {
    // var local = this
      var data_bin = new Blob([weights], {type: 'text/plain, charset=utf-8'});
      var data_json = new Blob([json], {type: 'text/plain; charset=utf-8'});
      FileSaver.saveAs(data_bin, 'model.weights.bin');
      FileSaver.saveAs(data_json, 'model.json');
      // local.openConfirm('File succesfully saved to your local drive.')
  }

  /**
   * For selecting the file.
   * @param event : seleted file 
   */
  selectFile(event) {
    if (event.target.files && event.target.files[0]) {
      //this.formData = event.target.files[0];
      console.log('file ::::::::::: ', event.target.files);
      //this.uploadModel();
    }
  }

  /**
   * For getting the data from couchDB
   */
  getData() {
    const url = environment.path + environment.documentId;
    this.http.get(url).subscribe((data) => {
      console.log('Data  : : : : ::  : :', data);
      this.documentData = data;
      this.zone.run(() => {
        this.loader.close();
      });
    }, (error) => {
      console.log(`Error: ${JSON.stringify(error)}`);

      this.zone.run(() => {
        this.openConfirm('ERROR', 'Failed to connect to couchDB, please reload the app.')
      });
    });
  }


  /**
   * For uploading the model.json file to couchDB
   */
  uploadModel(formDataObj, formJsonObj) 
  {
    console.log('up..');
    const url = environment.path + (this.documentData['_id'] ? this.documentData['_id'] : this.documentData['id']) + '/' + formDataObj.name + '?rev=' + (this.documentData['_rev'] ? this.documentData['_rev'] : this.documentData['rev']);
    console.log(url);
    const headers = new HttpHeaders();
    headers.set('content-type', 'application/json');
    headers.set('Accept', 'application/json');
    // this.http.get(url).subscribe((response) => 
    // {
    console.log('into put');
    this.http.put(url, formDataObj, { headers }).subscribe((response) => 
      {
        console.log('in put');
        this.documentData = response;
        console.log(this.documentData);
        console.log(response);
        console.log('entering into uploadjson');
        this.uploadJSON(formJsonObj);
        console.log('uploaded')
      }, (error) => {
        this.zone.run(() => 
        {
          this.loader.close();
          this.openConfirm('ERROR', 'Failed to upload ' + formDataObj.name);
        });
      });
    // }, (error) => {
// 
    // });
  }


  /**
   * Foe uploading model.weight.bin file
   */
  uploadJSON(formJsonObj)
  {
    console.log('into uploadjson');
    const url = environment.path + (this.documentData['_id'] ? this.documentData['_id'] : this.documentData['id']) + '/' + formJsonObj.name + '?rev=' + (this.documentData['_rev'] ? this.documentData['_rev'] : this.documentData['rev']);
    const headers = new HttpHeaders();
    headers.set('content-type', 'application/json');
    headers.set('Accept', 'application/json');
    let that = this;
    // this.http.get(url).subscribe((response) => 
    // {
      console.log('into put1');
      this.http.put(url, formJsonObj, { headers }).subscribe((response) => 
      {
        console.log('in put1');
        this.documentData = response;
        console.log(this.documentData)
        console.log('getting ino insert image data');
        this.insertImageData();
        console.log('success callback  :::::::::   ', response);
        this.zone.run(() => 
        {
          this.loader.close();
          this.openConfirm('SUCCESS', 'Files uploaded successfully to server. ');
        });   
      }, 
        (error) => 
      {
        this.zone.run(() => 
        {
          this.loader.close();
          this.openConfirm('ERROR', 'Failed to upload file ' + formJsonObj.name);
        });
      });
    // },(error) => {

    // });
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
   * For reloading the page.
   */
  reload() {
    window.location.reload();
  }

  insertImageData() {
    console.log('into imagedata insertion');
    const headers = new HttpHeaders();
    headers.set('content-type', 'application/json');
    headers.set('Accept', 'application/json');
    const url = environment.path + environment.imageDocumentId;
    console.log('OK')
    console.log(url)
    // console.log(this.data)
    console.log("into get image");
    this.http.get(url).subscribe((data) => {
      console.log("in get");
      this.metaDataObject['_rev'] = data['_rev'];
      this.http.put(url, this.metaDataObject, { headers }).subscribe((data) => {
        console.log('data ::::: ', data);
      }, (error) => {
        console.log('error ::::: ', error);
      });

    }, (error) => {

    });
  }

  ngOnDestroy() {
    this.video.nativeElement.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

 

  private skecth = s => {
    var xLoc = 30;
    var yLoc = 30;
    var addPoint = false;

    var _index = 0;
    var addedImg = null;
    var addImageBtn = null;
    var selectBtn = null;
    var annotateBtn = null;

   
    s.setup = () => {

      let canv = s.createCanvas(this.frameWidth, this.frameHeight).parent("sketchy");
      
      console.log('canv');
      console.log(canv);

      s.background(88, 88, 44, 44);
      s.fill(255);

      this._sketch = s;
      

      if(addImageBtn == null){

        let xLoc = canv.position().x;
        let yLoc =  canv.position().y + canv.height + 5;

        yLoc = canv.position().y;
        
        selectBtn = s.createButton('SELECT').parent("sketchButton");
        selectBtn.hide();
        selectBtn.position(xLoc, yLoc);
        selectBtn.mousePressed(() => {
          this._draw = 'start';                        
          console.log(`selectBtn mousePressed: ${this._draw}`);          
        });


        annotateBtn = s.createButton('POINTS').parent("sketchButton");
        annotateBtn.position(xLoc, yLoc);
        annotateBtn.mousePressed(() => {   
          _index = -1;
          s.fill(222);
          this._draw = 'none';      
          addPoint = true;
        }); 
       

        addImageBtn = s.createButton('ADD').parent("sketchButton");
        addImageBtn.position(((xLoc + canv.width) - addImageBtn.width), yLoc);
        addImageBtn.mousePressed(() => {   
          this._draw = 'none';      
          this.createImgFromCanvas();
          addPoint = false;

          xLoc = 30;
          yLoc = 30;
          addPoint = false;
          
          addedImg = null;
          addImageBtn = null;
          this.currentCapture  = null;
          this.currentSketch  = null;
          
          _index = 0;

        });
      }
      


      addPoint = false;
    }

    s.draw = () => {    
     if(this.currentCapture != null){

        if(this.currentSketch == null){
           this.currentSketch = s.createImg (this.currentCapture, () => {
            console.log('Create Image complete..');
            // s.imageMode(s.CENTER);
            addedImg = s.image (this.currentSketch, 0, 0, this.frameWidth, this.frameHeight);
 
          });       
          
          this.currentSketch.hide();     
          return;       
          
        }                        
      } 
      
      if(this._draw === 'completed'){
        s.strokeWeight(0.2);
        s.stroke(255);
        s.noFill();


        this._sketch.quad(
          this.mouseBox['x1'], this.mouseBox['y1'],
          this.mouseBox['x2'], this.mouseBox['y2'],
          this.mouseBox['x3'], this.mouseBox['y3'],
          this.mouseBox['x4'], this.mouseBox['y4']          
        );

        this.createImgFromCanvas();

        console.log('called..');
      } 

      if(addPoint && _index > 0){
        s.textSize(22);
        s.textFont('Verdana');
        s.text(`${_index}`, xLoc, yLoc);
        s.square(xLoc, yLoc + 2, 15);                          
      }

      

    }

    let _touchIndex = 0;
    let quad;
    s.mousePressed = () => {       

      if(this._draw === 'start'){
        this._draw = 'begin';
        return;
      }

      if(this._draw === 'begin'){
        console.log('mousePressed');
        console.log(s.mouseX, s.mouseY);

        switch(_touchIndex){
          case 0:
            this.mouseBox['x1'] = s.mouseX;
            this.mouseBox['y1'] = s.mouseY;
            break;
          
          case 1:
            this.mouseBox['x2'] = s.mouseX;
            this.mouseBox['y2'] = this.mouseBox['y1'];
            break;
          
          case 2:
            this.mouseBox['x3'] = this.mouseBox['x2'];
            this.mouseBox['y3'] = s.mouseY;

            this.mouseBox['x4'] = this.mouseBox['x1'];
            this.mouseBox['y4'] = this.mouseBox['y3'];

            console.log('this.mouseBox: ');
            console.log(this.mouseBox);
   
            
            this._draw = 'completed';  
            
            break;
          
          
        }
        
        _touchIndex += 1;

        if(_touchIndex > 2){
          _touchIndex = 0;
        }

      } else {
        _touchIndex = 0;
      }

      
      

      if(this.currentSketch != null){
        _index += 1;
        xLoc = s.mouseX;
        yLoc = s.mouseY;
        console.log('Click');
        console.log(xLoc, yLoc);                
      }      
    }
    
  }

  createImgFromCanvas = () => {
    
    this._draw = "none";
    this.defaultCanvas = <HTMLCanvasElement> document.getElementById('defaultCanvas0');

    
    const xFactor = 0;
    for(let index = 0; index < 1 ; index++){

      
      let width = (this.mouseBox['x2'] - this.mouseBox['x1']) - (xFactor * 2 * index);
      let height = (this.mouseBox['y4'] - this.mouseBox['y1'])  - (xFactor * 2 * index)

      let c = this._sketch.get(this.mouseBox['x1'] + (xFactor * index), this.mouseBox['y1'] + (xFactor * index), width, height);
      //this._sketch.image(c, 0, 0, (this.mouseBox['x2'] - this.mouseBox['x1']), (this.mouseBox['y4'] - this.mouseBox['y1']), this.mouseBox['x1'], this.mouseBox['y1'], (this.mouseBox['x2'] - this.mouseBox['x1']), (this.mouseBox['y4'] - this.mouseBox['y1']))
     
      
      let scaledImg = this.defaultCanvas.toDataURL('image/png', () => {
        this.currentCapture = scaledImg;
        this.currentSketch = null;


      });

      // this.featureClassifier.addImage(scaledImg, JSON.stringify(this.demoObj), () => {        
      //   console.log(`#${index} Added Image..`);               
      // }).catch((ex) => {
      //   console.log(`addImage: ${ex}`);
      // })
      
      this.captures.push(scaledImg);

      this.currentSketch = null;
      this.currentCapture = scaledImg;

     

      console.log('this.demoObj[Id]');
      console.log(this.demoObj['Id']);
      console.log(this.demoObj['Id']);
      console.log(this.demoObj['Id']);console.log(this.demoObj['Id']);console.log(this.demoObj['Id']);console.log(this.demoObj['Id']);

      this.metaDataObject[this.demoObj['Id']] = {
        "imageUrl": scaledImg,
        "equipPDF": this.samplePdf
      };

      this.updateID();
    }
    
    console.log('Image Added...');
    
  }

  
  onCaptureClick = (e) => {
    console.log('onCaptureClick');
    console.log(e);

    if(this.captures && this.captures[e]){
      this.currentSketch = null;
      this.currentCapture = this.captures[e];

      this.metaDataObject[this.demoObj['Id']] = {
        "imageUrl": this.captures[e]
      };
    }
  }

  onAdd(event: any) {
    console.log(event);
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();

        reader.onload = (event:any) => {
            this.sampleImg= event.target.result;           
        }

        reader.readAsDataURL(event.target.files[0]);
    }
  }

  onAddPdf(event: any) {
    console.log(event);
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();

        reader.onload = (event:any) => {
            this.samplePdf= event.target.result;                       

            console.log('this.samplePdf: ');
            console.log(this.samplePdf);

        }

        reader.readAsDataURL(event.target.files[0]);
    }
  }

  updateID = () => {
    const ID = Math.floor((Math.random() * 1000) + 1);
    console.log(`ID Applied: ${ID}`);
    console.log(`ID Applied: ${ID}`);
    console.log(`ID Applied: ${ID}`);
    console.log(`ID Applied: ${ID}`);


    this.demoObj['Id'] = ID;
  }
 
}

