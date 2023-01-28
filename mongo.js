/* eslint-disable no-undef */
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Give at least your password, and name and number as arguments if you are adding a person')
  process.exit(1)
}

const password = process.argv[2]

const dbName = 'phonebookApp'

const url = `mongodb+srv://mongoadmin:${password}@cluster0.5ifqoxs.mongodb.net/${dbName}?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({})
    .then(res => {
      res.forEach(p => {
        console.log(p.name, p.number)
        mongoose.connection.close()
      })
    })
} else if (process.argv.length === 4) {
  console.log('In addition to password, please give name AND number for new person.')
  mongoose.connection.close()
} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number
  })

  person.save()
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })
} else {
  console.log('Invalid nnumber of paramenters')
  mongoose.connection.close()
}





