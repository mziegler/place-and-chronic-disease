// Path to the CSV file with coded place data
const PLACE_DATA_FILE_PATH = 'data/placecoding-round2-outdoor.json'


const ALL_TAGS_GROUPED = [
  [
    "restrooms",
    "accessible restrooms",
    "single stall restrooms",
    "food",
    "water"
  ],
  [
    "comfortable seating",
    "frequent seating",
    "seating along paths",
    "can lie down",
    "benches",
    "lawn"
  ],
  [
    "wheelchair access",
    "wide path",
    "smooth surfaces",
    "navigable without hills",
    "navigable without stairs"
  ],
  [
    "views of nature",
    "views of water",
    "sun",
    "shade",
  ],
  [
    "low vehicle traffic",
    "low pedestrian traffic",
    "private/enclosed spaces",
    "quiet spaces",
  ],
  [
    "people watching",
    "open space",
    "movable tables/chairs",
    "seating in groups"
  ]
]


let map = L.map('map').setView([47.6509113, -122.3057678], 16)

// Background layer
//let basemap = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
//    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
//    minZoom: 1,
//    maxZoom: 19
//}).addTo(map)


let basemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
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
            .on('click', () => $(`#place-modal-${place.id}`).modal('show'))
    }
}





// Generate modals for each place
function generateModals() {
  for (const place of codedPlaces) {
    $('body').append(`
      <div class="modal fade" id="place-modal-${place.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalCenterTitle">${place.name}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">

              <ul class="place-tags">
                ${
                  ALL_TAGS_GROUPED.map((tag_group, i) => `
                    <li class="tag-group">
                        ${
                          tag_group.map((tag,i) => `
                            ${
                              `<span class="badge ${(tag in place.tags) ? 'badge-yes' : (tag in place.unsure ? 'badge-unsure' : 'badge-no') }">
                                <span class="sr-only">${(tag in place.tags) ? 'yes' : (tag in place.unsure ? 'unsure' : 'no') }</span>
                                ${(tag in place.tags) ? '&#10004;' : (tag in place.unsure ? '?' : '&times;') }
                                ${tag}
                              </span>`
                            }
                          `).join('')
                        }

                        <ul>
                          ${
                            tag_group.map((tag,i) =>
                              (tag in place.comments) ?
                                `<li class="comment">
                                  <span class="sr-only">${(tag in place.tags) ? 'yes' : (tag in place.unsure ? 'unsure' : 'no') }</span>
                                  ${(tag in place.tags) ? '&#10004;' : (tag in place.unsure ? '?' : '&times;') }
                                  <i>${tag}:</i>
                                  ${place.comments[tag]}
                                </li>`
                                : ''
                            ).join('')
                          }
                        </ul>


                    </li>
                  `).join('')

                }
              </ul>

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
