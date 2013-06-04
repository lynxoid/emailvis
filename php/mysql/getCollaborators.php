<?php include("credentials.php")?>

<?php

////////////////////////////////////////////////////////////
//
// given a performerID, get all performers that have ever
// collaborated with that performer
// if startDate, endDate are provided, only returns collaborators 
// within that time period
//
////////////////////////////////////////////////////////////

$performerID = $_GET['performerID'];
//$performerID = 1050; // test id
    $query1 = "SELECT blah.*, COUNT(blah.nArtId) as session_count, angle
                FROM (
                      	SELECT p2.nArtId, Artists.fName, Artists.lName
                        FROM Players AS p2, (
                                -- get sessions the artist played in
                                SELECT DISTINCT nSessId
                                FROM Players
                                WHERE Players.nArtId = $performerID) AS p1, Artists
                        WHERE p2.nSessId = p1.nSessId
                        AND p2.nArtId = Artists.nid
                        AND p2.nArtId <> $performerID
                        GROUP BY p2.nArtId, Artists.fName, Artists.lName, p2.nSessID
                ) as blah,
                (SELECT main_id as m, collab_id as c,angle FROM collab_angles WHERE main_id = $performerID
                UNION
                SELECT collab_id as m, main_id as c,angle FROM collab_angles WHERE collab_id = $performerID
                ) as foo
    WHERE foo.c = blah.nArtId    
    GROUP BY blah.nArtId
    ORDER BY angle";

$result = mysql_query($query1, $handler);

if (!$result) {
	echo 'Could not load collaborators: ' + $query1;
	//echo sqlsrv_get_last_message() + " " + $query1;
}
else {
	// otherwise iterate through rows
	$collaborators = array();
	
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$fName = $row['fName'];
		$lName = $row['lName'];
		$id = intval($row['nArtId']);
		$count = intval($row['session_count']);
		$angle = $row['angle'];
	        $influence = 1;//$row["influence"];
//		$entry = array('id' => $id, 'f_name' => $fName, 'l_name' => $lName, 'session_count' => $count);
		$entry = array($id, $fName, $lName, $count, $angle, $influence);
		$collaborators[] = $entry;
	}

  // get max_infl value
  /*$query = "SELECT id2, influence FROM influence_pairs WHERE id1 = $performerID";
  $result = mysql_query($query, $handler);
  $pairs = array();
  if (!$result) {
      echo 'An error getting max influence';
  }
  else {
      //$row = mysql_fetch_array($result, MYSQL_ASSOC);
      while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
        $pairs[] = array($row["id2"], $row["influence"]);
      }
  }*/

	$data = array('array' => $collaborators);
//  $i = 0;
//  for ($i = 0; $i < 600; $i++)
  	echo json_encode($data);
}

//mysql_free_result($result);

?>
