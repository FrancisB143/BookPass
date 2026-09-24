<?php
/**
 * Database connection — a copy of the connection.php already on the server.
 *
 * Committed with placeholder credentials so the repository is complete. The
 * real connection.php stays on Freehostia and is gitignored, so the password
 * never reaches GitHub.
 *
 * On Freehostia the server name is "localhost", and the database name and
 * username are both prefixed with your account.
 */
class dbObj
{
        var $servername = "localhost";
        var $username = "yourprefix_dbuser";
        var $password = "your-password-here";
        var $dbname = "yourprefix_dbname";
        var $conn;

        public function getConnstring()
        {
                $this->conn = mysqli_connect($this->servername, $this->username, $this->password, $this->dbname);
                if(!$this->conn){
                   die("Connection Failed: " . mysqli_connect_error());

                }else{
                return $this->conn;}
        }
}
?>
