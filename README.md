# testGoogleVision

This aims to play with google vision API.

A nodejs app which expose some REST endpoints.
Data are load in memory and persisted to a single file.

## Prerequisites
* Nodejs 8.+
* A Google Cloud Platform account which can be used with Cloud Vision API, see https://cloud.google.com/vision/ for more details.

## Configuration
Configuration can be done via environement variables or via a json file called "conf.json" at the root level.
Available options are :
- **PORT** `number` port number where web service will be accessible, by default `3000`
- **GOOGLE_APPLICATION_CREDENTIALS** `path` required,  file path which contains your Google Cloud API key, see https://cloud.google.com/docs/authentication/getting-started for more detail
- **repo:fs:persistDelay** `number` data persistence is deffered after modification by this delay (in order to avoid to much IO at bulk loading phase), by default `50` ms
- **repo:fs:filePath** `path` file path where to persist data, by default `/tmp/testGoogleVision.repo.json`

## Run
To run the service as web server, within the root project folder, simply launch
```shell
npm install ; npm start
```
After that you have to
1. load initial data with a call to _/api/private/product/initFromCsv_

(see bellow for more details about API)

## API documentation

App expose some REST end points :

#### `GET /api/private/product/initFromCsv`
Clear all previsously loaded datas and load new ones from a CSV file (products.csv)
##### Query string params :
- **file** `String`, required. Path (on nodejs server) to CSV file which contains data to load. CSV must have ";" as delimiter, use "\r\n" as new line and have an header line with, at least, this columns : _id;title;gender_id;composition;sleeve;photo;url_
##### Reponse :
- **HTTP 200** - {"success":true,"data":{"total":_xxx_}} where _xxx_ is the total number of product in the storage after the operation.
##### Example :
```shell
$ curl -i "localhost:3000/api/private/product/initFromCsv?file=/tmp/products.csv"
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 37
ETag: W/"25-1hMB0Mgeb6j31ymxwNy/cE3C1hI"
Date: Sun, 04 Feb 2018 12:03:19 GMT
Connection: keep-alive

{"success":true,"data":{"total":499}}
```