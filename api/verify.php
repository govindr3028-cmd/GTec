<?php
/**
 * G-TEC Computer Education - Tripunithura Campus
 * Certificate Verification API for PHP Shared Hosting (Hostinger)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$certNumber = trim($_GET['cert'] ?? '');

if (empty($certNumber)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'verified' => false,
        'message' => 'Certificate registration number is required.'
    ]);
    exit;
}

$certsFile = __DIR__ . '/../data/certificates.json';
$certs = file_exists($certsFile) ? json_decode(file_get_contents($certsFile), true) : [];

$found = null;
$cleanTarget = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $certNumber));

if (is_array($certs)) {
    foreach ($certs as $c) {
        $cleanCert = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $c['certNumber'] ?? ''));
        if ($cleanCert === $cleanTarget) {
            $found = $c;
            break;
        }
    }
}

if (!$found) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'verified' => false,
        'message' => "No certificate record found for identifier '{$certNumber}'. Please verify the certificate number or contact the Tripunithura campus administration."
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'verified' => true,
    'data' => $found
]);
