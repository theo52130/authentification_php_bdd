<?php
include '../includes/config.php'; // Inclure la configuration de la base de données
include_once '../includes/token.php'; // Inclure le fichier de vérification du token

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérification du token
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    echo json_encode(['status' => 'error', 'message' => 'Token manquant.']);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$user = verifyToken($token);

if (!$user) {
    echo json_encode(['status' => 'error', 'message' => 'Token invalide ou expiré.']);
    exit;
}

// Vérification de l'existence de l'ID utilisateur
if (!isset($user['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'ID utilisateur manquant dans le token.']);
    exit;
}

// Récupération des utilisateurs
if (isset($_GET['method'])) {
    $method = $_GET['method'];

    switch ($method) {
        case 'getUsers':
            fetchUsers($pdo);
            break;

        case 'getClients':
            fetchClients($pdo);
            break;

        case 'getFactures':
            fetchFactures($pdo, $user['id']);
            break;

        case 'getProduits':
            fetchProduits($pdo);
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Méthode non reconnue.']);
            break;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Aucune méthode spécifiée.']);
}

function fetchUsers($pdo)
{
    try {
        $query = "SELECT `id`, `nom`, `email`, `adresse`, `email_entreprise`, `siret`, `role` FROM `comptes`";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'users' => $users]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des utilisateurs : ' . $e->getMessage()]);
    }
}

function fetchClients($pdo)
{
    try {
        $query = "SELECT `id`, `nom` FROM `comptes` WHERE `role` = 'client'";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'clients' => $clients]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des clients : ' . $e->getMessage()]);
    }
}

function fetchFactures($pdo, $client_id)
{
    try {
        // Exemple : Récupération des factures avec l'email du client
        $query = "
            SELECT f.id, f.date_creation, f.total, f.etat, c.email
            FROM factures f
            JOIN comptes c ON f.client_id = c.id"; // Assurez-vous que f.client_id correspond à la clé étrangère
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $factures = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'factures' => $factures]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des factures : ' . $e->getMessage()]);
    }
}


function fetchProduits($pdo)
{
    try {
        $query = "SELECT id, description, prix_unitaire FROM produits";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'produits' => $produits]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des produits : ' . $e->getMessage()]);
    }
}
