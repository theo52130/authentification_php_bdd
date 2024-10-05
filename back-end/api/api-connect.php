<?php
include '../includes/config.php'; // Inclure la configuration de la base de données

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Gérer les requêtes prévols OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit; // Terminer le script après cette réponse
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lire le corps de la requête
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['email']) && isset($input['password'])) {
        $email = $input['email'];
        $password = $input['password'];

        // Prépare la requête pour récupérer les informations de l'utilisateur
        $query = "SELECT id, nom, email, adresse, email_entreprise, siret, password, role FROM comptes WHERE email = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) { // Vérifie le mot de passe haché
            // Réponse de succès avec les informations de l'utilisateur
            echo json_encode([
                'status' => 'success',
                'user' => [
                    'id' => $user['id'],
                    'nom' => $user['nom'],
                    'email' => $user['email'],
                    'adresse' => $user['adresse'],
                    'email_entreprise' => $user['email_entreprise'],
                    'siret' => $user['siret'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            // Réponse d'erreur si les informations de connexion sont incorrectes
            echo json_encode(['status' => 'error', 'message' => 'Email ou mot de passe incorrect.']);
        }
    } else {
        // Réponse d'erreur si les champs email ou mot de passe sont manquants
        echo json_encode(['status' => 'error', 'message' => 'Champs email et mot de passe requis.']);
    }
} else {
    // Réponse d'erreur si la méthode HTTP n'est pas POST
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Méthode HTTP non autorisée.']);
}
