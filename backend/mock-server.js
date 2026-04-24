/**
 * mock-server.js — Demo API server with hardcoded data
 * No MongoDB or Cloudinary required.
 * Run:  node mock-server.js
 */

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:5174'], methods: ['GET','POST','PUT','PATCH','DELETE'] }
});

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());
app.set('io', io);

// ── Unsplash-based image helpers ────────────────────────────────────────────
const imgs = {
  chai:       'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=600&fit=crop',
  coffee:     'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop',
  latte:      'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&h=600&fit=crop',
  cappuccino: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=600&fit=crop',
  coldcoffee: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop',
  matcha:     'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&h=600&fit=crop',
  smoothie:   'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&h=600&fit=crop',
  juice:      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=600&fit=crop',
  masalachai: 'https://images.unsplash.com/photo-1564890369478-c89ca3d9cde0?w=600&h=600&fit=crop',
  sandwich:   'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=600&fit=crop',
  croissant:  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop',
  waffle:     'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=600&fit=crop',
  pancake:    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&h=600&fit=crop',
  toast:      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop',
  eggs:       'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=600&fit=crop',
  muffin:     'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&h=600&fit=crop',
  brownie:    'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=600&fit=crop',
  cheesecake: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&h=600&fit=crop',
  cookie:     'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=600&fit=crop',
  tiramisu:   'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=600&fit=crop',
  pasta:      'https://images.unsplash.com/photo-1473093226745-53e0d9bee554?w=600&h=600&fit=crop',
  pizza:      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop',
  burger:     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop',
  wrap:       'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=600&fit=crop',
  salad:      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop',
  soup:       'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=600&fit=crop',
  friedrice:  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=600&fit=crop',
  noodles:    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=600&fit=crop',
  idli:       'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=600&fit=crop',
  dosa:       'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=600&fit=crop',
  upma:       'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=600&fit=crop',
  poha:       'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=600&fit=crop',
  biryani:    'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&h=600&fit=crop',
  kulfi:      'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600&h=600&fit=crop',
  gulabjamun: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=600&fit=crop',
};

// ── 35 demo menu items ──────────────────────────────────────────────────────
let menuItems = [
  // ── Hot Beverages ──────────────────────────────────────────────────────
  { _id:'1',  name:'Masala Chai',         category:'Hot Beverages',  price:60,  description:'Aromatic spiced Indian tea brewed with ginger, cardamom, and cinnamon.',    image_url:imgs.masalachai, is_available:true,  createdAt:new Date() },
  { _id:'2',  name:'Classic Espresso',    category:'Hot Beverages',  price:100, description:'Rich double-shot espresso with a velvety crema.',                            image_url:imgs.coffee,     is_available:true,  createdAt:new Date() },
  { _id:'3',  name:'Café Latte',          category:'Hot Beverages',  price:150, description:'Smooth espresso with steamed milk and a delicate foam art on top.',          image_url:imgs.latte,      is_available:true,  createdAt:new Date() },
  { _id:'4',  name:'Cappuccino',          category:'Hot Beverages',  price:140, description:'Equal parts espresso, steamed milk, and thick frothy foam.',                  image_url:imgs.cappuccino, is_available:true,  createdAt:new Date() },
  { _id:'5',  name:'Matcha Latte',        category:'Hot Beverages',  price:180, description:'Ceremonial-grade Japanese matcha whisked with warm oat milk.',               image_url:imgs.matcha,     is_available:true,  createdAt:new Date() },
  { _id:'6',  name:'Turmeric Latte',      category:'Hot Beverages',  price:160, description:'Golden milk with fresh turmeric, black pepper, and a hint of honey.',        image_url:imgs.chai,       is_available:true,  createdAt:new Date() },

  // ── Cold Beverages ─────────────────────────────────────────────────────
  { _id:'7',  name:'Cold Brew Coffee',    category:'Cold Beverages', price:160, description:'12-hour cold-steeped coffee, served over ice. Bold, smooth, refreshing.',    image_url:imgs.coldcoffee, is_available:true,  createdAt:new Date() },
  { _id:'8',  name:'Mango Smoothie',      category:'Cold Beverages', price:180, description:'Fresh Alphonso mango blended with yogurt and a pinch of cardamom.',          image_url:imgs.smoothie,   is_available:true,  createdAt:new Date() },
  { _id:'9',  name:'Fresh Lime Soda',     category:'Cold Beverages', price:80,  description:'Zingy fresh lime, chilled soda water, mint, and a salt-sweet rim.',          image_url:imgs.juice,      is_available:true,  createdAt:new Date() },
  { _id:'10', name:'Iced Matcha Latte',   category:'Cold Beverages', price:190, description:'Matcha whisked smooth, poured over ice with cold oat milk.',                 image_url:imgs.matcha,     is_available:true,  createdAt:new Date() },
  { _id:'11', name:'Watermelon Cooler',   category:'Cold Beverages', price:120, description:'Fresh watermelon blended with lemon and mint. Summer in a glass.',           image_url:imgs.juice,      is_available:false, createdAt:new Date() },
  { _id:'12', name:'Blue Pea Lemonade',   category:'Cold Beverages', price:150, description:'Butterfly pea flower tea with lemon — turns purple before your eyes!',       image_url:imgs.smoothie,   is_available:true,  createdAt:new Date() },

  // ── Breakfast ──────────────────────────────────────────────────────────
  { _id:'13', name:'Masala Dosa',         category:'Breakfast',      price:120, description:'Crispy rice crepe with spiced potato filling, sambar, and chutneys.',        image_url:imgs.dosa,       is_available:true,  createdAt:new Date() },
  { _id:'14', name:'Idli Sambar (4 pcs)', category:'Breakfast',      price:90,  description:'Soft steamed rice cakes with lentil sambar and coconut chutney.',            image_url:imgs.idli,       is_available:true,  createdAt:new Date() },
  { _id:'15', name:'Poha',                category:'Breakfast',      price:80,  description:'Flattened rice with mustard, turmeric, onion, peanuts, and curry leaves.',   image_url:imgs.poha,       is_available:true,  createdAt:new Date() },
  { _id:'16', name:'Upma',                category:'Breakfast',      price:80,  description:'Semolina cooked with veggies, mustard seeds, and green chillies.',           image_url:imgs.upma,       is_available:false, createdAt:new Date() },
  { _id:'17', name:'Eggs Benedict',       category:'Breakfast',      price:200, description:'Poached eggs on toasted brioche with hollandaise sauce and smoked salmon.',   image_url:imgs.eggs,       is_available:true,  createdAt:new Date() },
  { _id:'18', name:'Avocado Toast',       category:'Breakfast',      price:180, description:'Sourdough with smashed avocado, cherry tomatoes, micro-greens, and chilli.',  image_url:imgs.toast,      is_available:true,  createdAt:new Date() },
  { _id:'19', name:'Classic Pancakes',    category:'Breakfast',      price:160, description:'Fluffy buttermilk pancakes stacked with maple syrup and fresh berries.',     image_url:imgs.pancake,    is_available:true,  createdAt:new Date() },
  { _id:'20', name:'Belgian Waffle',      category:'Breakfast',      price:180, description:'Crispy-edged waffle with whipped cream, strawberry compote, and honey.',     image_url:imgs.waffle,     is_available:true,  createdAt:new Date() },

  // ── Mains ──────────────────────────────────────────────────────────────
  { _id:'21', name:'Veg Biryani',         category:'Mains',          price:220, description:'Fragrant basmati rice cooked dum-style with seasonal vegetables and saffron.',image_url:imgs.biryani,    is_available:true,  createdAt:new Date() },
  { _id:'22', name:'Pasta Arrabbiata',    category:'Mains',          price:250, description:'Penne in a spicy San Marzano tomato sauce with garlic and fresh basil.',     image_url:imgs.pasta,      is_available:true,  createdAt:new Date() },
  { _id:'23', name:'Chicken Burger',      category:'Mains',          price:280, description:'Crispy fried chicken thigh, sriracha aioli, pickled slaw, brioche bun.',     image_url:imgs.burger,     is_available:true,  createdAt:new Date() },
  { _id:'24', name:'Margherita Pizza',    category:'Mains',          price:300, description:'Thin crust, San Marzano tomatoes, fresh mozzarella, and basil.',             image_url:imgs.pizza,      is_available:true,  createdAt:new Date() },
  { _id:'25', name:'Noodle Stir-Fry',    category:'Mains',          price:200, description:'Wok-tossed noodles with sesame, soy, crispy tofu, and spring onions.',       image_url:imgs.noodles,    is_available:true,  createdAt:new Date() },
  { _id:'26', name:'Grilled Veg Wrap',   category:'Mains',          price:180, description:'Whole-wheat wrap with grilled zucchini, hummus, feta, and rocket.',          image_url:imgs.wrap,       is_available:true,  createdAt:new Date() },
  { _id:'27', name:'Greek Salad Bowl',   category:'Mains',          price:200, description:'Cucumber, olives, cherry tomatoes, red onion, and creamy feta dressing.',    image_url:imgs.salad,      is_available:false, createdAt:new Date() },
  { _id:'28', name:'Tomato Basil Soup',  category:'Mains',          price:140, description:'Slow-roasted tomato soup with a cream swirl, basil oil, and croutons.',      image_url:imgs.soup,       is_available:true,  createdAt:new Date() },
  { _id:'29', name:'Fried Rice (Veg)',   category:'Mains',          price:180, description:'Wok-tossed jasmine rice with seasonal vegetables, soy, and sesame oil.',     image_url:imgs.friedrice,  is_available:true,  createdAt:new Date() },

  // ── Snacks ─────────────────────────────────────────────────────────────
  { _id:'30', name:'Club Sandwich',      category:'Snacks',         price:180, description:'Triple-decker with grilled chicken, egg, bacon, lettuce, and tomato.',       image_url:imgs.sandwich,   is_available:true,  createdAt:new Date() },
  { _id:'31', name:'Butter Croissant',   category:'Snacks',         price:100, description:'Flaky, buttery croissant baked fresh every morning. Plain or with jam.',     image_url:imgs.croissant,  is_available:true,  createdAt:new Date() },

  // ── Desserts ───────────────────────────────────────────────────────────
  { _id:'32', name:'Chocolate Brownie',  category:'Desserts',       price:120, description:'Dense fudgy brownie with walnut chunks, served warm with vanilla ice cream.',image_url:imgs.brownie,    is_available:true,  createdAt:new Date() },
  { _id:'33', name:'New York Cheesecake',category:'Desserts',       price:180, description:'Classic baked cheesecake on a graham cracker crust with berry coulis.',      image_url:imgs.cheesecake, is_available:true,  createdAt:new Date() },
  { _id:'34', name:'Tiramisu',           category:'Desserts',       price:200, description:'Savoiardi soaked in espresso, mascarpone cream, cocoa. Italian classic.',    image_url:imgs.tiramisu,   is_available:true,  createdAt:new Date() },
  { _id:'35', name:'Gulab Jamun (2 pcs)',category:'Desserts',       price:90,  description:'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup.',             image_url:imgs.gulabjamun, is_available:true,  createdAt:new Date() },
  { _id:'36', name:'Chocolate Chip Cookie',category:'Desserts',     price:80,  description:'Thick, gooey cookie with dark chocolate chunks. Best when warm!',           image_url:imgs.cookie,     is_available:true,  createdAt:new Date() },
  { _id:'37', name:'Blueberry Muffin',   category:'Desserts',       price:100, description:'Fluffy muffin bursting with fresh blueberries and a sugar-crumb top.',      image_url:imgs.muffin,     is_available:true,  createdAt:new Date() },
  { _id:'38', name:'Mango Kulfi',        category:'Desserts',       price:110, description:'Traditional Indian frozen dessert made with reduced milk and fresh mango.',  image_url:imgs.kulfi,      is_available:false, createdAt:new Date() },
];

let orders = [
  {
    _id:'o1', customer_name:'Priya Sharma', customer_phone:'9876543210',
    total:410, status:'preparing', payment_done:true,
    whatsapp_link:'https://wa.me/919876543210?text=Test',
    items:[
      { food_item_id:'3', name:'Café Latte',       quantity:2, price_at_time:150 },
      { food_item_id:'31', name:'Butter Croissant', quantity:1, price_at_time:100 },
      { food_item_id:'1',  name:'Masala Chai',      quantity:1, price_at_time:60  },
    ],
    createdAt: new Date(Date.now() - 10 * 60000),
  },
  {
    _id:'o2', customer_name:'Arjun Mehta', customer_phone:'9123456789',
    total:580, status:'pending', payment_done:false,
    whatsapp_link:'https://wa.me/919123456789?text=Test',
    items:[
      { food_item_id:'23', name:'Chicken Burger', quantity:2, price_at_time:280 },
      { food_item_id:'9',  name:'Fresh Lime Soda', quantity:1, price_at_time:80  },
    ],
    createdAt: new Date(Date.now() - 4 * 60000),
  },
  {
    _id:'o3', customer_name:'Sneha Iyer', customer_phone:'9001234567',
    total:370, status:'ready', payment_done:true,
    whatsapp_link:'https://wa.me/919001234567?text=Test',
    items:[
      { food_item_id:'13', name:'Masala Dosa',     quantity:2, price_at_time:120 },
      { food_item_id:'7',  name:'Cold Brew Coffee', quantity:1, price_at_time:160 },
    ],
    createdAt: new Date(Date.now() - 25 * 60000),
  },
  {
    _id:'o4', customer_name:'Rahul Gupta', customer_phone:'9887766554',
    total:480, status:'accepted', payment_done:false,
    whatsapp_link:'https://wa.me/919887766554?text=Test',
    items:[
      { food_item_id:'22', name:'Pasta Arrabbiata', quantity:1, price_at_time:250 },
      { food_item_id:'32', name:'Chocolate Brownie', quantity:1, price_at_time:120 },
      { food_item_id:'2',  name:'Classic Espresso',  quantity:1, price_at_time:100 },
    ],
    createdAt: new Date(Date.now() - 2 * 60000),
  },
];

// ── Routes ──────────────────────────────────────────────────────────────────

// Menu
app.get('/api/menu', (req, res) => {
  let items = menuItems;
  if (req.query.is_available !== undefined) {
    const avail = req.query.is_available === 'true';
    items = items.filter(i => i.is_available === avail);
  }
  res.json(items);
});
app.post('/api/menu', (req, res) => {
  const item = { ...req.body, _id: String(Date.now()), createdAt: new Date() };
  menuItems.unshift(item);
  res.status(201).json(item);
});
app.put('/api/menu/:id', (req, res) => {
  const idx = menuItems.findIndex(i => i._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  menuItems[idx] = { ...menuItems[idx], ...req.body };
  res.json(menuItems[idx]);
});
app.delete('/api/menu/:id', (req, res) => {
  menuItems = menuItems.filter(i => i._id !== req.params.id);
  res.json({ message: 'Deleted' });
});

// Upload (returns a placeholder since no Cloudinary)
app.post('/api/upload', (req, res) => {
  res.json({ secure_url: `https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop&t=${Date.now()}` });
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json([...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
});
app.post('/api/orders', (req, res) => {
  const order = { ...req.body, _id: String(Date.now()), status:'pending', payment_done:false, createdAt: new Date() };
  orders.unshift(order);
  io.emit('new_order', order);
  res.status(201).json(order);
});
app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.status = req.body.status;
  io.emit('order_updated', order);
  res.json(order);
});
app.patch('/api/orders/:id/payment', (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.payment_done = !order.payment_done;
  io.emit('order_updated', order);
  res.json(order);
});

// Analytics
app.get('/api/analytics', (req, res) => {
  const todayOrders = orders;
  const totalRevenue = todayOrders.reduce((s,o) => s + o.total, 0);
  const itemCounts = {};
  todayOrders.forEach(o => o.items.forEach(i => {
    itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
  }));
  const sorted = Object.entries(itemCounts).sort((a,b) => b[1]-a[1]);
  res.json({
    totalRevenue,
    orderCount: todayOrders.length,
    mostPopularItem: sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null,
  });
});

// Socket.io
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

server.listen(5000, () => {
  console.log('\n🚀  Mock server running at http://localhost:5000');
  console.log('📦  35 demo menu items loaded');
  console.log('🛒   4 demo orders loaded');
  console.log('\nOpen admin:    http://localhost:5173');
  console.log('Open customer: http://localhost:5174\n');
});
