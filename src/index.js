const { urlencoded } = require('express')

const cors = require('cors')

const express = require('express')

const { Pool } = require('pg')

const jwt = require('jsonwebtoken')

const SECRET = 'android';



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

app.post('/adicionar/tudo', async(req, res) => {
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

app.get('/usuario/:senha', async(req, res) => {

    const { senha } = req.params

    try {

        const retornaUsurio = await pool.query('select * from usuario where senha = ($1)', [senha])
        if (!retornaUsurio.rows[0]) return res.status(400).send('Não tem esse usuário')

        return res.status(200).send(retornaUsurio.rows)

    } catch (err) {

        return res.status(401).send(err)
    }
})



app.post('/logout', function(req, res) {

    res.end();
})

// Para armazenar o token e o voto =contador

app.put('/tokenvoto/:idcliente/', async(req, res) => {

    const { idcliente } = req.params
    const data = req.body

    try {
        const updateUsuario = await pool.query('update usuario set tokens=($1) where idcliente =($2)', [data.tokens, idcliente])

        return res.status(200).send(updateUsuario.rows)
    } catch (err) {
        return res.status(400).send(err)
    }
})








app.listen(PORT, () => console.log(` Servidor Rodando na PORTA : ${PORT}`))