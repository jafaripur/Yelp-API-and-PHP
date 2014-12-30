/**
 * Using Yelp API
 * @author Araz J <mjafaripur@yahoo.com>
 */
var yelp_obj = null;
var markerArray = new Array();
var infoWindow;
var map;
var google_place_service;
/**
 * Initialize Google map
 * @returns {undefined}
 */
function initialize() {
    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(41.03705, 28.98584),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    infoWindow = new google.maps.InfoWindow();
    google_place_service = new google.maps.places.PlacesService(map);
}
google.maps.event.addDomListener(window, 'load', initialize);
/**
 * Search and ajax request to give a response from Yelp and add them into map
 * @returns {Boolean}
 */
function search() {
    clearMap();
    var term = $("#term").val();
    var method = $('input[name=method]:checked', '#myForm').val();
    if (method == '1') {
        var request = {
            bounds: map.getBounds(),
            keyword: term
        };
        google_place_service.radarSearch(request, callbackGooglePlaces);
        return false;
    }

    $('#map_loading').show();
    if (yelp_obj !== null)
        yelp_obj.abort();
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var lat_max = ne.lat();
    var lat_min = sw.lat();
    var lng_min = sw.lng();
    var lng_max = ne.lng();
    $('#yelp_filter').prop('disabled', 'disabled');
    yelp_obj = $.ajax({
        url: "ajax.php",
        data: 'term=' + term + '&min_lat=' + lat_min + '&min_lng=' + lng_min + '&max_lat=' + lat_max + '&max_lng=' + lng_max,
        type: 'POST',
        async: true,
        cache: false,
        dataType: 'JSON',
        success: function (data)
        {
            for (var i = 0; i < data.length; i++) {
                createYelpMarker(data[i], data[i].latitude, data[i].longitude);
            }
        },
        complete: function () {
            $('#yelp_filter').removeProp('disabled');
            $('#map_loading').hide();
        }
    });
    return false;
}

/**
 * This is callback for google place
 * @param array results
 * @param string status
 * @returns {undefined}
 */
function callbackGooglePlaces(results, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
        return;
    }
    for (var i = 0, result; result = results[i]; i++) {
        createPlacesMarker(result);
    }
}
/**
 * create marker for each of businesses in google place method
 * @param array place
 * @returns {undefined}
 */
function createPlacesMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: {
            // Star
            path: 'M 0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7 z',
            fillColor: '#ffff00',
            fillOpacity: 1,
            scale: 1 / 4,
            strokeColor: '#bd8d2c',
            strokeWeight: 1
        }
    });
    google.maps.event.addListener(marker, 'click', function () {
        google_place_service.getDetails(place, function (result, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                alert(status);
                return;
            }
            infoWindow.close();
            infoWindow.setContent(generateGooglePlacesInfoWindowHtml(result));
            infoWindow.open(map, marker);
        });
    });
    markerArray.push(marker);
}
/**
 * Generate infor windows to shows when click on a marker in google place method
 * @param array biz
 * @returns {String}
 */
function generateGooglePlacesInfoWindowHtml(biz) {
    var categories = '';
    var image_url = biz.icon;
    var text = '<div class="marker">';
    if (typeof biz.photos != 'undefined') {
        image_url = biz.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100});
    }
    text += '<img class="businessimage" src="' + image_url + '"/><br/>';
    text += '<div class="businessinfo">';
    text += '<a href="' + biz.url + '" target="_blank">' + biz.name + '</a><br/>';
    if (typeof biz.rating != 'undefined') {
        text += biz.rating + '&nbsp;Rating<br/>';
    }
    if (typeof biz.reviews != 'undefined') {
        text += biz.reviews.length + '&nbsp;Review<br/>';
    }
    for (var i = 0; i < biz.types.length; i++) {
        if (categories !== '')
            categories += ', ';
        categories += biz.types[i];
    }
    text += categories + '<br/>';
    text += biz.formatted_address + '<br/>';
    if (typeof biz.international_phone_number != 'undefined') {
        text += biz.international_phone_number + '<br/>';
    }
    if (typeof biz.website != 'undefined') {
        text += '<a href="' + biz.website + '" target="_blank">' + biz.website + '</a>';
    }
    text += '</div></div>';
    return text;
}

/**
 * create marker for each of businesses in yelp method
 * @param array biz
 * @param double latitude
 * @param double longitude
 * @returns {undefined}
 */
function createYelpMarker(biz, latitude, longitude) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map,
        icon: {
            // Star
            path: 'M 0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7 z',
            fillColor: '#ffff00',
            fillOpacity: 1,
            scale: 1 / 4,
            strokeColor: '#bd8d2c',
            strokeWeight: 1
        },
        title: biz.name
    });

    google.maps.event.addListener(marker, "click", function (event)
    {
        infoWindow.close();
        infoWindow.setContent(generateYelpInfoWindowHtml(biz));
        infoWindow.open(map, this);
    });

    markerArray.push(marker);
}
/**
 * Generate infor windows to shows when click on a marker in yelp method
 * @param array biz
 * @returns {String}
 */
function generateYelpInfoWindowHtml(biz) {
    var text = '<div class="marker">';
    text += '<img class="businessimage" src="' + biz.image_url + '"/><br/>';
    text += '<div class="businessinfo">';
    text += '<a href="' + biz.url + '" target="_blank">' + biz.name + '</a><br/>';
    text += '<img class="ratingsimage" src="' + biz.rating_img_url_small + '"/>&nbsp;based&nbsp;on&nbsp;';
    text += biz.review_count + '&nbsp;reviews<br/>';
    text += biz.categories + '<br/>';
    if (biz.snippet_text !== '')
        text += biz.snippet_text + '<br/><br/>';
    text += biz.display_address + '<br/>';
    text += biz.display_phone;
    text += '<br/><a href="' + biz.url + '" target="_blank">Read the reviews »</a>';
    text += '</div></div>';
    return text;
}
/**
 * clear map existing businesses marker
 * @returns {undefined}
 */
function clearMap() {
    if (markerArray)
    {
        for (var i = 0; i < markerArray.length; i++) {
            markerArray[i].setMap(null);
        }
        markerArray.length = 0;
    }
}