<?php
include '../includes/config.php'; // Inclure la configuration de la base de données

header("Content-Type: application/json"); // Définir l'en-tête de la réponse comme JSON
header("Access-Control-Allow-Origin: *"); // Autoriser toutes les origines pour les requêtes CORS
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Autoriser les méthodes POST et OPTIONS
header("Access-Control-Allow-Headers: Content-Type"); // Autoriser l'en-tête Content-Type

// Gérer les requêtes prévols OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Répondre avec un code de statut 200 pour les requêtes OPTIONS
    exit; // Terminer le script
}

// Vérifier si la méthode de la requête est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['userId'])) { // Vérifier si le champ 'userId' est présent dans la requête
        $userId = $_POST['userId'];

        try {
            // Vérifier si l'utilisateur existe
            $checkQuery = "SELECT id FROM comptes WHERE id = ?";
            $checkStmt = $pdo->prepare($checkQuery);
            $checkStmt->execute([$userId]);

            if ($checkStmt->rowCount() === 0) { // Si l'utilisateur n'existe pas
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non trouvé.']); // Envoyer un message d'erreur en JSON
                exit; // Terminer le script
            }

            // Vérifier si un token valide existe déjà
            $tokenQuery = "SELECT token FROM tokens WHERE user_id = ? AND expiry > ?";
            $tokenStmt = $pdo->prepare($tokenQuery);
            $tokenStmt->execute([$userId, time()]);
            $existingToken = $tokenStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingToken) { // Si un token valide existe déjà
                // Un token valide existe déjà, le renvoyer
                echo json_encode(['token' => $existingToken['token']]); // Envoyer le token existant en JSON
            } else {
                // Aucun token valide trouvé, générer un nouveau token
                $token = bin2hex(random_bytes(32)); // Générer un token aléatoire
                $expiry = time() + 3600; // Le token expire dans 1 heure

                // Insérer le token dans la table tokens
                $insertQuery = "INSERT INTO tokens (user_id, token, expiry) VALUES (?, ?, ?)";
                $insertStmt = $pdo->prepare($insertQuery);
                $insertStmt->execute([$userId, $token, $expiry]);

                // Vérifier si l'insertion a réussi
                if ($insertStmt->rowCount() > 0) {
                    // Réponse de succès avec le token généré
                    echo json_encode(['token' => $token]);
                } else {
                    // Réponse d'erreur si l'insertion a échoué
                    echo json_encode(['status' => 'error', 'message' => 'Échec de l\'insertion du token.']);
                }
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
