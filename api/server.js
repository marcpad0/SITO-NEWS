const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config()

const app = express()
app.use(cors())
const apiKey = process.env.API_URL

port = 3000

app.get('/news-day', async (req, res) => {
    try {
        const { query } = req.query;
        const fromDate = '2024-03-10'; 
        const language = 'en';
        console.log("query:", query);
        console.log("language:", language);

        const fetch = await import('node-fetch');
        const apiUrl = `https://newsapi.org/v2/everything?q=${query}&language=${language}&from=${fromDate}&sortBy=publishedAt&apiKey=${apiKey}`;


        const response = await fetch.default(apiUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  