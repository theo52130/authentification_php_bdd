<?php
include '../includes/config.php'; // Inclure la configuration de la base de données
include_once '../includes/token.php'; // Inclure le fichier de vérification du token

header("Content-Type: application/json"); // Définir l'en-tête de la réponse comme JSON

// Fonction pour récupérer les en-têtes si `getallheaders` n'est pas disponible
if (!function_exists('getallheaders')) {
    function getallheaders()
    {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            // Vérifier si le nom de l'en-tête commence par 'HTTP_'
            if (substr($name, 0, 5) == 'HTTP_') {
                // Convertir le nom de l'en-tête en format lisible et l'ajouter au tableau des en-têtes
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

// Récupérer les en-têtes de la requête
$headers = getallheaders();
$response = []; // Variable pour stocker la réponse

// Vérifier si l'en-tête 'Authorization' est présent
if (!isset($headers['Authorization'])) {
    http_response_code(401); // Répondre avec un code de statut 401 (Non autorisé)
    $response = ['status' => 'error', 'message' => 'Token manquant.']; // Message d'erreur
    echo json_encode($response); // Envoyer la réponse en JSON
    exit; // Terminer le script
}

// Extraire le token de l'en-tête 'Authorization'
$token = str_replace('Bearer ', '', $headers['Authorization']);
// Vérifier la validité du token
$user = verifyToken($token);

if (!$user) {
    http_response_code(401); // Répondre avec un code de statut 401 (Non autorisé)
    $response = ['status' => 'error', 'message' => 'Token invalide ou expiré.']; // Message d'erreur
    echo json_encode($response); // Envoyer la réponse en JSON
    exit; // Terminer le script
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['nom'], $data['email'], $data['adresse'], $data['email_entreprise'], $data['siret'], $data['password'], $data['role'])) {
        $nom = $data['nom'];
        $email = $data['email'];
        $adresse = $data['adresse'];
        $email_entreprise = $data['email_entreprise'];
        $siret = $data['siret'];
        $password = password_hash($data['password'], PASSWORD_BCRYPT); // Hachage du mot de passe
        $role = $data['role'];

        // Vérifiez si l'email existe déjà
        $checkEmail = $pdo->prepare("SELECT id FROM comptes WHERE email = :email");
        $checkEmail->execute(['email' => $email]);
        if ($checkEmail->rowCount() > 0) {
            $response = ['status' => 'error', 'message' => 'L\'email est déjà utilisé.'];
            echo json_encode($response);
            exit;
        }

        // Insertion dans la base de données
        $sql = "INSERT INTO comptes (nom, email, adresse, email_entreprise, siret, password, role) VALUES (:nom, :email, :adresse, :email_entreprise, :siret, :password, :role)";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute([
                'nom' => $nom,
                'email' => $email,
                'adresse' => $adresse,
                'email_entreprise' => $email_entreprise,
                'siret' => $siret,
                'password' => $password,
                'role' => $role
            ]);
            $response = ['status' => 'success', 'message' => 'Compte créé avec succès.'];
        } catch (PDOException $e) {
            $response = ['status' => 'error', 'message' => 'Erreur lors de la création du compte.'];
        }
    } else {
        $response = ['status' => 'error', 'message' => 'Données manquantes.'];
    }
} else {
    $response = ['status' => 'error', 'message' => 'Méthode non autorisée.'];
}

echo json_encode($response); // Afficher la réponse unique
