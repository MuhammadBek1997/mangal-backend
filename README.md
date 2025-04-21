URL - https://mangal-backend-production.up.railway.app/


GET:

URL/api/restaurant/123

Post:

URL/api/restaurant/123/add-food

body:
{
  "title":"food title",
  "price":"food price",
  "type":"food type"
}

Update:

URL/api/restaurant/123/update-food/foodID

body:
{
  "title":"food title",
  "price":"food price",
  "type":"food type"
}

Delete:

URL/api/restaurant/123/delete-food/foodID


Clients

Post:

URL/api/restaurant/123/add-client

body:
{
  "name":"food title",
  "number":"food price",
  "address":{
    lat: number,
    long:number
  }
}

Edit:

URL/api/restaurant/123/update-client/clientID

body:
{
  "name":"food title",
  "number":"food price",
  "address":{
    lat: number,
    long:number
  }
}


delete:

URL/api/restaurant/123/delete-client/clientID
