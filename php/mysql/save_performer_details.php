<?php include("credentials.php")?>

<?php


$id = $_GET['id'];
$dob = $_GET['dob'];
$dod = $_GET['dod'];
$place = $_GET['place'];
$placeOfDeath = $_GET['placeOfDeath'];
/*$photo_name = $_FILES['photo_file']['name'];

$id = 1;
$dob = '01-01-1930';
$place = 'Jercey City, NJ';
*/

$photo_name = 'test';
$photo_ext = 'jpg';

// read photo file
$f_handle = fopen($photo_name, "rb");
$photo_bin = addslashes(fread($f_handle, filesize($photo_name)));
$photo_param = getimagesize($photo_name);
fclose($f_handle);

//echo $photo_ext . '<br/>';
//echo $photo_name . '<br/>';

$query_update = "UPDATE z_artist_details SET";

if ($dob && $dob != 'null' && $dob != '' && $dob != 0)
		$query_update = $query_update . " dob = '$dob',";
else
		$query_update = $query_update . " dob = NULL, ";

if ($dod && $dod != 'null' && $dod != '' && $dod != 0)
		$query_update = $query_update . " dod = '$dod', ";
else
		$query_update = $query_update . " dod = NULL, ";

$query_update = $query_update .	" place_of_birth = '$place', place_of_death = '$placeOfDeath', " .
		" photo_name = '$photo_name', photo_ext = '$photo_ext'" .
		" WHERE id = $id";
				
$result = mysql_db_query($dbname, $query_update);

//echo $query_update;

if (!$result) {
	echo json_encode('fail');
	echo $query_update . '<br/>';
	return mysql_errno($handler) . ": " . mysql_error($handler). "\n";
//	echo sqlsrv_get_last_message() + " " + $query_insert;
}
else {
	//$str = '$dod';
	echo json_encode($query_update);
}

mysql_free_result($result);

?>
