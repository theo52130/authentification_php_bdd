<?php
include '../includes/config.php'; // Inclure la configuration de la base de données
include_once '../includes/token.php'; // Inclure le fichier de vérification du token

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
file_put_contents('php://stderr', print_r($headers, true)); // Ajoutez ce log

if (!isset($headers['Authorization'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Token manquant.'
    ]);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
file_put_contents('php://stderr', "Token reçu: $token\n", FILE_APPEND); // Ajoutez ce log

$user = verifyToken($token);

if (!$user) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Token invalide ou expiré.'
    ]);
    exit;
}

// Si la vérification du token est réussie, exécuter l'action (par exemple récupérer des utilisateurs)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['method']) && $_GET['method'] === 'getUsers') {
        try {
            $query = "SELECT id, nom, email, adresse, email_entreprise, siret, role FROM comptes";
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'status' => 'success',
                'users' => $users
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des utilisateurs : ' . $e->getMessage()
            ]);
        }
        exit;
    }
}

echo json_encode([
    'status' => 'error',
    'message' => 'Méthode non reconnue.'
]);
