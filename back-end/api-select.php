<?php
include 'config.php'; // Inclure la configuration de la base de données

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Vérifie la méthode de la requête
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Récupérer tous les utilisateurs
    if (isset($_GET['method']) && $_GET['method'] === 'getUsers') {
        $query = "SELECT id, nom, email, adresse, email_entreprise, siret, role FROM comptes";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'users' => $users
        ]);
        exit;
    }

    // Récupérer toutes les factures
    if (isset($_GET['method']) && $_GET['method'] === 'getInvoices') {
        $query = "SELECT f.id, f.client_id, f.date_facture, f.montant, f.statut, c.nom as client_nom
                  FROM factures f
                  JOIN comptes c ON f.client_id = c.id"; // Associer les factures aux utilisateurs
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'invoices' => $invoices
        ]);
        exit;
    }

    // Si la méthode n'est pas reconnue
    echo json_encode([
        'status' => 'error',
        'message' => 'Méthode non reconnue.'
    ]);
    exit;
}

// Si la méthode n'est pas autorisée
echo json_encode([
    'status' => 'error',
    'message' => 'Méthode non autorisée.'
]);
