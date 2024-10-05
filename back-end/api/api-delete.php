<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ob_start(); // Démarrer la gestion des tampons de sortie

include '../includes/config.php';
include_once '../includes/token.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Gérer les requêtes prévols OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean(); // Nettoyer le tampon avant de quitter
    exit;
}

// Fonction pour récupérer les en-têtes si `getallheaders` n'est pas disponible
if (!function_exists('getallheaders')) {
    function getallheaders()
    {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

// Vérification du token
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Token manquant.']);
    exit;
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
