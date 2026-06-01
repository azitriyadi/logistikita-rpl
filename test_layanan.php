<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
$conn = new mysqli("localhost", "root", "", "logistikita");
$res = $conn->query("SELECT * FROM layanan");
echo "Rows: " . $res->num_rows . "\n";
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
