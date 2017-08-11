const express = require('express')
const path = require('path')
const app = express();
const nunjucks = require('nunjucks')
const port = process.env.PORT || 3000


app.use('/vendor', express.static(path.join(__dirname, 'node_modules')))
app.use('/public', express.static(path.join(__dirname, 'public')))

app.set('view engine', 'html')
app.engine('html', nunjucks.render)
nunjucks.configure('views', {noCache: true})


app.get('/', (req, res, next) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
