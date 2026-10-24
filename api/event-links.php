<?php
/**
 * G-TEC Computer Education - Tripunithura Campus
 * Event & Examination Portal Links API (Hostinger PHP & Static Deployment)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/../data/event_links.json';

// Default initial links to guarantee both examination and event links are always available
$defaultLinks = [
    [
        'id' => 'EVT-43342',
        'title' => 'G-TEC National Scholarship Exam 2026',
        'url' => 'https://gteceducation.com/scholarship',
        'category' => 'Examination',
        'badgeText' => 'Registrations Open',
        'date' => 'Upcoming',
        'description' => 'Online scholarship exam with up to 50% fee concession for IT & Accounting.',
        'active' => true,
        'createdAt' => '2026-10-15T10:00:00.000Z',
        'updatedAt' => '2026-10-24T17:32:39.623Z'
    ],
    [
        'id' => 'EVT-65334',
        'title' => 'Kolenchery Campus Event & Workshop',
        'url' => 'https://gteckolenchery.com/',
        'category' => 'Campus Event',
        'badgeText' => 'Registrations Open',
        'date' => 'Upcoming',
        'description' => 'Official campus event and student admission guidance desk.',
        'active' => true,
        'createdAt' => '2026-10-17T07:56:05.334Z',
        'updatedAt' => '2026-10-24T17:32:39.623Z'
    ]
];

function loadLinks($dataFile, $defaultLinks) {
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $data = json_decode($raw, true);
        if (is_array($data) && count($data) > 0) {
            return $data;
        }
    }
    // Initialize file with defaults if not present
    @file_put_contents($dataFile, json_encode($defaultLinks, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    return $defaultLinks;
}

function saveLinks($dataFile, $links) {
    return @file_put_contents($dataFile, json_encode($links, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
} elseif (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

$links = loadLinks($dataFile, $defaultLinks);

// Extract target ID from query param or request path
$id = trim($_GET['id'] ?? '');
if (empty($id) && isset($_SERVER['REQUEST_URI'])) {
    if (preg_match('#/api(?:/admin)?/event-links/([A-Za-z0-9_-]+)#', $_SERVER['REQUEST_URI'], $m)) {
        $id = $m[1];
    }
}

// -----------------------------------------------------------------------------
// GET: Retrieve All or Single Event / Examination Link
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if (!empty($id)) {
        $found = null;
        foreach ($links as $l) {
            if ($l['id'] === $id) {
                $found = $l;
                break;
            }
        }
        if ($found) {
            echo json_encode(['success' => true, 'link' => $found]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Event link not found']);
        }
        exit;
    }

    echo json_encode([
        'success' => true,
        'count' => count($links),
        'links' => $links
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// POST: Add New Event / Examination Link
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST;

    $title = trim($input['title'] ?? '');
    $url = trim($input['url'] ?? '');
    $category = trim($input['category'] ?? 'Examination');
    $badgeText = trim($input['badgeText'] ?? $input['badge_text'] ?? 'Active Now');
    $date = trim($input['date'] ?? 'Upcoming');
    $description = trim($input['description'] ?? '');
    $active = isset($input['active']) ? (bool)$input['active'] : true;

    if (empty($title) || empty($url)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title and Link URL are required fields.']);
        exit;
    }

    if (!preg_match('#^https?://#i', $url) && !str_starts_with($url, '/') && !str_starts_with($url, '#')) {
        $url = 'https://' . $url;
    }

    $newId = 'EVT-' . substr(time(), -5) . rand(10, 99);
    $newLink = [
        'id' => $newId,
        'title' => $title,
        'url' => $url,
        'category' => $category,
        'badgeText' => $badgeText,
        'date' => $date,
        'description' => $description,
        'active' => $active,
        'createdAt' => date('c'),
        'updatedAt' => date('c')
    ];

    array_unshift($links, $newLink);
    saveLinks($dataFile, $links);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Event / Examination link added successfully.',
        'link' => $newLink
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// PATCH / PUT: Update Link (e.g. toggle active, change title)
// -----------------------------------------------------------------------------
if ($method === 'PATCH' || $method === 'PUT') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];

    if (empty($id)) {
        $id = trim($input['id'] ?? '');
    }

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Link ID is required for update.']);
        exit;
    }

    $updated = null;
    foreach ($links as &$l) {
        if ($l['id'] === $id) {
            if (isset($input['title'])) $l['title'] = trim($input['title']);
            if (isset($input['url'])) $l['url'] = trim($input['url']);
            if (isset($input['category'])) $l['category'] = trim($input['category']);
            if (isset($input['badgeText'])) $l['badgeText'] = trim($input['badgeText']);
            if (isset($input['badge_text'])) $l['badgeText'] = trim($input['badge_text']);
            if (isset($input['date'])) $l['date'] = trim($input['date']);
            if (isset($input['description'])) $l['description'] = trim($input['description']);
            if (isset($input['active'])) $l['active'] = (bool)$input['active'];
            $l['updatedAt'] = date('c');
            $updated = $l;
            break;
        }
    }
    unset($l);

    if ($updated) {
        saveLinks($dataFile, $links);
        echo json_encode([
            'success' => true,
            'message' => 'Event link updated successfully.',
            'link' => $updated
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Event link not found with ID: ' . $id]);
    }
    exit;
}

// -----------------------------------------------------------------------------
// DELETE: Remove Link
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];

    if (empty($id)) {
        $id = trim($input['id'] ?? '');
    }

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Link ID is required for deletion.']);
        exit;
    }

    $initialCount = count($links);
    $links = array_values(array_filter($links, function($l) use ($id) {
        return ($l['id'] ?? '') !== $id;
    }));

    if (count($links) < $initialCount) {
        saveLinks($dataFile, $links);
        echo json_encode([
            'success' => true,
            'message' => 'Event link deleted successfully.'
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Event link not found with ID: ' . $id]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
