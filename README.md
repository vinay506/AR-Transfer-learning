# Clone & NPM Install
Please clone the repo and run 'npm install' inside the project folder, before running the application..

Here are the updates in the application...

Make sure you install 'angular-file-saver' to install files into your local machine.

# Angular-Wrapper
We've changed the approach from HTML-DIV-iFRAME to Angular Child Component. The child component can be called from ngOnInit method (of the parent component), as per suggestion.

# With/Without Test Button
The application camera starts rendering without the need a TEST button. However, during our testing, we've seen the performance/accuracy has gone down significantly if the camera is continuosly detecting. So, we have included a TEST button - to demo the difference in performance.

Additionally, placing markers on camera has increased the overall performance, while auto detecting. 

# API Calls
We've included methods to 2 API calls - both GET and POST. The APIs can be called whenever necessary by simply accessing these methods.

# Child Component Params
We've included the Width & Height params for Child Componenet - which can be set from the Parent Component; however we'd adjusted the CSS of the application to ensure alighment of objects is proper.

# Destroy
We've included an onDestroy override method which will be called when the component is destroyed. The canvas is removed from the DOM when this method is called.

# Front/Back Camera
In order to access the Laptop Camera, in the Sketch Setup method, for Constraints object, comment the following part...

facingMode: 
{
    exact: "environment" 
},
in "src/app/training/training/training.components.ts"
In order to access the iPad Back Camera, uncomment the same and check.

# Accuracy
For optimal performance, we've set the Accuracy Point to 0.9 (90%). Increasing it would make the browser camera slower and reduce performance. Decreasing it would make the detection inaccurate, accordingly. In our experience, 0.9 is pretty decent value to test at.


tail -100 /var/log/nginx/error.log

# Couch DB Setup 
Install couch db into your machine and setup db .
Make sure the db name should be "db-target" and document id should be "12ba4d6fd94552b362af104ccd0009fb".
Be sure to place the below code in your "local.ini" file to avoid cors issue in web-db integration.

[httpd]
enable_cors = true

[cors]
origins = *
credentials = true

# Model Saving 
Make sure your model should be saved into "src/assets"