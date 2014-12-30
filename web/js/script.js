/**
 * Using Yelp API
 * @author Araz J <mjafaripur@yahoo.com>
 */
var yelp_obj = null;
var yelp_marker = new Array();
var yelp_infowindow;
var map;
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
    yelp_infowindow = new google.maps.InfoWindow();
}
google.maps.event.addDomListener(window, 'load', initialize);
/**
 * Search and ajax request to give a response from Yelp and add them into map
 * @returns {Boolean}
 */
function yelp_search() {
    if (map.getZoom() < 9) {
        $('#yelp_message').removeClass().addClass('alert alert-warning').html('Too zoom out!');
        return false;
    }
    $('#map_loading').show();
    $('#yelp_message').removeClass().html('');
    var term = $("#yelp_term").val();
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
            yelp_clear_map();
            for (var i = 0; i < data.length; i++) {
                createMarker(data[i], data[i].latitude, data[i].longitude);
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
 * create marker for each of businesses
 * @param array biz
 * @param double latitude
 * @param double longitude
 * @returns {undefined}
 */
function createMarker(biz, latitude, longitude) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map,
        //icon: yelp_marker_image,
        icon: {
            // Star
            path: 'M 0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7 z',
            fillColor: '#ffff00',
            fillOpacity: 1,
            scale: 1/4,
            strokeColor: '#bd8d2c',
            strokeWeight: 1
        },
        title: biz.name
    });

    google.maps.event.addListener(marker, "click", function (event)
    {
        yelp_infowindow.close();
        yelp_infowindow.setContent(generateInfoWindowHtml(biz));
        yelp_infowindow.open(map, this);
    });

    yelp_marker.push(marker);
}
/**
 * Generate infor windows to shows when click on a marker
 * @param array biz
 * @returns {String}
 */
function generateInfoWindowHtml(biz) {
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
function yelp_clear_map() {
    if (yelp_marker)
    {
        for (var i = 0; i < yelp_marker.length; i++) {
            yelp_marker[i].setMap(null);
        }
        yelp_marker.length = 0;
    }
}