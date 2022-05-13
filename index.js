const express = require('express')
const app = express()
const port = 3000

app.get('/api/', (req, res) => {
  res.send('Hello World!')
})

app.use('/', express.static('public'));

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

