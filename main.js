var mapLat = 43.1867;
var mapLng = -2.5874;
var mapDefaultZoom = 9.5;

var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
    }),

    vectorSource = new ol.source.Vector({
        wrapX: false
    }),

    /**
     * Elements that make up the popup.
     */
    container = document.getElementById('popup'),
    content = document.getElementById('popup-content'),
    closer = document.getElementById('popup-closer'),

    /**
     * Create an overlay to anchor the popup to the map.
     */
    overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

function styleFunction(feature) {
    // var geometry = feature.getGeometry();
    console.log(feature);

    var styles = [
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: 3,
                stroke: new ol.style.Stroke({
                    color: [180, 0, 0, 1]
                }),
                fill: new ol.style.Fill({
                    color: [180, 0, 0, 0.3]
                })
            })
        })
    ];
    return styles;
}

var vectorPoints = new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction
});

const map = new ol.Map({
    layers: [raster, vectorPoints],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([mapLng, mapLat]),
        zoom: mapDefaultZoom
    }),

    overlays: [overlay]
});


/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function(evt) {
    let f = map.forEachFeatureAtPixel(
        evt.pixel,
        function(ft, layer) {
            return ft;
        }
    );

    if (f && f.get('type') == 'click') {
        let coordinate = evt.coordinate;

        content.innerHTML = f.get('desc');
        overlay.setPosition(coordinate);
    }
});


function addMarker(data) {

    var features = data.map(item => { //iterate through array...
        console.log(item);
        ciudad = item.city;

        let longitude = item.longitude,
            latitude = item.latitude,
            iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([longitude, latitude], 'EPSG:4326',
                    'EPSG:3857')),

                type: 'click',
                desc: `<b>${item.territory}</b>
                        <br>${item.documentName}
                        <br><br>${item.turismDescription}
                        <br><br><a href="${item.web}" target="_blank">Sitio web</a>`
            }),
            iconStyle = new ol.style.Style({
                image: new ol.style.Icon( /** @type {module:ol/style/Icon~Options} */ ({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: '//openlayers.org/en/v3.20.1/examples/data/icon.png'
                })),
                text: new ol.style.Text({
                    text: item.city
                })
            });

        iconFeature.setStyle(iconStyle);
        return iconFeature;
    });

    var vectorSource = new ol.source.Vector({
        features: features //add an array of features
    });

    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(vectorLayer);

}

// when jQuery has loaded the data, we can create features for each photo
function successHandler(data) {
    console.log(data);
    addMarker(data);
}

function cargar() {
    $.ajax({
        url: './data/datoscapitales.json',
        dataType: 'json',
        success: successHandler
    });
}

window.onload = function() {
    console.log('Poniendo Marcas');
    cargar();
}