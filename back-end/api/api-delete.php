<?php
ini_set('display_errors', 0); // Désactiver l'affichage des erreurs
ini_set('display_startup_errors', 0); // Désactiver l'affichage des erreurs de démarrage
error_reporting(E_ALL); // Rapporter toutes les erreurs
ob_start(); // Démarrer la gestion des tampons de sortie

include '../includes/config.php'; // Inclure la configuration de la base de données
include_once '../includes/token.php'; // Inclure le fichier de vérification du token

header("Content-Type: application/json"); // Définir l'en-tête de la réponse comme JSON
header("Access-Control-Allow-Origin: *"); // Autoriser toutes les origines pour les requêtes CORS
header("Access-Control-Allow-Methods: DELETE, OPTIONS"); // Autoriser les méthodes DELETE et OPTIONS
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Autoriser les en-têtes Content-Type et Authorization

// Gérer les requêtes prévols OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Répondre avec un code de statut 200 pour les requêtes OPTIONS
    ob_end_clean(); // Nettoyer le tampon avant de quitter
    exit; // Terminer le script
}

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

// Vérification du token
$headers = getallheaders(); // Récupérer les en-têtes de la requête
if (!isset($headers['Authorization'])) { // Vérifier si l'en-tête 'Authorization' est présent
    http_response_code(401); // Répondre avec un code de statut 401 (Non autorisé)
    ob_clean(); // Nettoyer le tampon
    echo json_encode(['status' => 'error', 'message' => 'Token manquant.']); // Envoyer la réponse en JSON
    exit; // Terminer le script
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$user = verifyToken($token);

if (!$user) {
    http_response_code(401);
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Token invalide ou expiré.']);
    exit;
}

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['id'])) {
        $userId = $input['id'];

        try {
            $query = "DELETE FROM comptes WHERE id = ?";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$userId]);

            if ($stmt->rowCount() > 0) {
                ob_clean();
                echo json_encode(['status' => 'success', 'message' => 'Utilisateur supprimé avec succès.']);
                exit;
            } else {
                http_response_code(404);
                ob_clean();
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non trouvé.']);
                exit;
            }
        } catch (PDOException $e) {
            error_log('Erreur lors de la suppression de l\'utilisateur : ' . $e->getMessage());
            http_response_code(500);
            ob_clean();
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression de l\'utilisateur.']);
            exit;
        }
    } else {
        http_response_code(400);
        ob_clean();
        echo json_encode(['status' => 'error', 'message' => 'ID de l\'utilisateur manquant.']);
        exit;
    }
} else {
    http_response_code(405);
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Méthode HTTP non autorisée.']);
    exit;
}
