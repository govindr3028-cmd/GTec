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
$course = trim($input['course'] ?? 'General Query');
$comments = trim($input['comments'] ?? '');

if (empty($name) || (empty($phone) && empty($email))) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Name and either Phone or Email are required.'
    ]);
    exit;
}

$contactsFile = __DIR__ . '/../data/contacts.json';
$contacts = file_exists($contactsFile) ? json_decode(file_get_contents($contactsFile), true) : [];

$id = 'MSG-' . substr(time(), -5);
$item = [
    'id' => $id,
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'course' => $course,
    'comments' => $comments,
    'createdAt' => date('c')
];

array_unshift($contacts, $item);
file_put_contents($contactsFile, json_encode($contacts, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'message' => 'Message delivered! Thank you for contacting G-TEC Tripunithura.',
    'messageId' => $id
]);
