// Path to the CSV file with coded place data
const PLACE_DATA_FILE_PATH = 'data/placecoding-round2-outdoor.json'


let map = L.map('map').setView([47.6509113, -122.3057678], 16)

// Background layer
let basemap = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    minZoom: 1,
    maxZoom: 19
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
            .bindPopup(
              `
              <h3>${place.name}</h3>
              <ul>
                ${
                  Object.keys(place.tags).map((tag,i) => `
                    <li>${tag}</li>
                  `).join('')
                }
              </ul>
              `,
              {className: 'place-popup'}
            )

    }
}


// Load coded place data, and put markers on the map
let codedPlaces = null
$.getJSON(PLACE_DATA_FILE_PATH, function(json) {
    codedPlaces = json
    updatePins()
})


// Update pins when the user selects tags
$('input.tag-filter').change(() => {
  updatePins()
})
