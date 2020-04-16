// Path to the CSV file with coded place data
const PLACE_DATA_FILE_PATH = 'data/placecoding-round2-outdoor.json'


const ALL_TAGS_GROUPED = [
  {
    "groupname": "Amenities",
    "tags": [
      "restrooms",
      "accessible restrooms",
      "single stall restrooms",
      "food",
      "water"
    ],
  },

  {
    "groupname": "Navigation",
    "tags": [
      "wheelchair access",
      "wide path",
      "smooth surfaces",
      "frequent seating",
      "seating along paths",
      "navigable without hills",
      "navigable without stairs"
    ],
  },

  {
    "groupname": "Social",
    "tags": [
      "people watching",
      "open space",
      "movable tables/chairs",
      "seating in groups"
    ],
  },

  {
    "groupname": "Resting",
    "tags": [
      "low vehicle traffic",
      "low pedestrian traffic",
      "private/enclosed spaces",
      "quiet spaces",
      "comfortable seating",
      "can lie down",
      "benches",
      "lawn"
    ],
  },

  {
    "groupname": "Nature",
    "tags": [
      "views of nature",
      "views of water",
      "sun",
      "shade",
    ],
  },
]


let map = L.map('map').setView([47.652734,-122.30631], 16)

// Background layer
//let basemap = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
//    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
//    minZoom: 1,
//    maxZoom: 19
//}).addTo(map)


let basemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Esri'
}).addTo(map)


// Function to add place markers to the map
let placeMarkers = L.layerGroup().addTo(map)
function updatePins() {

    // Remove all places from the map, to start fresh
    placeMarkers.clearLayers();

    // Get the list of tags that have been checked by the user
    let requiredTags = $('input.tag-filter:checked').map(function() { return $(this).val() })

    // This function returns true if the given place has all tags selected by the user
    function placeFilter(place) {
        for (const requiredTag of requiredTags) {
            if (!place.tags[requiredTag]) return false
        }
        return true
    }

    // Add each place to the map that satisfies our filter
    for (const place of codedPlaces.filter(placeFilter)) {
        L.marker(place.coords)
            .addTo(placeMarkers)
            .bindTooltip(place.name)
            .on('click', () => {
              $(`#place-modal-${place.id}`).modal('show')
              loadGooglePlace(place)
            })
    }
}





// Generate modals for each place.
// Called after codedPlaces are loaded.
function generateModals() {
  for (const place of codedPlaces) {
    $('body').append(`
      <div class="modal fade" id="place-modal-${place.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header modal-place-header">
              <h5 class="modal-title modal-place-title">${place.name}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div class="googlemaps-info emtpy"></div>

            <div class="modal-body">

              <div class="container-flexible place-tags ">
                ${
                  ALL_TAGS_GROUPED.map((tag_group, i) => `
                    <div class="row place-tags-group">
                        <div class="col-md-2" style="text-align:right">${tag_group.groupname}</div>
                        <div class="col-md-10">
                        ${
                          tag_group.tags.map((tag,i) => `
                            ${
                              `<span class="badge badge-place-tag ${(tag in place.tags) ? 'badge-yes' : (tag in place.unsure ? 'badge-unsure' : 'badge-no') }">
                                <span class="sr-only">${(tag in place.tags) ? 'yes' : (tag in place.unsure ? 'unsure' : 'no') }</span>
                                ${(tag in place.tags) ? '&#10003;' : (tag in place.unsure ? '?' : '&times;') }
                                ${tag}
                              </span>`
                            }
                          `).join('')
                        }

                        <ul class="place-comments">
                          ${
                            tag_group.tags.map((tag,i) =>
                              (tag in place.comments) ?
                                `<li class="place-comment">
                                  <span class="sr-only">${(tag in place.tags) ? 'yes' : (tag in place.unsure ? 'unsure' : 'no') }</span>
                                  ${(tag in place.tags) ? '&#10003;' : (tag in place.unsure ? '?' : '&times;') }
                                  <i>${tag}:</i>
                                  ${place.comments[tag]}
                                </li>`
                                : ''
                            ).join('')
                          }
                        </ul>
                        </div>


                    </div>
                  `).join('')

                }
              </div>

              <div class="google-reviews"></div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `)
  }
}


function loadGooglePlace(place) {
  if (place.google_id && !$(`#place-modal-${place.id} div.googlemaps-info`).hasClass('empty')) {

    let placesService = new google.maps.places.PlacesService(document.createElement('div'));
    placesService.getDetails({ placeId: place.google_id }, (googleplace, googlestatus) => {
      if (googlestatus === google.maps.places.PlacesServiceStatus.OK) {


//<img src="${photo.getUrl()}" class="d-block w-100" alt="${place.name}">
        $(`#place-modal-${place.id} div.googlemaps-info`)
        .removeClass('empty')
        .html(`
          ${(googleplace.photos && googleplace.photos[0]) ? `
            <div id="carousel-${place.id}" class="carousel slide" data-ride="carousel" data-interval="false">
              <div class="carousel-inner">
                ${googleplace.photos.map((photo,i) => `
                  <div class="carousel-item ${(i==0) ? 'active' : ''}">
                    <div class="d-block w-100" alt="${place.name}"
                      style="background-image:url('${photo.getUrl()}'); background-size:cover; background-position:center; height:300px; background-color: #DDD"></div>
                  </div>
                `)}
              </div>
              <a class="carousel-control-prev" href="#carousel-${place.id}" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
              </a>
              <a class="carousel-control-next" href="#carousel-${place.id}" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
              </a>
            </div>
          ` : ''}

          <div style="text-align:center;padding-top:10px; padding-bottom:26px">
            <a href="${googleplace.url}" target="_blank">View on Google Maps</a>
          </div>
        `)

        if (googleplace.reviews && googleplace.reviews[0]) {
          $(`#place-modal-${place.id} div.google-reviews`)
          .addClass('reviews-populated')
          .html(`
            <center><b>Reviews</b></center>
            <ul>
              ${
                googleplace.reviews.map((review,i) =>
                  (review.text) ? `<li>${review.text}</li>` : ''
                ).join('')
              }
            </ul>
            <center><a href="${googleplace.url}" target="_blank">See all on Google Maps</a></center>
          `)
        }

      }
      else {
        console.log('something bad happened with google API', googlestatus, googleplace)
      }
    })
  }
}


//Object.keys(place.tags).map((tag,i) => `
//  <li>${tag}</li>
//`).join('')

// Load coded place data, and put markers on the map
let codedPlaces = null
$.getJSON(PLACE_DATA_FILE_PATH, function(json) {
    codedPlaces = json
    updatePins()
    generateModals()
})


// Update pins when the user selects tags
$('input.tag-filter').change(() => {
  updatePins()
})
