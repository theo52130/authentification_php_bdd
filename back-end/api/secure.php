<?php
// secure.php
include_once '../includes/token.php';

function secureApi()
{
    $headers = apache_request_headers();
    if (isset($headers['Authorization'])) {
        $token = $headers['Authorization'];
        if (verifyToken($token)) {
            return true;
        }
    }
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}
