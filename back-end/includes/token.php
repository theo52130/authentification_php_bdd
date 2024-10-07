<?php
include '../includes/config.php'; // Inclure la configuration de la base de données

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Vérifie la méthode de la requête
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function verifyToken($token)
{
    global $pdo;
    $currentTime = time(); // Appeler la fonction time() avant de lier le paramètre
    $query = "SELECT user_id FROM tokens WHERE token = :token AND expiry > :current_time";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':token', $token, PDO::PARAM_STR);
    $stmt->bindParam(':current_time', $currentTime, PDO::PARAM_INT); // Utiliser la variable $currentTime
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        // Simuler la récupération de l'utilisateur depuis la base de données
        return [
            'id' => $result['user_id'],
            // 'nom' => 'Nom Utilisateur', // Remplacer par la logique réelle pour récupérer le nom
            // 'email' => 'email@example.com' // Remplacer par la logique réelle pour récupérer l'email
        ];
    }

    return false;
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

// echo json_encode([
//     'status' => 'error',
//     'message' => 'Méthode non reconnue.'
// ]);
