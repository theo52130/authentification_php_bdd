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

        // Validation de l'email
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            echo json_encode(['status' => 'error', 'message' => 'Email invalide.']);
            exit;
        }

        // Prépare la requête pour récupérer les informations de l'utilisateur
        $query = "SELECT id, nom, email, adresse, email_entreprise, siret, password, role FROM comptes WHERE email = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) { // Vérifie le mot de passe haché
            // Récupérer les factures de l'utilisateur
            $facturesQuery = "SELECT id, date_creation, total, etat FROM factures WHERE client_id = ?";
            $facturesStmt = $pdo->prepare($facturesQuery);
            $facturesStmt->execute([$user['id']]);
            $factures = $facturesStmt->fetchAll(PDO::FETCH_ASSOC);

            // Réponse de succès avec les informations de l'utilisateur et les factures
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
                ],
                'factures' => $factures // Inclure les factures
            ]);
        } else {
            // Réponse d'erreur si les informations de connexion sont incorrectes
            echo json_encode(['status' => 'error', 'message' => 'Email ou mot de passe incorrect.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Champs email et mot de passe requis.']);
    }
}
