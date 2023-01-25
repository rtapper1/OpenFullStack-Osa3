const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('reqdata', (req, res) => {
    return JSON.stringify(req.body)
})

const custom_morgan = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.reqdata(req, res)
    ].join(' ')
})

// POST /api/persons 200 61 - 4.896 ms {"name":"Liisa Marttinen", "number":"040-243563"}
app.use(custom_morgan)

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345'
    },
    {
        id: 4,
        name: 'Mary Poppendick',
        number: '39-23-6423122'
    }
]

const generateId = () => {
    return Math.round(9999999 * Math.random())
}

app.get('/', (req, res) => {
    res.send('<h1>Hello this is the phonebook API!</h1>')
})

app.get('/info', (req, res) => {
    const date = new Date()
    const options = {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        timeZoneName: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }
    res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${date.toLocaleString('en-FI', options)}`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    if (!req.body.name || !req.body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    } else if (persons.find(p => p.name === req.body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }
    const newPerson = {
        id: generateId(),
        name: req.body.name,
        number: req.body.number
    }
    persons = persons.concat(newPerson)
    return res.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

