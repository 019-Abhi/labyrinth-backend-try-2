const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./users.db')

app.post('/login', (req, res) => {

    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ? AND password = ? ", [username, password], (err, found) => {

        if (err) return res.status(500).json({error: 'Database error'});
        if (found) return res.json({success: true, message: 'Login Successful'});
        else return res.status(401).json({success: false, message: "Login Failed"});

    });

});


app.post('/createacc', (req, res) => {

    const { newUsername, newPassword } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [newUsername], (err, UsernameExists) => {

        if (err){
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (UsernameExists){
            return res.status(409).json({ success: false, message: 'Username already taken' });      
        }

        db.run("INSERT INTO users VALUES (? , ?, ?)", [newUsername, newPassword, 0], (err) => {

            if (err) return res.status(500).json({error: 'Database error'});
            return res.json({ success: true, message: 'Sign Up Successful' });

        });
    });
});


app.post('/updatetime', (req, res) => {
    const { username, time } = req.body;

    db.get("SELECT time FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!row || row.time === null || time > row.time) {
            db.run("UPDATE users SET time = ? WHERE username = ?", [time, username], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Update failed' });
                }
                return res.json({ success: true, message: 'Time updated' });
            });
        } else {
            return res.json({ success: false, message: 'Time not better, no update' });
        }
    });
});




app.get('/leaderboard', (req, res) => {
    db.all("SELECT username, time FROM users WHERE time > 0 ORDER BY time DESC LIMIT 7", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, data: rows });
    });
});




const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});