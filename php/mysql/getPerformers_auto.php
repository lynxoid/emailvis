<?php include("credentials.php")?>

<?php
//	$performers = array();
	
	if (!$handler) {
		die("Could not connect");
	}
	else {
		$query = 	"SELECT DISTINCT Artists.fName, Artists.lName, Artists.nid, Ax.cAxAbbrev
					FROM Artists, Ax
					WHERE Ax.nId = Artists.nAxId
					ORDER BY Artists.lName, Artists.fName";
						
		$result = mysql_query($query, $handler);
		
		$performers = array();
		if ($result != null) {
			while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
				$fName = $row['fName'];
				$lName = $row['lName'];
//				$entry =  array("fName" => $fName, 'lName'=> $lName, "id" => "{$row['nid']}", "ax" => $row['cAxAbbrev'] );
				$entry =  array($fName, $lName, $row['nid'],  $row['cAxAbbrev']);
				$performers[] = $entry;
			}
		}
		
		echo json_encode(array("performers"=>$performers));
	}
?>
