const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


mongoose.connect('mongodb://127.0.0.1:27017/mydatabase', {
useNewUrlParser: true,
useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro ao conectar:', err));

app.listen(3000, '0.0.0.0', () => {
console.log('API rodando em http://192.168.1.79:3000/items');
});

const Item = require('./Item');  


app.get('/items', async (req, res) => {
try {
const items = await Item.find();
res.json(items);
} catch (error) {
console.error(error);
res.status(500).send('Erro ao buscar itens.');
}
});


app.post('/items', async (req, res) => {
try {
const newItem = new Item({
name: req.body.name,
description: req.body.description,
location: req.body.location,
});
await newItem.save();
res.status(201).json(newItem);
} catch (error) {
console.error(error);
res.status(400).send('Erro ao adicionar o produto');
}
});


app.put('/items/:id', async (req, res) => {
try {
const updatedData = {
name: req.body.name,
description: req.body.description,
location: req.body.location,
};
const updatedItem = await Item.findByIdAndUpdate(req.params.id, updatedData, { new: true });
if (!updatedItem) {
 return res.status(404).send('Item não encontrado');
}
res.json(updatedItem);
} catch (error) {
console.error(error);
res.status(400).send('Erro ao atualizar o item');
}
});


app.delete('/items/:id', async (req, res) => {
try {
const item = await Item.findByIdAndDelete(req.params.id);
if (!item) {
return res.status(404).send('Item não encontrado');
}
res.status(204).send();
} catch (error) {
console.error(error);
res.status(400).send('Erro ao remover o item');
}
});
