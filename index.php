<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Using Yelp API</title>
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
        <link href="web/css/style.css" rel="stylesheet">
        <script src="//cdn.jsdelivr.net/jquery/1.11.2/jquery.min.js" type="text/javascript"></script>        
        <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places"></script>
    </head>
    <body>
        <form id="myForm" action="#" onsubmit="return search();" style="margin:20px;">
			<div>
				<input id="yelp_method" type="radio" name="method" value="0" checked><label for="yelp_method">Using Yelp</label>
				<input id="google_place_method" type="radio" name="method" value="1"><label for="google_place_method">Using Gooogle place</label>
			</div>
            <input type="text" id="term" placeholder="Restaurants, Sport,...">
            <button id="yelp_filter" type="submit" class="btn btn-primary">Search</button>
            <button id="yelp_clear_map_btn" type="button" onclick="clearMap();">Clear</button>
            <div id="yelp_message"></div>
        </form>
        <div id="map-canvas"></div>
        <div class="map_search_ajax_loader" id="map_loading" style="display: none;">
            <img src="web/images/ajax.gif" />
        </div>
        <script type="text/javascript" src="web/js/script.js"></script>
    </body>
</html>
