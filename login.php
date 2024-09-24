<!DOCTYPE html>
<html>

<head>
    <title>Connexion</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <h2>Connexion</h2>
    <form action="login.php" method="post">
        <label>Email:</label>
        <input type="email" name="email" required><br>
        <label>Mot de passe:</label>
        <input type="password" name="password" required><br>
        <input type="submit" value="Se connecter">
    </form>

    <?php
    require('config.php');
    session_start();

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $email = mysqli_real_escape_string($conn, $_POST['email']);
        $password = $_POST['password'];

        $sql = "SELECT * FROM users WHERE email = '$email'";
        $result = mysqli_query($conn, $sql);
        $user = mysqli_fetch_assoc($result);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];

            if ($_SESSION['role'] == 'admin') {
                header("Location: welcome-admin.php");
            } elseif ($_SESSION['role'] == 'employer') {
                header("Location: welcome-employer.php");
            } elseif ($_SESSION['role'] == 'client') {
                header("Location: welcome-client.php");
            }
            exit();
        } else {
            echo "Email ou mot de passe incorrect.";
        }
    }
    ?>
</body>

</html>