<?php

require __DIR__ . '/lib/Yelp.php';

$consumerKey = 'YOUR-CONSUMER-KEY';
$consumerSecret = 'YOUR-CONSUMER-SECRET';
$tokenKey = 'YOUR-TOKEN-KEY';
$tokenSecret = 'YOUR-TOKEN-SECRET';

$term = filter_input(INPUT_POST, 'term');

$limit = 50;

$yelp = new Yelp($consumerKey, $consumerSecret, $tokenKey, $tokenSecret);

set_time_limit(80);
ini_set('max_execution_time', 80);

$min_lat = filter_input(INPUT_POST, 'min_lat');
$min_lng = filter_input(INPUT_POST, 'min_lng');
$max_lat = filter_input(INPUT_POST, 'max_lat');
$max_lng = filter_input(INPUT_POST, 'max_lng');

$all_data = array();

$fetched = 0;
$total = 0;
while (true) {
	$data = $yelp->searchByBound($min_lat, $max_lat, $min_lng, $max_lng, $term, $fetched);
	$data = json_decode($data, true);
	$fetched += count($data['businesses']);
	$total = $data['total'];
	$all_data[] = $data['businesses'];
	if (($fetched >= $total ) || ($fetched >= $limit)) {
		break;
	}
}
$new_data = array();
foreach ($all_data as $all_data_values) {
	foreach ($all_data_values as $data) {
		if (!isset($data['location']['coordinate']))
			continue;
		$display_address = '';
		$categories = '';
		foreach ($data['location']['display_address'] as $address) {
			$display_address .= $address . ', ';
		}
		$display_address = rtrim($display_address, ', ');
		if (isset($data['categories'])) {
			foreach ($data['categories'] as $category) {
				$categories .= $category[0] . ', ';
			}
			$categories = rtrim($categories, ', ');
		}
		$new_data[] = array(
			//'id' => $data['id'],
			'rating' => $data['rating'],
			'name' => $data['name'],
			'image_url' => isset($data['image_url']) ? $data['image_url'] : '',
			'url' => $data['url'],
			//'mobile_url' => $data['mobile_url'],
			'display_phone' => isset($data['display_phone']) ? $data['display_phone'] : '',
			'review_count' => isset($data['review_count']) ? $data['review_count'] : '',
			'rating_img_url_small' => $data['rating_img_url_small'],
			//'rating_img_url' => $data['rating_img_url'],
			//'rating_img_url_large' => $data['rating_img_url_large'],
			'snippet_image_url' => isset($data['snippet_image_url']) ? $data['snippet_image_url'] : '',
			'snippet_text' => isset($data['snippet_text']) ? $data['snippet_text'] : '',
			'display_address' => $display_address,
			'latitude' => $data['location']['coordinate']['latitude'],
			'longitude' => $data['location']['coordinate']['longitude'],
			'categories' => $categories,
		);
	}
}
echo json_encode($new_data);
