<?php
include("credentials.php");

// support the following commands:
//(1) Return the max value in the given field
//    cmd=maxid   tbl=Table   fld=Field#
//
//(2) Return a list of (id, name, abbr) in the Ax table:
//    cmd="list_skills"
//
//(3) Get the id for the given artist:
//    cmd="artist" fname=fname lname=lname skill=skill

function list_skills() {
    $query = "SELECT nid,cAxName,cAxAbbrev FROM Ax";
    $result = mysql_query($query);
   
    if(!$result) {
        echo "Error: $query";
    }
    else {
        $skills = array();
        while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
            $skills[] = array($row['nid'], $row['cAxName'], $row['cAxAbbrev']);
        }
        echo json_encode($skills);
        mysql_free_result($result);
    }
}

function maxid($table, $field) {
    $query = "SELECT MAX($table.$field) FROM $table;";
    $result = mysql_query($query);

    if(!$result) {
        echo "Error: $query";
    }
    else {
        $row = mysql_fetch_array($result);
        echo json_encode($row[0]);
        mysql_free_result($result);
    }
}


function artist_id($fname, $lname, $skill) {
    $fname = str_replace("\"","\"\"", $fname);
    $lname = str_replace("\"","\"\"", $lname);
    $query = "SELECT nid, fName, lName, nAxId FROM Artists " .
                "WHERE fName=\"$fname\" AND lName=\"$lname\" AND nAxId=\"$skill\";";
    $result = mysql_query($query);
    
    if(!$result) {
        echo "Error: $query";
    }
    else {
        $row = mysql_fetch_array($result);
        echo json_encode($row[0]);
        mysql_free_result($result);
    }
}

$cmd = $_GET['cmd'];
switch ($cmd) {
    case "maxid": maxid($_GET['tbl'], $_GET['fld']);    break;
    case "list_skills": list_skills(); break;
    case "artist_id": artist_id($_GET['fname'], $_GET['lname'], $_GET['skill']); break;
    default: 
}
?>
