
<html>
    <head>
        <title>Upload an Image</title>
    </head>
    <body>
        <div>
            <h1>Upload an Image</h1>
 
 
            <form method="post" action="upload.php" enctype="multipart/form-data">
                <div>
                    <input type="file" name="image" />
                    <input type="submit" value="Upload Image" />
                </div>
            </form>
        </div>


<?php
    /*
    $path = 'photos';
    if ($handle = opendir($path)) {
       while (false !== ($file = readdir($handle))) {
            if ($file != "." && $file != "..") {
                echo "$file<br>";
            }
        }
        closedir($handle);
    }*/
?>


    </body>
</html>
