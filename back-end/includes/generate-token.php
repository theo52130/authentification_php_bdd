<?php
include '../includes/config.php'; // Inclure la configuration de la base de données

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['userId'])) {
        $userId = $_POST['userId'];

        try {
            // Vérifier si l'utilisateur existe
            $checkQuery = "SELECT id FROM comptes WHERE id = ?";
            $checkStmt = $pdo->prepare($checkQuery);
            $checkStmt->execute([$userId]);

            if ($checkStmt->rowCount() === 0) {
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non trouvé.']);
                exit;
            }

            // Générer un token unique
            $token = bin2hex(random_bytes(32));
            $expiry = time() + 3600; // Le token expire dans 1 heure

            // Insérer le token dans la table tokens
            $query = "INSERT INTO tokens (user_id, token, expiry) VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$userId, $token, $expiry]);

            // Vérifier si l'insertion a réussi
            if ($stmt->rowCount() > 0) {
                // Réponse de succès avec le token généré
                echo json_encode(['token' => $token]);
            } else {
                // Réponse d'erreur si l'insertion a échoué
                echo json_encode(['status' => 'error', 'message' => 'Échec de l\'insertion du token.']);
            }
        } catch (PDOException $e) {
            // Réponse d'erreur en cas de problème de connexion à la base de données
            echo json_encode(['status' => 'error', 'message' => 'Erreur de connexion à la base de données : ' . $e->getMessage()]);
        }
    } else {
        // Réponse d'erreur si le champ userId est manquant
        echo json_encode(['status' => 'error', 'message' => 'Champ userId requis.']);
    }
} else {
    // Réponse d'erreur si la méthode HTTP n'est pas POST
    echo json_encode(['status' => 'error', 'message' => 'Méthode HTTP non autorisée.']);
}
