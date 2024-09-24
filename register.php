<!DOCTYPE html>
<html>

<head>
    <title>Inscription</title>
    <link rel="stylesheet" href="./styles/register-style.css">
</head>

<body>
    <?php require 'header.php'; ?>

    <h2>Inscription</h2>
    <form action="register.php" method="post">
        <label>Nom d'utilisateur:</label>
        <input type="text" name="username" required><br>
        <label>Email:</label>
        <input type="email" name="email" required><br>
        <label>Mot de passe:</label>
        <input type="password" name="password" required><br>
        <label>Rôle:</label>
        <select name="role" required>
            <option value="client">Client</option>
            <option value="employer">Employé</option>
            <option value="admin">Admin</option>
        </select><br>
        <input type="submit" value="S'inscrire">
    </form>

    <?php
    require('config.php');

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $username = mysqli_real_escape_string($conn, $_POST['username']);
        $email = mysqli_real_escape_string($conn, $_POST['email']);
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $role = mysqli_real_escape_string($conn, $_POST['role']);

        $sql = "INSERT INTO users (username, email, password, role) VALUES ('$username', '$email', '$password', '$role')";

        if (mysqli_query($conn, $sql)) {
            echo "Inscription réussie!";
        } else {
            echo "Erreur: " . $sql . "<br>" . mysqli_error($conn);
        }
    }
    ?>
</body>

</html>