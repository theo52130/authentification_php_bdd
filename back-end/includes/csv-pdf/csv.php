<?php
session_start();

// Vérification de la connexion et du rôle
if (!isset($_SESSION['nom']) || $_SESSION['role'] != 'admin') {
    header("Location: ../public/login.php");
    exit();
}

include "../includes/config.php";

// Requête SQL pour récupérer les factures et leurs produits associés
$sql_factures = "
    SELECT 
        f.id AS facture_id, 
        f.date_creation, 
        f.total, 
        f.etat, 
        c.email AS client_email, 
        p.description AS produit_description, 
        p.prix_unitaire, 
        fp.quantite
    FROM factures f
    LEFT JOIN comptes c ON f.client_id = c.id
    LEFT JOIN factures_produits fp ON f.id = fp.facture_id
    LEFT JOIN produits p ON fp.produit_id = p.id
    ORDER BY f.id, p.id;
";

$result_factures = $conn->query($sql_factures);

if ($result_factures === false) {
    die("Erreur de requête : " . $conn->error);
}

// Définir les en-têtes HTTP pour indiquer qu'il s'agit d'un fichier CSV à télécharger
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="factures.csv"');

// Ouvrir le flux de sortie pour écrire le fichier CSV directement dans la réponse HTTP
$output = fopen('php://output', 'w');

// Écrire les en-têtes des colonnes dans le CSV
fputcsv($output, ['Ref Facture', 'Email Client', 'Date', 'Total', 'État', 'Produit', 'Prix Unitaire', 'Quantité']);

// Variable pour stocker l'ID de la dernière facture afin de ne pas répéter les informations principales
$last_facture_id = null;

while ($row = $result_factures->fetch_assoc()) {
    // Si une nouvelle facture est détectée, écrire les informations principales (ID, client, date, etc.)
    if ($last_facture_id !== $row['facture_id']) {
        fputcsv($output, [
            $row['facture_id'],
            $row['client_email'],
            date("d/m/Y", strtotime($row['date_creation'])),
            number_format($row['total'], 2),
            $row['etat'],
            '', // Pas de produit sur cette ligne (réservée pour les infos de la facture)
            '', // Pas de prix unitaire
            ''  // Pas de quantité
        ]);
        $last_facture_id = $row['facture_id'];
    }

    // Toujours écrire les informations du produit
    fputcsv($output, [
        '', // Ref Facture vide
        '', // Email Client vide
        '', // Date vide
        '', // Total vide
        '', // État vide
        $row['produit_description'], // Description du produit
        number_format($row['prix_unitaire'], 2), // Prix unitaire
        $row['quantite'] // Quantité
    ]);
}

// Fermer le fichier et la connexion à la base de données
fclose($output);
$conn->close();
exit();
