<?php
include '../includes/config.php'; // Inclure la configuration de la base de données
include_once '../includes/token.php'; // Inclure le fichier de vérification du token

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérification du token
$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['status' => 'error', 'message' => 'Token manquant.']);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$user = verifyToken($token);

if (!$user) {
    http_response_code(401); // Unauthorized
    echo json_encode(['status' => 'error', 'message' => 'Token invalide ou expiré.']);
    exit;
}

// Suppression d'un utilisateur ou d'une facture
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['id'])) {
        $id = $input['id'];
        $isUser = isset($input['type']) && $input['type'] === 'user';

        try {
            // Vérification de la connexion PDO
            if (!$pdo) {
                throw new Exception('Connexion à la base de données échouée.');
            }

            if ($isUser) {
                // Suppression d'un utilisateur
                $query = "DELETE FROM comptes WHERE id = ?";
            } else {
                // Suppression d'une facture
                $query = "DELETE FROM factures WHERE id = ?";
            }

            $stmt = $pdo->prepare($query);
            if (!$stmt) {
                throw new Exception('Erreur lors de la préparation de la requête.');
            }

            $stmt->execute([$id]);

            // Vérifiez si une ligne a été affectée
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => $isUser ? 'Utilisateur supprimé avec succès.' : 'Facture supprimée avec succès.']);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['status' => 'error', 'message' => 'Aucun enregistrement trouvé avec cet ID.']);
            }
        } catch (PDOException $e) {
            http_response_code(500); // Internal Server Error
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression : ' . $e->getMessage()]);
        } catch (Exception $e) {
            http_response_code(500); // Internal Server Error
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'ID requis pour la suppression.']);
    }
}

$stmt = null; // Libérer la mémoire
$pdo = null; // Fermer la connexion
