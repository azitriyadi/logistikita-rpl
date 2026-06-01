<?php
$data = array(
    'user_id' => 3,
    'pengirim_nama' => 'Test',
    'pengirim_telp' => '123',
    'pengirim_alamat' => 'Test',
    'penerima_nama' => 'Test',
    'penerima_telp' => '123',
    'penerima_alamat' => 'Test',
    'berat' => 1,
    'layanan' => 'Logisti-Express',
    'biaya_ongkir' => 15000,
    'asuransi' => false,
    'nilai_barang' => 0
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents('http://localhost/logistikita/index.php?request=api/logistikita/request_pengiriman', false, $context);
if ($result === FALSE) {
    echo "Error fetching URL.";
} else {
    echo "Response:\n";
    echo $result;
}
?>
