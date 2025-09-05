<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Log the request
error_log('Calendar proxy request started at ' . date('Y-m-d H:i:s'));

// Get URL from query parameter
$calendarUrl = isset($_GET['url']) ? $_GET['url'] : null;

// Default UVA Calendar URL if no URL provided
if (!$calendarUrl) {
    $calendarUrl = 'https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics';
}

// Validate URL
if (!filter_var($calendarUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo 'Error: Invalid URL provided';
    error_log('Invalid URL: ' . $calendarUrl);
    exit;
}

error_log('Fetching URL: ' . $calendarUrl);

// Check if curl is available
if (!function_exists('curl_init')) {
    http_response_code(500);
    echo 'Error: cURL is not available on this server';
    error_log('cURL not available');
    exit;
}

// Initialize curl
$curl = curl_init();

// Set curl options with better headers for Office365
curl_setopt_array($curl, [
    CURLOPT_URL => $calendarUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Accept: text/calendar,application/calendar,text/plain,*/*',
        'Accept-Language: en-US,en;q=0.9',
        'Cache-Control: no-cache',
        'Pragma: no-cache'
    ],
    CURLOPT_VERBOSE => false
]);

// Execute curl request
$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);

error_log('HTTP Code: ' . $httpCode);
error_log('Content Type: ' . $contentType);
error_log('Response length: ' . strlen($response));

// Check for errors
if (curl_errno($curl)) {
    $error = curl_error($curl);
    http_response_code(500);
    echo 'cURL Error: ' . $error;
    error_log('cURL Error: ' . $error);
} else if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo 'HTTP Error ' . $httpCode . ': Failed to fetch calendar data';
    error_log('HTTP Error: ' . $httpCode . ' - Response: ' . substr($response, 0, 200));
} else if (empty($response)) {
    http_response_code(500);
    echo 'Error: Empty response from calendar server';
    error_log('Empty response received');
} else {
    // Success - return the calendar data
    error_log('Successfully fetched ' . strlen($response) . ' bytes of calendar data');
    
    // Ensure clean output
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Set proper headers again (in case they were overridden)
    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Length: ' . strlen($response));
    
    echo $response;
    
    // Ensure no additional output
    exit();
}

curl_close($curl);
?>