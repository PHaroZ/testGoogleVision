# testGoogleVision

This aims to play with google vision API. The final goal is to provide an API which return products with the nearest main color of a reference product.

A nodejs app which expose some REST endpoints.
Data are loaded in memory and persisted to a single file.

## Prerequisites
* Nodejs 8.+ and npm
* A Google Cloud Platform account which can be used with Cloud Vision API, see https://cloud.google.com/vision/ for more details.

## Configuration
Configuration can be done via environement variables or via a json file called "conf.json" at the root level (see conf.sample.json for an example).
Available options are :
- **PORT** `number` port number where web service will be accessible, by default `3000`
- **googleCloud:credentials** `path` required, file path which contains your Google Cloud API key, see https://cloud.google.com/docs/authentication/getting-started for more detail (corresponds to google's GOOGLE_APPLICATION_CREDENTIALS)
- **googleCloud:maxConcurrency:vision** `number` maximum number of concurrent call to Google Cloud Vision, by default `5`
- **repo:fs:persistDelay** `number` data persistence is deffered after modification by this delay (in order to avoid to much IO at bulk loading phase), by default `50` ms
- **repo:fs:filePath** `path` file path where to persist data, a new file will be created, the directory structure must already exist. By default `/tmp/testGoogleVision.repo.json`

## Run
To run the service as web server, within the root project folder, simply launch
```shell
npm install ; npm start
```
After that you have to
1. load initial data with a call to _/api/private/product/initFromCsv_
2. load main color for all product from google vision API with a call to _/api/private/product/loadMainColors_

And finally you can use the main public API _/api/public/product/suggestByColor/:id_

(see bellow for more details about API)

## API documentation

#### `GET /api/private/product/initFromCsv`
Clear all previsously loaded datas and load new ones from a CSV file (products.csv)
##### Query string params :
- **file** `String`, required. Path (on nodejs server) to CSV file which contains data to load. CSV must have ";" as delimiter, use "\r\n" as new line and have an header line with, at least, this columns : _id;title;gender_id;composition;sleeve;photo;url_
##### Reponse :
- **HTTP 200** - ```{"success":true,"data":{"total":_xxx_}}``` where _xxx_ is the total number of product in the storage after the operation.
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

#### `GET /api/private/product/loadMainColors`
Compute main color of each product, for which it's unknown, via Google Cloud Vision API and persist it.
##### Query string params :
- **limit** `Number`, default `undefined`. if defined, limit the number of product to process (for debug purpose)
##### Reponse :
- **HTTP 200** - ```{"success":true,"data":{"noColorLoaded":_xxx_}}``` where _xxx_ is the total number of product processed.
##### Example :
```shell
$ curl -i "localhost:3000/api/private/product/loadMainColors" && echo
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-PRqa51ScAIvwerlCHJxXBQoUlQE"
Date: Sun, 04 Feb 2018 14:48:39 GMT
Connection: keep-alive

{"success":true,"data":{"noColorLoaded":499}}
```

#### `GET /api/public/product/suggestByColor/:id`
Return a list of product with the nearest main color of a specified product
##### path params :
- **:id** `String`, reference product id
##### Query string params :
- **limit** `Number`, default `10`. Limit the number of product to return
##### Reponse :
- **HTTP 200** - ```{"success":true,"data":[xxx, yyy, ...]}``` where _xxx_, _yyy_ and so on represent a matching product which looks like :
```json
{
  "id": "PH0521-00-A10",
  "title": "Polo à manches longues en piqué lourd Lacoste SPORT Collection France Olympique",
  "gender_id": "MAN",
  "composition": "100% Coton",
  "sleeve": "Manches longues",
  "photo": "http://image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-FR-Site/Sites-master/default/PH0521_A10_24.jpg?sw=458&sh=443",
  "url": "https://www.lacoste.com/fr/lacoste/homme/vetements/polos/polo-a-manches-longues-en-pique-lourd-lacoste-sport-collection-france-olympique/PH0521-00.html?dwvar_PH0521-00_color=A10",
  "color": [
    232,
    232,
    236
  ],
  "colorLab": [
    92.098,
    0.723,
    -1.947
  ]
}
```

##### Example :
```shell
$ curl -i "localhost:3000/api/public/product/suggestByColor/PH7120-00-DU9?limit=3" && echo
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 1791
ETag: W/"6ff-2iC4ijVj13oE1FH5C0NtdDeauiA"
Date: Sun, 04 Feb 2018 16:12:39 GMT
Connection: keep-alive

{"success":true,"data":[{"id":"PH0521-00-A10","title":"Polo à manches longues en piqué lourd Lacoste SPORT Collection France Olympique","gender_id":"MAN","composition":"100% Coton","sleeve":"Manches longues","photo":"http://image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-FR-Site/Sites-master/default/PH0521_A10_24.jpg?sw=458&sh=443","url":"https://www.lacoste.com/fr/lacoste/homme/vetements/polos/polo-a-manches-longues-en-pique-lourd-lacoste-sport-collection-france-olympique/PH0521-00.html?dwvar_PH0521-00_color=A10","color":[232,232,236],"colorLab":[92.098,0.723,-1.947]},{"id":"PF7961-00-RQD","title":"Polo Golf Lacoste SPORT en mini piqué stretch détails contrastés","gender_id":"WOM","composition":"6% Elasthanne","sleeve":"Manches courtes","photo":"http://image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-FR-Site/Sites-master/default/PF7961_RQD_24.jpg?sw=458&sh=443","url":"https://www.lacoste.com/fr/lacoste/femme/vetements/polos/polo-golf-lacoste-sport-en-mini-pique-stretch-details-contrastes/PF7961-00.html?dwvar_PF7961-00_color=RQD","color":[232,232,237],"colorLab":[92.124,0.905,-2.431]},{"id":"L1230-00-001","title":"Polo regular fit Tennis Lacoste SPORT en maille ultra-légère ","gender_id":"MAN","composition":"100% Coton","sleeve":"Manches courtes","photo":"http://image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-FR-Site/Sites-master/default/L1230_001_24.jpg?sw=458&sh=443","url":"https://www.lacoste.com/fr/sport/homme/polos/polo-regular-fit-tennis-lacoste-sport-en-maille-ultra-legere-/L1230-00.html?dwvar_L1230-00_color=001","color":[230,230,233],"colorLab":[91.37,0.543,-1.465]}]}
```
