import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

import fs from 'fs';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  app.get( "/filteredimage/", async ( req, res ) => {

    // The URL is pulled from the query.
    let image_url:string = req.query.image_url.toString();
    let filteredpath: Promise<string> = filterImageFromURL(image_url);
    let filepath: string = '';

    // The image is retrieved, saved locally and prepared for display.
    const promiseRequest: Promise<void> = new Promise(async resolve => {
      filepath = (await filteredpath);
      res.status(200).sendFile(filepath);
    });

    // The request is given 10 seconds to return a response...
    const promiseTimeLimit: Promise<string> = new Promise(async resolve => {
      setTimeout(resolve, 10000, 'fail');
    });

    // ...and if the time limit expires, an error response is returned.
    Promise.race([promiseRequest, promiseTimeLimit]).then((result) => {
      if(result == 'fail') {
        res.status(404).send("The requested image was not found.")
      }
    });

    // The rest of the function body is for cleaning up the local tmp folder.
    const fs = require('fs');
    const topPath = __dirname + "/util/tmp/";
    fs.readdir(topPath, (err: any, files: Array<string>) => {
      if(err) {
        res.send("Nada mucho.");
      }
      else {
        let arrPaths: Array<string> = [];
        files.forEach(file => {
          arrPaths.push(topPath + file);
        });
        deleteLocalFiles(arrPaths);
      }
    });
  } );

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
