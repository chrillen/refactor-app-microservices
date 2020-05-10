import fs from 'fs';
import Jimp = require('jimp');
import { NextFunction } from 'connect';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';


// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
     return new Promise( async (resolve, reject) =>   {
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        return await Jimp.read(inputURL).then(image => {
        return image.resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname+outpath, (img) => {
            resolve(__dirname+outpath);
        });
      }).catch(reject);
    });
}


// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

// requireAuth
// helper function validate jwt tokens in header
// INPUTS
//   Request: from client, Response: back to client, NextFunction: used for skip routes in express.
export function requireAuth(req: Request, res: Response, next: NextFunction) {

  if (!req.headers || !req.headers.authorization){
      return res.status(401).send({ message: 'No authorization headers.' });
  }

 const token_bearer = req.headers.authorization.split(' ');
 const token = token_bearer[1].split(',')[0];

  return jwt.verify(token , config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
    }
    return next();
  });
}

// isValidUrl
// helper function to validate if input is a valid url
// returns boolean if the url is valid
// INPUTS
//    url: string - a publicly url
// RETURNS
//    boolean if its a valid url or not.
export function isValidUrl(url: string)  {
    try {
      new URL(url);
    } catch (_) {
      return false;  
    }
    return true;
}