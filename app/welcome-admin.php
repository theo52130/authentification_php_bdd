<?php
session_start();
if (!isset($_SESSION['username']) || $_SESSION['role'] != 'admin') {
    header("Location: ../login.php");
    exit();
}
?>

<!DOCTYPE html>
<html>

<head>
    <title>Bienvenue</title>
</head>

<body>
    <?php require '../header.php'; ?>

    <h2>Bienvenue, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h2>
    <p>Votre email est: <?php echo htmlspecialchars($_SESSION['email']); ?></p>
    <p>Votre rôle est: <?php echo htmlspecialchars($_SESSION['role']); ?></p>

    <p>Vous avez accès aux fonctionnalités d'administration.</p>

    <a href="index.php">Accueil</a>
    <a href="logout.php">Déconnexion</a>
</body>

</html>