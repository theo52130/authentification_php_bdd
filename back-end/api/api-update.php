<?php
// api-update.php
include '../includes/config.php';
include_once '../includes/token.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    echo json_encode(['status' => 'error', 'message' => 'Token manquant.']);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$user = verifyToken($token);

if (!$user || !isset($user['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Token invalide ou ID utilisateur manquant.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'ID utilisateur manquant.']);
    exit;
}

// Préparer la mise à jour
try {
    // Mise à jour des informations de l'utilisateur
    $query = "UPDATE `comptes` SET `nom` = ?, `email` = ?, `adresse` = ?, `email_entreprise` = ?, `siret` = ?, `role` = ? WHERE `id` = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$data['nom'], $data['email'], $data['adresse'], $data['email_entreprise'], $data['siret'], $data['role'], $data['id']]);

    // Vérifier si un mot de passe a été fourni
    if (isset($data['password']) && !empty($data['password'])) {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $queryPassword = "UPDATE `comptes` SET `password` = ? WHERE `id` = ?";
        $stmtPassword = $pdo->prepare($queryPassword);
        $stmtPassword->execute([$hashedPassword, $data['id']]);
    }

    echo json_encode(['status' => 'success', 'message' => 'Compte mis à jour avec succès.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la mise à jour du compte : ' . $e->getMessage()]);
}
