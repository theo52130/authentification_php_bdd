<?php

require './config.php';

// Génération du CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="factures.csv"');

// Ouverture de la sortie pour écrire le CSV
$output = fopen('php://output', 'w');
fputcsv($output, ['ID Facture', 'Email Client', 'Date de Création', 'Montant Total', 'État', 'Produits Associés']);

// Requête SQL pour récupérer les factures et produits associés
$query = "SELECT f.id, c.email, f.date_creation, f.montant_total, f.etat, 
          GROUP_CONCAT(p.nom SEPARATOR '; ') AS produits
          FROM factures f 
          LEFT JOIN comptes c ON f.id_client = c.id 
          LEFT JOIN factures_produits fp ON f.id = fp.id_facture 
          LEFT JOIN produits p ON fp.id_produit = p.id 
          GROUP BY f.id";

$stmt = $pdo->query($query);

// Écriture des données dans le fichier CSV
while ($row = $stmt->fetch()) {
    fputcsv($output, [
        $row['id'], 
        $row['email'], 
        $row['date_creation'], 
        $row['montant_total'], 
        $row['etat'], 
        $row['produits'] ?: 'Aucun produit' // Affiche "Aucun produit" si aucun produit
    ]);
}

// Fermer la sortie
fclose($output);
exit();
?>