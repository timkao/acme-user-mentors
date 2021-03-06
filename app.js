const express = require('express')
const path = require('path')
const app = express();
const nunjucks = require('nunjucks')
const models = require('./models')
const router = require('./routes')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const port = process.env.PORT || 3000


app.use('/vendor', express.static(path.join(__dirname, 'node_modules')))
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: false}))
app.use(methodOverride('_method'))
app.use('/users', router)

app.set('view engine', 'html')
app.engine('html', nunjucks.render)
nunjucks.configure('views', {noCache: true})


app.get('/', (req, res, next) => {
  res.render('index', {showHome: true})
})

models.sync()
.then(function() {
  return models.seed()
})
.then(() => {
    app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
})

