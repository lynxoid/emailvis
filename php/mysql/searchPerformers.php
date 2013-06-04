<?php 
  include "credentials.php";
	
	if (!$handler) {
		die("Could not connect");
	}
	else {

    $q = trim(strtolower($_GET["q"]));

    if (!$q) return;

		$query = 	"SELECT DISTINCT Artists.fName, Artists.lName, Artists.nid, Ax.cAxAbbrev
					FROM Artists, Ax
					WHERE Ax.nId = Artists.nAxId AND (CONCAT(fName, ' ', lName) LIKE '%$q%')
					ORDER BY Artists.lName, Artists.fName, Ax.cAxAbbrev";

    // echo $query . "<br>";
						
		$result = mysql_query($query, $handler);
		
    $performers = array();
    if ($result == null) {
      echo "Could not connect";
      return;
    }
    while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
      $fName = $row['fName'];
      $lName = $row['lName'];
      $entry =  array($fName, $lName, $row['nid'],  $row['cAxAbbrev'], False);
      $performers[] = $entry;
    }

    for ($i = 0; $i < count($performers) - 1; $i++) {
      if ($performers[$i][0] == $performers[$i+1][0] &&
        $performers[$i][1] == $performers[$i+1][1]) {
        $performers[$i][4] = True; // name clash
        $performers[$i+1][4] = True; // name clash
        //var_dump($performers[$i]);
        //echo " --- <br>";
      }
    }
    for ( $i = 0; $i < count($performers); $i++)
      if ($performers[$i][4] == True)
        echo $performers[$i][0]."|".$performers[$i][1]."|".$performers[$i][2]."|".$performers[$i][3]."\n";
      else
        echo $performers[$i][0]."|".$performers[$i][1]."|".$performers[$i][2]."\n";
	}
?>
