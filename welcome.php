<?php
session_start();
if (!isset($_SESSION['username']) && $_SESSION['role'] == 'admin') {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html>

<head>
    <title>Bienvenue</title>
    <link rel="stylesheet" href="style.css">

</head>

<body>
    <h2>Bienvenue, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h2>
    <p>Votre email est: <?php echo htmlspecialchars($_SESSION['email']); ?></p>
    <p>Votre rôle est: <?php echo htmlspecialchars($_SESSION['role']); ?></p>

    <?php if ($_SESSION['role'] == 'admin'): ?>
        <p>Vous avez accès aux fonctionnalités d'administration.</p>
    <?php elseif ($_SESSION['role'] == 'employer'): ?>
        <p>Vous avez accès aux fonctionnalités pour les employés.</p>
    <?php elseif ($_SESSION['role'] == 'client'): ?>
        <p>Vous avez accès aux fonctionnalités pour les clients.</p>
    <?php endif; ?>

    <a href="logout.php">Déconnexion</a>
</body>

</html>