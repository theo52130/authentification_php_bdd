<?php
include '../includes/config.php'; // Inclure la configuration de la base de données
include_once '../includes/token.php'; // Inclure le fichier de vérification du token

header("Content-Type: application/json"); // Définir l'en-tête de la réponse comme JSON
header("Access-Control-Allow-Origin: *"); // Autoriser toutes les origines pour les requêtes CORS
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Autoriser les méthodes GET, POST et OPTIONS
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Autoriser les en-têtes Content-Type et Authorization

// Vérifie la méthode de la requête
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Répondre avec un code de statut 200 pour les requêtes OPTIONS
    exit; // Terminer le script
}

// Vérification du token
$headers = apache_request_headers(); // Récupérer les en-têtes de la requête
file_put_contents('php://stderr', print_r($headers, true)); // Log des en-têtes pour le débogage

if (!isset($headers['Authorization'])) { // Vérifier si l'en-tête 'Authorization' est présent
    echo json_encode([
        'status' => 'error',
        'message' => 'Token manquant.'
    ]);
    exit; // Terminer le script
}

$token = str_replace('Bearer ', '', $headers['Authorization']); // Extraire le token de l'en-tête 'Authorization'
file_put_contents('php://stderr', "Token reçu: $token\n", FILE_APPEND); // Log du token pour le débogage

$user = verifyToken($token); // Vérifier la validité du token

if (!$user) { // Si le token est invalide ou expiré
    echo json_encode([
        'status' => 'error',
        'message' => 'Token invalide ou expiré.'
    ]);
    exit; // Terminer le script
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
