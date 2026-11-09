import java.sql.*;
import java.util.*;

public class Sql_Queries {

    public static void main(String[] args) {

        String url = "jdbc:mysql://localhost:3306/netflix_db";
        String username = "root";
        String password = "Seige@109";

        Scanner sc = new Scanner(System.in);

        try {

            Class.forName("com.mysql.cj.jdbc.Driver");
            
            Connection conn =
                DriverManager.getConnection(url, username, password);

            CallableStatement cs =
                conn.prepareCall("{CALL LoginUser(?, ?)}");

            System.out.print("Enter Email: ");
            String login_email = sc.next();

            System.out.print("Enter Password: ");
            String login_password = sc.next();

            cs.setString(1, login_email);
            cs.setString(2, login_password);

            ResultSet rs = cs.executeQuery();

            if (rs.next()) {
                System.out.println("\nLogin Successful");
                System.out.println("Account ID : " + rs.getInt("account_id"));
                System.out.println("Name       : " + rs.getString("name"));
                System.out.println("Email      : " + rs.getString("email"));
                System.out.println("Country    : " + rs.getString("country"));
                System.out.println("Plan       : " + rs.getString("plan"));
                System.out.println("MaxScreens : " + rs.getInt("max_screens"));
                System.out.println("Resolution : " + rs.getString("resolution"));
            } else {
                System.out.println("Invalid Email or Password");
            }

            rs.close();
            cs.close();
            conn.close();
            sc.close();

        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}