<?php
/**
 * G-TEC Computer Education - Tripunithura Campus
 * Courses API for PHP Shared Hosting (Hostinger)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/../data/courses.json';
$courses = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$id = trim($_GET['id'] ?? '');

if ($method === 'GET') {
    if (!empty($id)) {
        $found = null;
        foreach ($courses as $c) {
            if (($c['id'] ?? '') === $id) {
                $found = $c;
                break;
            }
        }
        if ($found) {
            echo json_encode(['success' => true, 'course' => $found]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Course not found']);
        }
        exit;
    }

    echo json_encode([
        'success' => true,
        'count' => count($courses),
        'courses' => $courses
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    if (empty($input['title'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Course title is required.']);
        exit;
    }

    $newId = !empty($input['id']) ? $input['id'] : 'crs-' . time();
    $input['id'] = $newId;
    $input['createdAt'] = date('c');
    $input['updatedAt'] = date('c');

    array_unshift($courses, $input);
    file_put_contents($dataFile, json_encode($courses, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Course added successfully.',
        'course' => $input
    ]);
    exit;
}

if ($method === 'PUT' || $method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($id)) $id = trim($input['id'] ?? '');

    $updated = null;
    foreach ($courses as &$c) {
        if (($c['id'] ?? '') === $id) {
            foreach ($input as $k => $v) {
                $c[$k] = $v;
            }
            $c['updatedAt'] = date('c');
            $updated = $c;
            break;
        }
    }
    unset($c);

    if ($updated) {
        file_put_contents($dataFile, json_encode($courses, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo json_encode([
            'success' => true,
            'message' => 'Course updated successfully.',
            'course' => $updated
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found.']);
    }
    exit;
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($id)) $id = trim($input['id'] ?? '');

    $origCount = count($courses);
    $courses = array_values(array_filter($courses, function($c) use ($id) {
        return ($c['id'] ?? '') !== $id;
    }));

    if (count($courses) < $origCount) {
        file_put_contents($dataFile, json_encode($courses, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo json_encode(['success' => true, 'message' => 'Course deleted successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
