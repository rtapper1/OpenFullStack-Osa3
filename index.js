const express = require('express')
const morgan = require('morgan')
//const cors = require('cors')

require('dotenv').config()

const Person = require('./models/person')

const app = express()

//app.use(cors())
app.use(express.static('build'))
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
    Person.find({})
        .then(persons => {
            res.send(`<p>Phonebook has info for ${persons.length} people</p>
            <p>${date.toLocaleString('en-FI', options)}`)
        })
})

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(persons => {
            res.json(persons)
        })
        .catch(error => {
            next(error)
        })
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findById(id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndRemove(id)
        .then(person => {
            res.status(204).end()
        })
        .catch(error => {
            next(error)
        })
})

app.post('/api/persons', (req, res, next) => {
    if (!req.body.name || !req.body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }
    const newPerson = new Person({
        name: req.body.name,
        number: req.body.number
    })
    newPerson.save()
        .then(person => {
            res.json(person)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    const person = {
        name: req.body.name,
        number: req.body.number
    }
    Person.findByIdAndUpdate(id, person, {new: true, runValidators: true, context: 'query'})
        .then(newPerson => {
            res.json(newPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
    console.error(err.message)

    if (err.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'})
    } else if (err.name === 'ValidationError') {
        return res.status(400).send({error: err.message})
    }

    next(err)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

