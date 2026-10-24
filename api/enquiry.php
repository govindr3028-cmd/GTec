<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$enquiriesFile = __DIR__ . '/../data/enquiries.json';
$enquiries = file_exists($enquiriesFile) ? json_decode(file_get_contents($enquiriesFile), true) : [];
if (!is_array($enquiries)) $enquiries = [];

$method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
if (isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$id = trim($_GET['id'] ?? '');

// -----------------------------------------------------------------------------
// GET: Admin Enquiries List & Stats
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $total = count($enquiries);
    $newCount = 0;
    $contactedCount = 0;
    $enrolledCount = 0;

    foreach ($enquiries as $e) {
        $st = strtolower($e['status'] ?? 'new');
        if ($st === 'new') $newCount++;
        elseif ($st === 'contacted') $contactedCount++;
        elseif ($st === 'enrolled') $enrolledCount++;
    }

    echo json_encode([
        'success' => true,
        'count' => $total,
        'stats' => [
            'total' => $total,
            'new' => $newCount,
            'contacted' => $contactedCount,
            'enrolled' => $enrolledCount
        ],
        'enquiries' => $enquiries
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// POST: Submit New Enquiry
// -----------------------------------------------------------------------------
if ($method === 'POST') {
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

    $id = 'ENQ-' . substr(time(), -5) . rand(10, 99);
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
    file_put_contents($enquiriesFile, json_encode($enquiries, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    echo json_encode([
        'success' => true,
        'message' => 'Your enquiry has been received successfully! Our Tripunithura campus advisor will contact you shortly.',
        'enquiryId' => $id,
        'whatsappChatUrl' => 'https://wa.me/918289869975?text=' . urlencode("Hi G-TEC Tripunithura, I submitted an enquiry for $course (Ref: $id).")
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// PATCH: Update Enquiry Status / Notes
// -----------------------------------------------------------------------------
if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($id)) $id = trim($input['id'] ?? '');

    $updated = null;
    foreach ($enquiries as &$e) {
        if (($e['id'] ?? '') === $id) {
            if (isset($input['status'])) $e['status'] = trim($input['status']);
            if (isset($input['notes'])) $e['notes'] = trim($input['notes']);
            $e['updatedAt'] = date('c');
            $updated = $e;
            break;
        }
    }
    unset($e);

    if ($updated) {
        file_put_contents($enquiriesFile, json_encode($enquiries, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo json_encode(['success' => true, 'message' => 'Enquiry updated successfully.', 'enquiry' => $updated]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Enquiry not found.']);
    }
    exit;
}

// -----------------------------------------------------------------------------
// DELETE: Delete Enquiry
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($id)) $id = trim($input['id'] ?? '');

    $origCount = count($enquiries);
    $enquiries = array_values(array_filter($enquiries, function($e) use ($id) {
        return ($e['id'] ?? '') !== $id;
    }));

    if (count($enquiries) < $origCount) {
        file_put_contents($enquiriesFile, json_encode($enquiries, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo json_encode(['success' => true, 'message' => 'Enquiry deleted successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Enquiry not found.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
