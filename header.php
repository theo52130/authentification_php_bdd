<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./styles/header-style.css">
    <title>Header</title>
</head>

<body>
    <header>
        <nav>
            <ul>
                <li><a href="intersection.php">Dashboard</a></li>
                <?php
                if (!isset($_SESSION['username'])) { ?>
                    <li><a href="login.php">Connexion</a></li>
                    <li><a href="register.php">Inscription</a></li>
                <?php
                } else { ?>
                    <li><a href="logout.php">Déconnexion</a></li>
                <?php
                }
                ?>
            </ul>
        </nav>
    </header>
</body>

</html>