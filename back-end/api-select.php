<?php
include 'config.php'; // Inclure la configuration de la base de données

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Vérifie la méthode de la requête
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérification du token
$headers = apache_request_headers();
if (!isset($headers['Authorization'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Token manquant.'
    ]);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$query = "SELECT id FROM comptes WHERE token = :token";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':token', $token, PDO::PARAM_STR);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Token invalide.'
    ]);
    exit;
}

// Si la vérification du token est réussie, exécuter l'action (par exemple récupérer des utilisateurs)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['method']) && $_GET['method'] === 'getUsers') {
        $query = "SELECT id, nom, email, adresse, email_entreprise, siret, role FROM comptes";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'users' => $users
        ]);
        exit;
    }
}

echo json_encode([
    'status' => 'error',
    'message' => 'Méthode non reconnue.'
]);
