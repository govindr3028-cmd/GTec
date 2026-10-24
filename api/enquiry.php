<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = trim($input['email'] ?? '');
$course = trim($input['course'] ?? 'General Enquiry');
$comments = trim($input['comments'] ?? '');
$mode = trim($input['mode'] ?? 'Classroom');

if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Name and Phone number are required fields.'
    ]);
    exit;
}

$enquiriesFile = __DIR__ . '/../data/enquiries.json';
$enquiries = file_exists($enquiriesFile) ? json_decode(file_get_contents($enquiriesFile), true) : [];

$id = 'ENQ-' . substr(time(), -5);
$newEnquiry = [
    'id' => $id,
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'course' => $course,
    'comments' => $comments,
    'mode' => $mode,
    'status' => 'New',
    'createdAt' => date('c'),
    'notes' => ''
];

array_unshift($enquiries, $newEnquiry);
file_put_contents($enquiriesFile, json_encode($enquiries, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'message' => 'Your enquiry has been received successfully! Our Tripunithura campus advisor will contact you shortly.',
    'enquiryId' => $id,
    'whatsappChatUrl' => 'https://wa.me/918289869975?text=' . urlencode("Hi G-TEC Tripunithura, I submitted an enquiry for $course (Ref: $id).")
]);
