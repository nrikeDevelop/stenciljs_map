import { Component,State } from '@stencil/core';
import L from 'leaflet';


function markerInfo(name,ubication,phone,website){
  var html = 
  `<div class="contentPopUp">
      <table>
        <tr>
          <td><img class="iconBar" width="25px" height="25px;"src="https://img.icons8.com/nolan/64/000000/worldwide-location.png">     </td>
          <td>${name}</td>
        </tr>
        <tr>
          <td><img class="iconBar" width="25px" height="25px;"src="https://img.icons8.com/nolan/64/000000/visit.png"></td>
          <td id="ubication">${ubication}</td>
        </tr>`;
  if(phone !== null){
    html = html +
        `<tr>
          <td><img class="iconBar" width="25px" height="25px;"src="https://img.icons8.com/nolan/64/000000/whatsapp.png"></td>
          <td>${phone}</td>
        </tr>`
  }
  if(website !== null){
    html = html +
        `<tr>
          <td><img class="iconBar" width="25px" height="25px;"src="https://img.icons8.com/nolan/64/000000/laptop.png"></td>
          <td><a href="${website}">Visit it!</a></td>
        </tr>`
  }
        
  html = html+
      `
      </table>
      <button id="go" class="go_button grad" >Go!</button>
    </div>`;
  return html;
}


@Component({
  tag: 'app-map',
  styleUrl:'style.css'
})
export class Map {
  //define any withou context changes
  map: any;
  //@State() map;

  @State() content= [];
  @State() loading=false;

  @State()lat="";
  @State()long="";

  @State() isLoading = true;

  @State() markers;

  componentDidLoad() {
    this.map = L.map('map').locate({setView: true});
    this.map.on('locationfound', e => {
      this.lat = e.latitude;
      this.long = e.longitude;
      this.getQueryMap("bares",1);
    });
    this.map.setZoom(19);

  }

  getQueryMap( newQuery, radius ){

      var myIcon = L.icon({
        iconUrl: 'https://img.icons8.com/nolan/64/000000/street-view.png',
        iconSize: [40, 45],
      });

      var barIcon = L.icon({
        iconUrl: 'https://img.icons8.com/nolan/64/000000/bar.png',
        iconSize: [40, 45],
      });

      var currentPosition = null;
      var elementPosition = null;

      console.log("PASA");

      currentPosition = L.marker([this.lat,this.long], {icon: myIcon}).addTo(this.map);
        
      var html ='<div><h3>I am here</h3></div>'
      currentPosition.bindPopup(String(html));

      var id = "app_id=LASHRAtCdxJJJzo3uLUS&app_code=7DE4s_9trMNfyEAtUiqFpQ"

      //nrikeDevelop
      //var id = "app_id=Kc3LpNWK9cN1PAVtnglo&app_code=loWnQ2KEvD-IeKXQNs9TWg";
      var query=newQuery;
      var getJson ="https://places.cit.api.here.com/places/v1/autosuggest?q="+query+"&in="+this.lat+"%2C"+this.long+"%3Br%3D"+radius+"&Accept-Language=en-US%2Cen%3Bq%3D0.9&"+id;
    
      //get json query data
      fetch(getJson)
      .then(response => response.json())
      .then(data => {
        this.content = data;
        console.log(this.content);        
        const results=data.results;
        results.map(result => {
        if (result.position !== undefined){
            var lat = result.position[0];
            var long = result.position[1];

            //get json href data 
            fetch(result.href)
            .then(response => response.json())
            .then(info => {
              const location = info.location.address;
              const contact = info.contacts;
             
              var phone = null;
              var website = null;
            
              if (contact.phone !== undefined){
                phone = contact.phone[0].value;
              }
            
              if (contact.website !== undefined){
                website = contact.website[0].value;
              }

              elementPosition = L.marker([lat,long], {icon: barIcon}).addTo(this.map);
              
              var street =(location.street !== undefined ? location.street+",<br>" :"")+
              (location.house !== undefined ? location.house+"," :"")+
              (location.city !== undefined ? location.city :"");

              elementPosition.bindPopup(markerInfo(info.name,street,phone,website));
            });       
          }
        });
        
      });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png").addTo(this.map);

    this.map.on('popupopen', (/*e*/) => {
      //console.log('pop up open', e.popup);
      document.getElementById('go').addEventListener('click', () => {

        var ubication = document.getElementById('ubication').textContent;
        location.href = "https://www.google.com/maps/search/?api=1&query="+ubication;
      }, false);
    })
    
  }

  cleraAllLayers(){
    this.map.eachLayer((layer) => {
      this.map.removeLayer(layer);
    });
  }

  onRangeTouchEnd = () => {
    this.loading = true;
    this.cleraAllLayers();
    
    
    var element = event.currentTarget as HTMLInputElement;
    var value = element.value;
  
    // var radious = parseInt(value) * 1000/100;
    // if ( radious < 100){
    //   radious = 100;
    // }

    if (parseInt(value) <= 300){
      this.map.setZoom(18)
    }else if( parseInt(value) > 300 && parseInt(value) <= 700){
      this.map.setZoom(17)
    }else if ( parseInt(value) > 700 ){
      this.map.setZoom(16)
    }


    this.getQueryMap("bares",value);
  };

  renderIfLoading(){
    if(this.loading === true){
      console.log("SI")
    }else{
      console.log("NO")
    }
  }

    render(){
        return [
          <ion-header>
              <ion-toolbar>
                <ion-title>
                  <ion-range pin={true} min={100} max={1000} onTouchEnd={this.onRangeTouchEnd} >
                    <ion-label slot="start">metros</ion-label>
                  </ion-range>

                </ion-title>
              </ion-toolbar>

          </ion-header>,
          <ion-content>
          <div style={{
              width:'100%',
              height:'100%'
          }} id="map"></div>  
          </ion-content>       
        ]
    }
}



/* consejo de sabio(s)
const filteredResults = results.map(result => {
  return {title: result.title, position: result.position};
});
  Object.keys(this.content).forEach(key => {
  const value = this.content[key];
  console.log(value);
})
*/
