<?php

require '../fpdf/fpdf.php';
require './config.php';
define("TVA", 0.196);

class PDF extends FPDF
{
    function __construct()
    {
        parent::__construct();
        $this->SetCreator("www.tbyInnovations.com");
    }

    function hautDePage($compte, $facture)
    {
        // En-tête de la facture
        $this->SetFont('Arial', 'B', 12);
        $this->SetTextColor(0, 0, 200);
        $this->SetXY(10, 30);
        $this->Cell(50, 6, "www.tbyInnovations.com", 0, 2, '', false);
        $this->SetFont('Arial', '', 12);
        $this->SetTextColor(0, 0, 0);
        $this->MultiCell(50, 5, "7bis Av. Robert Schuman\n51100\nTel: 03.26.40.04.45", 0, 'L', false);

        // Informations de la facture
        $this->SetXY(65, 30);
        $this->SetFillColor(200, 200, 200);
        $this->SetFont('Arial', 'B', 15);
        $this->Cell(140, 6, "FACTURE", 1, 2, 'C', true);
        $this->SetFont('Arial', '', 12);
        $this->SetXY(65, 38);
        $this->MultiCell(130, 5, "Facture numéro : " . $facture['id'] . "\nDate de création : " . date("d.m.y", strtotime($facture['date_creation'])), '', 'L', false);
        $this->SetTitle("Facture numéro : " . $facture['id']);

        // Adresse de facturation
        $this->SetXY(10, 60);
        $this->SetFillColor(200, 200, 200);
        $this->SetFont('Arial', 'B', 12);
        $this->Cell(90, 6, "Adresse de facturation", 1, 2, 'C', true);
        $this->SetFont('Arial', '', 12);
        $this->MultiCell(90, 5, "Client: " . $compte['nom'] . "\n" . $compte['adresse'], 'LRB', 'L', false);
    }

    function tableArticles($produits)
    {
        $prixTotalHorsTaxes = 0;

        if (empty($produits)) {
            $this->Cell(0, 10, "Aucun produit trouvé pour cette facture.", 0, 1, 'C');
            return;
        }

        // Entêtes de colonnes
        $header = array('Ref', 'Désignation', 'Prix Unitaire HT', 'Qte', 'Prix Total HT');
        $w = array(20, 80, 34, 20, 36);
        $this->SetFont('Arial', 'B', 12);
        foreach ($header as $i => $col) {
            $this->Cell($w[$i], 7, $col, 1, 0, 'C');
        }
        $this->Ln();

        // Impression des lignes de la table
        $this->SetFont('Arial', '', 12);
        foreach ($produits as $produit) {
            $prixTotal = $produit['prix_unitaire'] * $produit['quantite'];
            $prixTotalHorsTaxes += $prixTotal;

            $this->Cell($w[0], 6, $produit['id'], 1);
            $this->Cell($w[1], 6, $produit['description'], 1);
            $this->Cell($w[2], 6, number_format($produit['prix_unitaire'], 2, ',', ' ') . " euros", 1);
            $this->Cell($w[3], 6, $produit['quantite'], 1);
            $this->Cell($w[4], 6, number_format($prixTotal, 2, ',', ' ') . " euros", 1);
            $this->Ln();
        }

        // Total HT
        $this->SetY($this->GetY() + 5);
        $this->Cell(54, 6, "Total Hors Taxes", 1, 0, 'L');
        $this->Cell(39, 6, number_format($prixTotalHorsTaxes, 2, ',', ' ') . " euros", 1, 2, 'C');
        $totalTVA = $prixTotalHorsTaxes * TVA;
        $this->Cell(54, 6, "TVA à " . (TVA * 100) . " %", 1, 0, 'L');
        $this->Cell(39, 6, number_format($totalTVA, 2, ',', ' ') . " euros", 1, 2, 'C');
        $this->Cell(54, 6, "Total TTC", 1, 0, 'L');
        $this->Cell(39, 6, number_format($prixTotalHorsTaxes + $totalTVA, 2, ',', ' ') . " euros", 1, 2, 'C');
    }

    function Footer()
    {
        // Positionnement à 1,5 cm du bas
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 4, 'Page ' . $this->PageNo() . '/{nb}', 0, 2, 'C');
    }
}

// Vérifiez si l'ID de facture est défini
if (isset($_POST['id'])) {
    $idFacture = intval($_POST['id']);

    try {
        // Récupérer les informations de la facture
        $queryFacture = "SELECT * FROM factures WHERE id = ?";
        $stmtFacture = $pdo->prepare($queryFacture);
        $stmtFacture->execute([$idFacture]);
        $facture = $stmtFacture->fetch();

        if (!$facture) {
            throw new Exception('Aucune facture trouvée.');
        }

        // Récupérer les informations du client
        $queryClient = "SELECT * FROM comptes WHERE id = ?";
        $stmtClient = $pdo->prepare($queryClient);
        $stmtClient->execute([$facture['client_id']]); // Remplacez `client_id` par le nom de votre colonne
        $compte = $stmtClient->fetch();

        if (!$compte) {
            throw new Exception('Aucun compte trouvé pour ce client.');
        }

        // Récupérer les produits associés à la facture
        $queryProduits = "SELECT p.id, p.description, p.prix_unitaire, fp.quantite
                          FROM produits p
                          JOIN factures_produits fp ON p.id = fp.produit_id
                          WHERE fp.facture_id = ?";
        $stmtProduits = $pdo->prepare($queryProduits);
        $stmtProduits->execute([$idFacture]);
        $produits = $stmtProduits->fetchAll(PDO::FETCH_ASSOC);

        // Envoyer les en-têtes HTTP pour afficher le PDF
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="facture_' . $facture['id'] . '.pdf"');

        // Génération du PDF
        $pdf = new PDF();
        $pdf->AliasNbPages();
        $pdf->AddPage();
        $pdf->hautDePage($compte, $facture);
        $pdf->tableArticles($produits);
        $pdf->Output("I", "facture_" . $facture['id'] . ".pdf"); // Changer "D" en "I" pour afficher dans le navigateur
    } catch (Exception $e) {
        echo 'Erreur : ' . $e->getMessage();
    }
} else {
    echo 'Erreur : ID de facture manquant.';
}
?>
