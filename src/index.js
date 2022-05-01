const { urlencoded } = require('express')

const cors = require('cors')

const express = require('express')

const { Pool } = require('pg')

require('dotenv').config()

const PORT = process.env.PORT || 3333


const pool = new Pool({
    connectionString: process.env.POSTGRESQL_URL
})
const app = express()

app.use(express.json())

app.use(cors())



app.get('/', (req, res) => { console.log('Olá Mundo !!!') })

// Pega todos os Usuários!!! da tabela usuario

app.get('/usuarios', async(req, res) => {
    try {

        const { rows } = await pool.query('select * from usuario')
        return res.status(200).send(rows)


    } catch (err) {
        return res.status(400).send(err)
    }
})


// Armazena usuario com os atributos : nome,senha,tokens,contador  da tabela USUARIO

app.post('/adicionar', async(req, res) => {
    const { nome, senha, tokens, contador } = req.body

    let user = ''
    try {
        user = await pool.query('select * from usuario where nome =($1)', [nome])

        if (!user.rows[0]) {
            user = await pool.query('insert into usuario(nome,senha,tokens,contador) values ($1,$2,$3,$4) RETURNING *', [nome, senha, tokens, contador])
        }

        return res.status(200).send(user.rows)
    } catch (err) {
        return res.status(400).send(err)
    }
})


// Adiciona apenas nome , senha 

app.post('/adicionar', async(req, res) => {
    const { nome, senha } = req.body

    let user = ''
    try {
        user = await pool.query('select * from usuario where nome =($1)', [nome])

        if (!user.rows[0]) {
            user = await pool.query('insert into usuario(nome,senha) values ($1,$2) RETURNING *', [nome, senha])
        }


        return res.status(200).send(user.rows)
    } catch (err) {
        return res.status(400).send(err)
    }
})



// Armazena o voto do usuario na variavel SOMAVOTO da TABELA VOTAR

app.post('/voto/:idcliente', async(req, res) => {

    const { somavoto } = req.body
    const { idcliente } = req.params

    try {

        const novoVoto = await pool.query('insert into votar(somavoto,idcliente) values($1,$2) RETURNING *', [somavoto, idcliente])
        return res.status(200).send(novoVoto.rows)

    } catch (err) {
        return res.status(400).send(err)
    }

})



//Pegar apenas um usuario da tabela USUARIO

app.get('/usuario/:idcliente', async(req, res) => {

    const { idcliente } = req.params

    try {

        const tudoUsuario = await pool.query('select * from usuario where idcliente=($1)', [idcliente])
        return res.status(200).send(tudoUsuario.rows)
    } catch (err) {

        return res.status(400).send(err)
    }
})

// Para armazenar o token e o voto =contador

app.patch('/tokenvoto/:idcliente', async(req, res) => {

    const { idcliente } = req.params
    const data = req.body

    try {
        const updateUsuario = await pool.query('update usuario set tokens=($1),contador=($2) where idcliente =($3) RETURNING *', [data.tokens, data.contador, idcliente])

        return res.status(400).send(updateUsuario.rows)
    } catch (err) {
        return res.status(400).send(err)
    }
})




// Pegar da tabela votar se o usuario votou 

app.get('/votou/:idcliente', async(req, res) => {

    const { idcliente } = req.params

    try {
        const voto = await pool.query('select * from votar where idcliente=($1)', [idcliente])
        return res.status(200).send(voto.rows)
    } catch (err) {
        return res.status(400).send(err)
    }
})




app.listen(PORT, () => console.log(` Servidor Rodando na PORTA : ${PORT}`))