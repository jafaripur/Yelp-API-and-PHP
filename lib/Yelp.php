<?php

require __DIR__ . '/OAuth.php';

/**
 * Class for using Yelp API
 * @author Araz J <mjafaripur@yahoo.com>
 */
class Yelp {

	const API_HOST = 'api.yelp.com';
	const SEARCH_PATH = '/v2/search/';
	const BUSINESS_PATH = '/v2/business/';
	const LIMIT = 20;

	protected $consumerKey;
	protected $consumerSecret;
	protected $tokenKey;
	protected $tokenSecret;

	/**
	 * construct of the class for give API information
	 * @param string $consumerKey Consumer key
	 * @param string $consumerSecret Consumer secret
	 * @param string $tokenKey Token key
	 * @param string $tokenSecret Token secret
	 */
	public function __construct($consumerKey, $consumerSecret, $tokenKey, $tokenSecret) {
		$this->consumerKey = $consumerKey;
		$this->consumerSecret = $consumerSecret;
		$this->tokenKey = $tokenKey;
		$this->tokenSecret = $tokenSecret;
	}

	/**
	 * Makes a request to the Yelp API and returns the response
	 * @param string $path option of request
	 * @return string String text with JSON format
	 */
	protected function request($path) {
		$unsigned_url = "http://" . self::API_HOST . $path;

		// Token object built using the OAuth library
		$token = new OAuthToken($this->tokenKey, $this->tokenSecret);

		// Consumer object built using the OAuth library
		$consumer = new OAuthConsumer($this->consumerKey, $this->consumerSecret);

		// Yelp uses HMAC SHA1 encoding
		$signature_method = new OAuthSignatureMethod_HMAC_SHA1();

		$oauthrequest = OAuthRequest::from_consumer_and_token(
				$consumer, $token, 'GET', $unsigned_url
		);

		// Sign the request
		$oauthrequest->sign_request($signature_method, $consumer, $token);

		// Get the signed URL
		$signed_url = $oauthrequest->to_url();

		// Send Yelp API Call
		$ch = curl_init($signed_url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		$data = curl_exec($ch);
		curl_close($ch);

		return $data;
	}

	/**
	 * Location is specified by a bounding box, defined by a southwest latitude/longitude and a northeast latitude/longitude geographic coordinate
	 * @param double $minLatitude South west latitude
	 * @param double $maxLatitude North east latitude
	 * @param double $minLongitude South west longitude
	 * @param double $maxLongitude North east longitude
	 * @param string $term text to search like location, category,...
	 * @param integer $offset offset to start over there for fetch data
	 * @return type
	 */
	public function searchByBound($minLatitude, $maxLatitude, $minLongitude, $maxLongitude, $term = '', $offset = 0) {
		$url_params = array();
		
		$url_params['bounds'] = "{$minLatitude},{$minLongitude}|{$maxLatitude},{$maxLongitude}";
		if (trim($term) != ''){
			$url_params['term'] = $term;
		}

		return $this->search($url_params, $offset);
	}

	/**
	 * Query the Search API
	 * @param array $url_params Array of parameter to send via query
	 * @param integer $offset offset to start fetch data
	 * @return string text with JSON format
	 */
	protected function search($url_params, $offset) {
		$url_params['limit'] = self::LIMIT;
		$url_params['offset'] = $offset;
		/* $url_params['cc'] = 'TR';
		  $url_params['lang'] = 'tr-TR'; */

		$search_path = self::SEARCH_PATH . '?' . http_build_query($url_params);
		return $this->request($search_path);
	}

	/**
	 * Get just one business information
	 * @param string $business_id ID of business
	 * @return array
	 */
	public function getBusiness($business_id) {
		$business_path = self::BUSINESS_PATH . $business_id;

		return $this->request($business_path);
	}

}
