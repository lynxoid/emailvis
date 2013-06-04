<?php include("credentials.php")?>

<?php

///////////////////////////////////////////
//
// Given id, return performer's dob, dod, birthplace
//
///////////////////////////////////////////

//$performerID = $_GET['performerID'];
$performerID = 25;
$dod = '01-01-1920';
$dob = '01-01-1951';
$place = 'Louisiana';
$photo_name = 'blah';
$photo_ext = 'png';
$photo = null;

// TODO: save photo as binary

$query = "UPDATE z_artist_details SET id = '$performerID',' . 
		' dob = $dob, dod = $dod, place_of_birth = $place,' .
		' photo_name = $photo_name, photo_ext = $photo_ext";
$result = sqlsrv_query($handler, $query);

if (!$result) {
	echo 'trouble in paradise';
	return mysql_errno($handler) . ": " . mysql_error($handler). "\n";
}
else {
	$person = array();
	$row = mysql_fetch_array($dbname, $result);
	$entry = array('id' => $row["id"], 
		'dob' => $row["dob"],
		'dod' => $row["dod"], 
		'place' => $row["place_of_birth"],
		'photo_name' => $row["photo_name"],
		'photo_ext' => $row["photo_ext"]/*,
		'photo' => $row["photo"]*/);
	
	echo json_encode($entry);
}

mysql_free_result($result);
?>
