const express = require('express');
const mongoose = require('mongoose');
const Restaurant = require('./models/restaurant');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173' // frontend manzili
}));

// MongoDB ulash
mongoose.connect('mongodb+srv://allayevmuhammad:iIM12012022@cluster0.fyggq20.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('MongoDB ulanish muvaffaqiyatli');
  })
  .catch(err => console.error('Mongo ulanish xatosi:', err));

// GET - Restorandagi barcha ma'lumotlarni olish
app.get('/api/restaurant/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    console.error('GET xatolik:', err.message);
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
});

// POST - Yangi taom qo'shish
app.post('/api/restaurant/:id/add-food', async (req, res) => {
  const { id } = req.params;
  const { title, price, type } = req.body;

  if (!title || !price || !type) {
    return res.status(400).json({ message: "Barcha maydonlarni to'ldiring (title, price, type)" });
  }

  if (!['foods', 'drinks', 'sweets'].includes(type)) {
    return res.status(400).json({ message: "Noto'g'ri taom turi. Faqat 'foods', 'drinks' yoki 'sweets' bo'lishi kerak" });
  }

  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ message: "Narx musbat raqam bo'lishi kerak" });
  }

  const imgUrl = '';

  try {
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    restaurant.rest_data.data[type].push({
      title,
      price: parsedPrice,
      img: imgUrl,
    });

    await restaurant.save();
    res.status(201).json({ message: 'Taom muvaffaqiyatli qo\'shildi!', food: restaurant.rest_data.data[type] });
  } catch (error) {
    console.error('POST xatolik:', error.message);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// PUT - Taomni yangilash
app.put('/api/restaurant/:id/update-food/:foodId', async (req, res) => {
  const { id, foodId } = req.params;
  const { title, price, type } = req.body;

  if (!['foods', 'drinks', 'sweets'].includes(type)) {
    return res.status(400).json({ message: "Noto'g'ri taom turi. Faqat 'foods', 'drinks' yoki 'sweets' bo'lishi kerak" });
  }

  if (!title && !price) {
    return res.status(400).json({ message: "Kamida bitta maydonni yangilash uchun yuboring (title yoki price)" });
  }

  try {
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    let item = restaurant.rest_data.data[type].id(foodId);
    if (!item) {
      return res.status(404).json({ message: 'Taom topilmadi' });
    }

    if (title) item.title = title;
    if (price) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: "Narx musbat raqam bo'lishi kerak" });
      }
      item.price = parsedPrice;
    }

    await restaurant.save();
    res.status(200).json({ message: 'Taom muvaffaqiyatli yangilandi!', food: item });
  } catch (error) {
    console.error('PUT xatolik:', error.message);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// DELETE - Taomni o'chirish
app.delete('/api/restaurant/:id/delete-food/:foodId', async (req, res) => {
  const { id, foodId } = req.params;
  const { type } = req.body;

  if (!['foods', 'drinks', 'sweets'].includes(type)) {
    return res.status(400).json({ message: "Noto'g'ri taom turi. Faqat 'foods', 'drinks' yoki 'sweets' bo'lishi kerak" });
  }

  try {
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    const itemIndex = restaurant.rest_data.data[type].findIndex(item => item._id.toString() === foodId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Taom topilmadi' });
    }

    restaurant.rest_data.data[type].splice(itemIndex, 1);
    await restaurant.save();
    res.status(200).json({ message: 'Taom muvaffaqiyatli o\'chirildi!' });
  } catch (error) {
    console.error('DELETE xatolik:', error.message);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// ✅ POST - Yangi mijoz (client) qo‘shish
app.post('/api/restaurant/:id/add-client', async (req, res) => {
  const { id } = req.params;
  const { name, bonus, number,gender, address } = req.body;

  if (!name || !bonus || !number || !gender || !address || !address.lat || !address.long) {
    return res.status(400).json({ message: "Barcha maydonlar to'liq to‘ldirilishi kerak (name, bonus, number, address.lat, address.long)" });
  }

  try {
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    restaurant.rest_data.clients.push({
      name,
      bonus,
      number,
      gender,
      address
    });

    await restaurant.save();
    res.status(201).json({ message: 'Mijoz muvaffaqiyatli qo‘shildi!', clients: restaurant.rest_data.clients });
  } catch (err) {
    console.error('Client qo‘shishda xatolik:', err.message);
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
});

// ✅ DELETE - Mijozni o'chirish
app.delete('/api/restaurant/:id/delete-client/:clientId', async (req, res) => {
  const { id, clientId } = req.params;

  try {
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    const clientIndex = restaurant.rest_data.clients.findIndex(client => client._id.toString() === clientId);
    if (clientIndex === -1) {
      return res.status(404).json({ message: 'Mijoz topilmadi' });
    }

    restaurant.rest_data.clients.splice(clientIndex, 1);
    await restaurant.save();
    res.status(200).json({ message: 'Mijoz muvaffaqiyatli o‘chirildi!' });
  } catch (error) {
    console.error('DELETE client xatolik:', error.message);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// ✅ PUT - Mijozni tahrirlash
app.put('/api/restaurant/:id/update-client/:clientId', async (req, res) => {
  const { id, clientId } = req.params;
  const { name, bonus, number,gender, address } = req.body;

  try {
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    const client = restaurant.rest_data.clients.id(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Mijoz topilmadi' });
    }

    if (name) client.name = name;
    if (bonus !== undefined) client.bonus = bonus;
    if (number) client.number = number;
    if (gender) client.gender = gender;
    if (address) {
      if (address.lat !== undefined) client.address.lat = address.lat;
      if (address.long !== undefined) client.address.long = address.long;
    }

    await restaurant.save();
    res.status(200).json({ message: 'Mijoz maʼlumotlari yangilandi!', client });
  } catch (error) {
    console.error('PUT client xatolik:', error.message);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// Serverni ishga tushirish
app.listen(5000, () => {
  console.log('Server 5000-portda ishga tushdi');
});
