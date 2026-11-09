const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "frontend", "app")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "app", "Login.html"));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Seige@109',
    database: 'netflix_db'
});

db.connect((err) => {
    if (err) {
        console.log("Connection Failed");
        console.log(err);
    } else {
        console.log("Connected to MySQL");
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

const util = require('util');
const dbQuery = util.promisify(db.query).bind(db);

app.get("/api/subscriptions",(req,res)=>{

    const sql="SELECT * FROM tbl_subscription";

    db.query(sql,(err,result)=>{

        if(err){

            console.log(err);

            return res.status(500).send(err);

        }

        res.json(result);

    });

});

app.get("/api/subscriptions/:id",(req,res)=>{

    const sql = "SELECT * FROM tbl_subscription WHERE subscription_id = ?";

    db.query(sql,[req.params.id],(err,result)=>{

        if(err){

            console.log(err);

            return res.status(500).send(err);

        }

        res.json(result[0]);

    });

});

app.post("/api/register", (req, res) => {
    const {
        username,
        email,
        password,
        country,
        subscription_id
    } = req.body;

    const sql = `
        INSERT INTO tbl_accounts
        (name, email, password, country, subscription_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(

        sql,
        [
            username,
            email,
            password,
            country,
            subscription_id
        ],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Registration failed"
                });
            }

            res.json({
                message: "Registration successful",
                account_id: result.insertId
            });

        }
    );

});

app.get("/payment/:accountId", (req, res) => {

    const accountId = req.params.accountId;

    const sql = `
    SELECT
        s.subscription_id,
        s.name,
        s.price,
        s.resolution,
        s.max_screens
    FROM tbl_accounts a
    JOIN tbl_subscription s
    ON a.subscription_id = s.subscription_id
    WHERE a.account_id = ?
    `;

    db.query(sql, [accountId], (err, result) => {

        if (err)
            return res.status(500).json(err);

        res.json(result[0]);

    });

});

app.post("/payment", (req, res) => {

    const { account_id, subscription_id, payment_method } = req.body;

    const updateSql = `
        UPDATE tbl_accounts
        SET subscription_id = ?
        WHERE account_id = ?
    `;

    db.query(updateSql, [subscription_id, account_id], (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ success: false });
        }

        const priceSql = `
            SELECT price
            FROM tbl_subscription
            WHERE subscription_id = ?
        `;

        db.query(priceSql, [subscription_id], (err, priceResult) => {

            if (err || priceResult.length === 0) {
                console.log(err);
                return res.status(500).json({ success: false });
            }

            const amount = priceResult[0].price;

            const insertSql = `
                INSERT INTO tbl_payment
                (account_id, amount, payment_method,  payment_timestamp)
                VALUES (?, ?, ?, NOW())
            `;
 
            db.query(insertSql, [account_id, amount, payment_method], (err) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false });
                }

                res.json({ success: true });

            });

        });

    });

});

app.get('/profiles/:accountId', (req, res) => {

    const accountId =
        req.params.accountId;

    const sql = `
        SELECT *
        FROM tbl_profiles
        WHERE account_id = ?
    `;

    db.query(
        sql,
        [accountId],
        (err, results) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(results);
        }
    );

});

app.post("/addProfile", (req, res) => {

    const {
        name,
        language,
        age_category,
        account_id
    } = req.body;

    const sql = `
        INSERT INTO tbl_profiles
        (name, language, age_category, account_id)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, language, age_category, account_id],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false
                });
            }

            res.json({
                success: true
            });

        }
    );

});

app.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    const sql = `
        SELECT *
        FROM tbl_accounts
        WHERE email = ?
        AND password = ?
    `;

    db.query(sql, [email, password], (err, results) => {

        if(err){
            console.log(err);

            return res.status(500).json({
                success: false
            });
        }

        if(results.length > 0){

            res.json({
                success: true,
                account_id: results[0].account_id
            });

        } else {

            res.json({
                success: false
            });

        }

    });

});

app.get('/continue/:profileId', (req,res)=>{

    const profileId = req.params.profileId;

    const sql = `
    SELECT c.*
    FROM tbl_watch_history w
    JOIN tbl_content c
    ON w.content_id = c.content_id
    WHERE w.profile_id = ?
    AND w.progress < 100
    ORDER BY w.watched_date DESC
    `;

    db.query(sql,[profileId],(err,results)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(results);

    });

});

app.get('/trending',(req,res)=>{

    const sql = `
    SELECT c.*,
           COUNT(*) AS watch_count
    FROM tbl_watch_history w
    JOIN tbl_content c
    ON w.content_id = c.content_id
    GROUP BY c.content_id
    ORDER BY watch_count DESC
    LIMIT 15
    `;

    db.query(sql,(err,results)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(results);

    });

});

app.get('/movies',(req,res)=>{

    db.query(
        `
        SELECT *
        FROM tbl_content
        WHERE type='Movie'
        LIMIT 30
        `,
        (err,results)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

app.get('/tvshows',(req,res)=>{

    db.query(
        `
        SELECT *
        FROM tbl_content
        WHERE type='TV Show'
        LIMIT 30
        `,
        (err,results)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

app.get('/genre/:name',(req,res)=>{

    const genre = req.params.name;

    const sql = `
    SELECT c.*
    FROM tbl_content c
    JOIN tbl_has_genre hg
    ON c.content_id = hg.content_id
    JOIN tbl_genre g
    ON hg.genre_id = g.genre_id
    WHERE g.name = ?
    `;

    db.query(sql,[genre],(err,results)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(results);

    });

});

// List of all genres, used to populate the filter dropdown on the
// Movies / TV Shows browse pages
app.get("/genres", (req, res) => {

    const sql = `
        SELECT name
        FROM tbl_genre
        ORDER BY name
    `;

    db.query(sql, (err, results) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(results);

    });

});

// Browse content by type ('Movie' or 'TV Show'), optionally filtered
// by genre name. Used by the Movies / TV Shows pages.
app.get("/browse", (req, res) => {

    const { type, genre } = req.query;

    if(type !== "Movie" && type !== "TV Show"){
        return res.status(400).json({ message: "Invalid type" });
    }

    let sql = `
        SELECT DISTINCT c.*
        FROM tbl_content c
    `;

    const params = [];

    if(genre){
        sql += `
            JOIN tbl_has_genre hg ON c.content_id = hg.content_id
            JOIN tbl_genre g ON hg.genre_id = g.genre_id
        `;
    }

    sql += ` WHERE c.type = ? `;
    params.push(type);

    if(genre){
        sql += ` AND g.name = ? `;
        params.push(genre);
    }

    sql += ` LIMIT 30 `;

    db.query(sql, params, (err, results) => {

        if(err){
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(results);

    });

});

// Full detail for the "More Info" modal: description, genres, directors, cast
app.get("/content/:id", (req, res) => {

    const contentId = req.params.id;

    const sql = `
        SELECT
            c.*,
            GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres,
            GROUP_CONCAT(DISTINCT d.name ORDER BY d.name SEPARATOR ', ') AS directors,
            GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS cast
        FROM tbl_content c
        LEFT JOIN tbl_has_genre hg ON c.content_id = hg.content_id
        LEFT JOIN tbl_genre g ON hg.genre_id = g.genre_id
        LEFT JOIN tbl_directs dr ON c.content_id = dr.content_id
        LEFT JOIN tbl_directors d ON dr.director_id = d.director_id
        LEFT JOIN tbl_acts_in ai ON c.content_id = ai.content_id
        LEFT JOIN tbl_actors a ON ai.actor_id = a.actor_id
        WHERE c.content_id = ?
        GROUP BY c.content_id
    `;

    db.query(sql, [contentId], (err, results) => {

        if(err){
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(results[0] || {});

    });

});

// Existing watch progress for this profile + content, used to resume playback
app.get("/watchprogress/:profileId/:contentId", (req, res) => {

    const { profileId, contentId } = req.params;

    const sql = `
        SELECT progress
        FROM tbl_watch_history
        WHERE profile_id = ?
        AND content_id = ?
    `;

    db.query(sql, [profileId, contentId], (err, results) => {

        if(err){
            console.log(err);
            return res.status(500).json(err);
        }

        res.json({ progress: results.length ? results[0].progress : 0 });

    });

});

// Saves/updates simulated playback progress into tbl_watch_history
app.post("/watchprogress", (req, res) => {

    const { profile_id, content_id, progress } = req.body;

    const sql = `
        INSERT INTO tbl_watch_history
        (profile_id, content_id, watched_date, progress)
        VALUES (?, ?, CURDATE(), ?)
        ON DUPLICATE KEY UPDATE
            progress = VALUES(progress),
            watched_date = VALUES(watched_date)
    `;

    db.query(sql, [profile_id, content_id, progress], (err) => {

        if(err){
            console.log(err);
            return res.status(500).json({ success: false });
        }

        res.json({ success: true });

    });

});

app.get("/profile/:id",(req,res)=>{

    const sql=`
        SELECT name
        FROM tbl_profiles
        WHERE profile_id=?`;

    db.query(                       
        sql,
        [req.params.id],
        (err,result)=>{

            if(err)
                return res.status(500).json(err);

            res.json(result[0]);

        });

});

// NEW: search endpoint
app.get('/search/:query', (req, res) => {

    const searchTerm = `%${req.params.query}%`;

    const sql = `
        SELECT *
        FROM tbl_content
        WHERE title LIKE ?
        LIMIT 30
    `;

    db.query(sql, [searchTerm], (err, results) => {

        if(err){
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(results);

    });

});

app.get("/featured", (req, res) => {

    const sql = `
        SELECT *
        FROM tbl_content
        ORDER BY RAND()
        LIMIT 1
    `;

    db.query(sql, (err, results) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(results[0]);

    });

});

async function findOrCreateId(table, idColumn, nameColumn, name){

    const trimmedName = name.trim();

    if(!trimmedName) return null;

    const existing = await dbQuery(
        `SELECT ${idColumn} FROM ${table} WHERE ${nameColumn} = ?`,
        [trimmedName]
    );

    if(existing.length){
        return existing[0][idColumn];
    }

    const inserted = await dbQuery(
        `INSERT INTO ${table} (${nameColumn}) VALUES (?)`,
        [trimmedName]
    );

    return inserted.insertId;

}

app.post("/api/distribute", async (req, res) => {

    const {
        title,
        type,
        release_year,
        description,
        actors = [],
        directors = [],
        genres = []
    } = req.body;

    if(!title || !type || !release_year || !description){
        return res.status(400).json({
            success: false,
            message: "Missing required content details"
        });
    }

    try{

        const contentResult = await dbQuery(
            `INSERT INTO tbl_content (title, type, release_year, description)
             VALUES (?, ?, ?, ?)`,
            [title, type, release_year, description]
        );

        const content_id = contentResult.insertId;

        for(const actorName of actors){

            const actor_id = await findOrCreateId(
                "tbl_actors", "actor_id", "name", actorName
            );

            if(actor_id){
                await dbQuery(
                    `INSERT IGNORE INTO tbl_acts_in (actor_id, content_id)
                     VALUES (?, ?)`,
                    [actor_id, content_id]
                );
            }

        }

        for(const directorName of directors){

            const director_id = await findOrCreateId(
                "tbl_directors", "director_id", "name", directorName
            );

            if(director_id){
                await dbQuery(
                    `INSERT IGNORE INTO tbl_directs (director_id, content_id)
                     VALUES (?, ?)`,
                    [director_id, content_id]
                );
            }

        }

        for(const genreName of genres){

            const genre_id = await findOrCreateId(
                "tbl_genre", "genre_id", "name", genreName
            );

            if(genre_id){
                await dbQuery(
                    `INSERT IGNORE INTO tbl_has_genre (genre_id, content_id)
                     VALUES (?, ?)`,
                    [genre_id, content_id]
                );
            }

        }

        res.json({
            success: true,
            content_id
        });

    } catch(err){

        console.log(err);
        res.status(500).json({
            success: false,
            message: "Could not add content"
        });

    }

});
