<?php
include 'config.php'; // Inclure la configuration de la base de données

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['email']) && isset($_POST['password'])) {
        $email = $_POST['email'];
        $password = $_POST['password'];

        // Prépare la requête pour récupérer les informations de l'utilisateur
        $query = "SELECT id, nom, email, adresse, email_entreprise, siret, password, role FROM comptes WHERE email = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) { // Vérifie le mot de passe haché
            unset($user['password']); // Ne pas envoyer le mot de passe
            $response = [
                'status' => 'success',
                'user' => $user // Retourne les informations de l'utilisateur
            ];
        } else {
            $response = [
                'status' => 'error',
                'message' => 'Email ou mot de passe incorrect.'
            ];
        }
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Email ou mot de passe manquant.'
        ];
    }
} else {
    $response = [
        'status' => 'error',
        'message' => 'Méthode non autorisée.'
    ];
}

echo json_encode($response);
