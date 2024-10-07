<?php
header("Content-Type: application/json");
include '../includes/config.php'; // Assure-toi d'inclure ta connexion à la base de données

$input = json_decode(file_get_contents('php://input'), true);

// Récupération des données
$client_id = $input['client'] ?? null;
$total = $input['montant'] ?? null;
$produits = $input['produits'] ?? null;

// Vérification des données
if (is_null($client_id) || is_null($total) || is_null($produits) || !is_array($produits) || count($produits) === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Champ client_id, produits et total requis.']);
    exit;
}

// Création de la facture
$date_creation = date('Y-m-d'); // Date actuelle
$etat = 'non payée'; // État par défaut

try {
    $query = "INSERT INTO factures (client_id, date_creation, total, etat) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$client_id, $date_creation, $total, $etat]);

    // Vérifiez si l'insertion a réussi
    if ($stmt->rowCount() > 0) {
        $facture_id = $pdo->lastInsertId();

        // Ajout des produits à la table factures_produits
        foreach ($produits as $produit) {
            $produit_id = $produit['id'];
            $quantite = $produit['quantite'];

            $queryProduit = "INSERT INTO factures_produits (facture_id, produit_id, quantite) VALUES (?, ?, ?)";
            $stmtProduit = $pdo->prepare($queryProduit);
            $stmtProduit->execute([$facture_id, $produit_id, $quantite]);

            // Vérifiez si l'insertion du produit a réussi
            if (!$stmtProduit) {
                throw new Exception("Erreur lors de l'ajout du produit avec ID: $produit_id");
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Facture créée avec succès', 'facture_id' => $facture_id]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création de la facture']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur SQL : ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    $stmt = null; // Libérer la mémoire
    $pdo = null; // Fermer la connexion
}
