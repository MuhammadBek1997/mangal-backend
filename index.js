const express = require('express');
const mongoose = require('mongoose');
const Restaurant = require('./models/restaurant');
const cors = require('cors');
const app = express();

// JSON ma'lumotlarni o'qish uchun middleware
app.use(express.json());

// CORS'ni faollashtirish
app.use(cors({
  origin: 'http://localhost:5173' // frontend manzili
}));

// MongoDB ulash
mongoose.connect('mongodb+srv://allayevmuhammad:iIM12012022@cluster0.fyggq20.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('MongoDB ulanish muvaffaqiyatli');
  })
  .catch(err => console.error('Mongo ulanish xatosi:', err));

// GET - Restorandagi barcha taomlarni olish (foods, drinks, sweets)
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

  // Validatsiya
  if (!title || !price || !type) {
    return res.status(400).json({ message: "Barcha maydonlarni to'ldiring (title, price, type)" });
  }

  // Taom turi faqat foods, drinks yoki sweets bo'lishi kerak
  if (!['foods', 'drinks', 'sweets'].includes(type)) {
    return res.status(400).json({ message: "Noto'g'ri taom turi. Faqat 'foods', 'drinks' yoki 'sweets' bo'lishi kerak" });
  }

  // Narxni raqamga aylantirish va tekshirish
  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ message: "Narx musbat raqam bo'lishi kerak" });
  }

  // img maydoni bo'sh string sifatida saqlanadi
  const imgUrl = '';

  try {
    // Restoranni topish
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    // Yangi taomni qo'shish
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

  // Taom turi faqat foods, drinks yoki sweets bo'lishi kerak
  if (!['foods', 'drinks', 'sweets'].includes(type)) {
    return res.status(400).json({ message: "Noto'g'ri taom turi. Faqat 'foods', 'drinks' yoki 'sweets' bo'lishi kerak" });
  }

  // Agar hech qanday yangilanish maydoni bo'lmasa
  if (!title && !price) {
    return res.status(400).json({ message: "Kamida bitta maydonni yangilash uchun yuboring (title yoki price)" });
  }

  try {
    // Restoranni topish
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    // Taomni topish
    let item = restaurant.rest_data.data[type].id(foodId);
    if (!item) {
      return res.status(404).json({ message: 'Taom topilmadi' });
    }

    // Yangi ma'lumotlarni o'rnatish
    if (title) item.title = title;
    if (price) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: "Narx musbat raqam bo'lishi kerak" });
      }
      item.price = parsedPrice;
    }
    // img maydoni bo'sh string sifatida qoladi, chunki yangilashda img qabul qilinmaydi

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

  // Taom turi faqat foods, drinks yoki sweets bo'lishi kerak
  if (!['foods', 'drinks', 'sweets'].includes(type)) {
    return res.status(400).json({ message: "Noto'g'ri taom turi. Faqat 'foods', 'drinks' yoki 'sweets' bo'lishi kerak" });
  }

  try {
    // Restoranni topish
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran topilmadi' });
    }

    // Taomni topish va o'chirish
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
// Serverni ishga tushirish
app.listen(5000, () => {
  console.log('Server 5000-portda ishga tushdi');
});