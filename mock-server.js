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
  chai:        'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=600&fit=crop',
  coffee:      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop',
  latte:       'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&h=600&fit=crop',
  cappuccino:  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=600&fit=crop',
  coldcoffee:  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop',
  matcha:      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&h=600&fit=crop',
  masalachai:  'https://images.unsplash.com/photo-1564890369478-c89ca3d9cde0?w=600&h=600&fit=crop',
  croissant:   'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop',
  waffle:      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=600&fit=crop',
  pancake:     'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&h=600&fit=crop',
  toast:       'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop',
  eggs:        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=600&fit=crop',
  muffin:      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&h=600&fit=crop',
  brownie:     'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=600&fit=crop',
  cheesecake:  'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&h=600&fit=crop',
  pasta:       'https://images.unsplash.com/photo-1473093226745-53e0d9bee554?w=600&h=600&fit=crop',
  pizza:       'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop',
  burger:      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop',
  wrap:        'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=600&fit=crop',
  idli:        'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=600&fit=crop',
  dosa:        'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=600&fit=crop',
  poha:        'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=600&fit=crop',
  greentea:    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop',
  herbtea:     'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&h=600&fit=crop',
  darjtea:     'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',
  scone:       'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop',
  cinnroll:    'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=600&h=600&fit=crop',
  eclair:      'https://images.unsplash.com/photo-1505253213348-ce0e7edeaef8?w=600&h=600&fit=crop',
  galette:     'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=600&fit=crop',
  flatwhite:   'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=600&h=600&fit=crop',
  mocha:       'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=600&h=600&fit=crop',
  affogato:    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=600&fit=crop',
  frenchpress: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
  sandwich:    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=600&fit=crop',
};

// ── 40 demo menu items ──────────────────────────────────────────────────────
let menuItems = [

  // ── Coffee (10 items) ────────────────────────────────────────────────────
  { _id:'1',  name:'Classic Espresso',       category:'Coffee',    price:100, description:'Our signature double-shot espresso — intense and full-bodied with a velvety crema and notes of dark chocolate.',          image_url:imgs.coffee,      is_available:true,  createdAt:new Date() },
  { _id:'2',  name:'Cafe Latte',             category:'Coffee',    price:150, description:'Silky-smooth espresso blended with perfectly steamed whole milk, crowned with hand-poured latte art.',                   image_url:imgs.latte,       is_available:true,  createdAt:new Date() },
  { _id:'3',  name:'Cappuccino',             category:'Coffee',    price:140, description:'One-third espresso, one-third steamed milk, one-third thick velvety foam. Perfectly balanced in every sip.',              image_url:imgs.cappuccino,  is_available:true,  createdAt:new Date() },
  { _id:'4',  name:'Flat White',             category:'Coffee',    price:160, description:'Two ristretto shots with a micro-foam of full-cream milk — stronger and creamier than a latte.',                         image_url:imgs.flatwhite,   is_available:true,  createdAt:new Date() },
  { _id:'5',  name:'Mocha',                  category:'Coffee',    price:170, description:'Espresso meets dark Callebaut chocolate and steamed milk. Rich, indulgent, and topped with cocoa dust.',                  image_url:imgs.mocha,       is_available:true,  createdAt:new Date() },
  { _id:'6',  name:'Cold Brew',              category:'Coffee',    price:160, description:'12-hour slow-steeped coffee. Smooth and naturally sweet, served over hand-chipped ice. Bold with zero bitterness.',       image_url:imgs.coldcoffee,  is_available:true,  createdAt:new Date() },
  { _id:'7',  name:'French Press',           category:'Coffee',    price:180, description:'Single-origin beans steeped 4 minutes. Rich, full-bodied, and complex. Served in a carafe for two.',                     image_url:imgs.frenchpress, is_available:true,  createdAt:new Date() },
  { _id:'8',  name:'Affogato',               category:'Coffee',    price:190, description:'A scoop of house-made vanilla bean gelato drowned in a double espresso shot. Dessert and coffee in one.',                 image_url:imgs.affogato,    is_available:true,  createdAt:new Date() },
  { _id:'9',  name:'Matcha Latte',           category:'Coffee',    price:180, description:'Ceremonial-grade Japanese matcha whisked smooth and steamed with oat milk and a touch of organic honey.',                 image_url:imgs.matcha,      is_available:true,  createdAt:new Date() },
  { _id:'10', name:'Iced Caramel Latte',     category:'Coffee',    price:170, description:'Cold espresso over ice with housemade salted caramel syrup and chilled oat milk. Finished with a caramel drizzle.',       image_url:imgs.coldcoffee,  is_available:false, createdAt:new Date() },

  // ── Tea (8 items) ────────────────────────────────────────────────────────
  { _id:'11', name:'Masala Chai',            category:'Tea',       price:80,  description:'Aromatic CTC tea brewed strong with fresh ginger, green cardamom, cinnamon, and clove. Served with warm milk.',           image_url:imgs.masalachai,  is_available:true,  createdAt:new Date() },
  { _id:'12', name:'Darjeeling First Flush', category:'Tea',       price:140, description:'Delicate Darjeeling brewed at 90°C. Muscatel notes, honey aroma, and a lingering floral finish.',                         image_url:imgs.darjtea,     is_available:true,  createdAt:new Date() },
  { _id:'13', name:'Sencha Green Tea',       category:'Tea',       price:120, description:'Premium Japanese sencha with a bright grassy note and natural sweetness. Served in a glass teapot at 75°C.',               image_url:imgs.greentea,    is_available:true,  createdAt:new Date() },
  { _id:'14', name:'Chamomile and Honey',    category:'Tea',       price:130, description:'Whole dried chamomile flowers steeped in hot spring water with a teaspoon of raw acacia honey. Calming and floral.',       image_url:imgs.herbtea,     is_available:true,  createdAt:new Date() },
  { _id:'15', name:'Turmeric Latte',         category:'Tea',       price:160, description:'Golden milk with fresh turmeric, black pepper, Ceylon cinnamon, ginger, and oat milk. Sweetened with coconut palm sugar.', image_url:imgs.chai,        is_available:true,  createdAt:new Date() },
  { _id:'16', name:'Earl Grey Creme',        category:'Tea',       price:140, description:'London Fog — Earl Grey brewed strong with bergamot, topped with lavender-infused steamed milk and vanilla.',               image_url:imgs.darjtea,     is_available:true,  createdAt:new Date() },
  { _id:'17', name:'Peppermint Brew',        category:'Tea',       price:110, description:'Organic Moroccan peppermint leaves steeped for 5 minutes. Cooling, refreshing, and perfect after a meal.',                 image_url:imgs.herbtea,     is_available:true,  createdAt:new Date() },
  { _id:'18', name:'Iced Lychee Green Tea',  category:'Tea',       price:150, description:'Chilled Gyokuro green tea with fresh lychee pulp, a squeeze of lime, and mint over crushed ice.',                          image_url:imgs.greentea,    is_available:false, createdAt:new Date() },

  // ── Bakery (8 items) ─────────────────────────────────────────────────────
  { _id:'19', name:'Butter Croissant',       category:'Bakery',    price:120, description:'72-hour laminated dough, churned butter, baked to a deep mahogany. Shatters at the touch, melts in the mouth.',           image_url:imgs.croissant,   is_available:true,  createdAt:new Date() },
  { _id:'20', name:'Almond Croissant',       category:'Bakery',    price:150, description:'Day-old butter croissant soaked in rum syrup, filled with frangipane, topped with toasted flaked almonds.',                image_url:imgs.croissant,   is_available:true,  createdAt:new Date() },
  { _id:'21', name:'Cinnamon Roll',          category:'Bakery',    price:140, description:'Soft brioche dough swirled with brown butter, cinnamon, and muscovado sugar, finished with cream cheese glaze.',           image_url:imgs.cinnroll,    is_available:true,  createdAt:new Date() },
  { _id:'22', name:'Blueberry Muffin',       category:'Bakery',    price:100, description:'Fluffy buttermilk muffin studded with fresh blueberries and a crunchy sugar-streusel top. Baked every morning.',           image_url:imgs.muffin,      is_available:true,  createdAt:new Date() },
  { _id:'23', name:'Plain Scone',            category:'Bakery',    price:110, description:'Classic British scone with a crunchy exterior and pillowy crumb. Served with clotted cream and house strawberry jam.',      image_url:imgs.scone,       is_available:true,  createdAt:new Date() },
  { _id:'24', name:'Chocolate Eclair',       category:'Bakery',    price:160, description:'Choux pastry filled with vanilla creme patissiere and glazed with dark Valrhona chocolate ganache.',                        image_url:imgs.eclair,      is_available:true,  createdAt:new Date() },
  { _id:'25', name:'Wildberry Galette',      category:'Bakery',    price:180, description:'Rustic freeform tart with wild blueberries and raspberries in a buttery hand-rolled shortcrust. Baked until caramelised.', image_url:imgs.galette,     is_available:true,  createdAt:new Date() },
  { _id:'26', name:'Banana Bread',           category:'Bakery',    price:120, description:'Dense, moist loaf made with overripe bananas, toasted walnuts, and browned butter. Warm slice served with butter.',         image_url:imgs.muffin,      is_available:false, createdAt:new Date() },

  // ── Breakfast (8 items) ──────────────────────────────────────────────────
  { _id:'27', name:'Avocado Toast',          category:'Breakfast', price:190, description:'Thick-cut sourdough, smashed avocado, Persian feta, cherry tomatoes, micro-greens, and a chilli-lemon drizzle.',           image_url:imgs.toast,       is_available:true,  createdAt:new Date() },
  { _id:'28', name:'Eggs Benedict',          category:'Breakfast', price:220, description:'Poached farm eggs on toasted brioche with wilted spinach and hollandaise sauce. Finished with Himalayan salt.',             image_url:imgs.eggs,        is_available:true,  createdAt:new Date() },
  { _id:'29', name:'Buttermilk Pancakes',    category:'Breakfast', price:170, description:'Three fluffy buttermilk stacks with whipped maple butter, fresh berry compote, and dusted icing sugar.',                   image_url:imgs.pancake,     is_available:true,  createdAt:new Date() },
  { _id:'30', name:'Belgian Waffle',         category:'Breakfast', price:180, description:'Deep-pocket crispy waffle with whipped Chantilly cream, strawberry compote, and local honey drizzle.',                      image_url:imgs.waffle,      is_available:true,  createdAt:new Date() },
  { _id:'31', name:'Masala Dosa',            category:'Breakfast', price:130, description:'Thin crispy rice crepe with spiced potato-onion filling. Served with sambar, coconut chutney, and tomato chutney.',         image_url:imgs.dosa,        is_available:true,  createdAt:new Date() },
  { _id:'32', name:'Idli Sambar (4 pcs)',    category:'Breakfast', price:90,  description:'Cloud-soft steamed rice cakes with piping hot lentil sambar and fresh coconut chutney. A Hearth morning classic.',          image_url:imgs.idli,        is_available:true,  createdAt:new Date() },
  { _id:'33', name:'Poha Bowl',              category:'Breakfast', price:85,  description:'Flattened rice tossed with mustard seeds, turmeric, sweet onions, roasted peanuts, curry leaves, and fresh coriander.',     image_url:imgs.poha,        is_available:true,  createdAt:new Date() },
  { _id:'34', name:'The Morning Flight',     category:'Breakfast', price:320, description:"A curated platter: Batch Brew, an almond croissant, and a Greek yogurt parfait with hearth granola. Chef's weekend special.",image_url:imgs.scone,       is_available:true,  createdAt:new Date() },

  // ── Mains (4 items) ──────────────────────────────────────────────────────
  { _id:'35', name:'Chicken Burger',         category:'Mains',     price:280, description:'Crispy fried chicken thigh, sriracha aioli, pickled coleslaw, dill pickles in a brioche bun, served with fries.',          image_url:imgs.burger,      is_available:true,  createdAt:new Date() },
  { _id:'36', name:'Pasta Arrabbiata',       category:'Mains',     price:250, description:'Penne in a fiery San Marzano tomato sauce with garlic, Calabrian chilli, and a handful of fresh basil.',                   image_url:imgs.pasta,       is_available:true,  createdAt:new Date() },
  { _id:'37', name:'Margherita Pizza',       category:'Mains',     price:300, description:'12-inch thin crust with San Marzano tomato base, fresh fior di latte mozzarella, and basil brushed with EVOO.',             image_url:imgs.pizza,       is_available:true,  createdAt:new Date() },
  { _id:'38', name:'Grilled Veg Wrap',       category:'Mains',     price:180, description:'Whole-wheat wrap with grilled zucchini, roasted red pepper, hummus, crumbled feta, and fresh rocket.',                      image_url:imgs.wrap,        is_available:true,  createdAt:new Date() },

  // ── Desserts (2 items) ───────────────────────────────────────────────────
  { _id:'39', name:'Chocolate Brownie',      category:'Desserts',  price:130, description:'Dense fudgy dark chocolate brownie with toasted walnut chunks, served warm with a scoop of vanilla bean ice cream.',         image_url:imgs.brownie,     is_available:true,  createdAt:new Date() },
  { _id:'40', name:'New York Cheesecake',    category:'Desserts',  price:180, description:'Classic slow-baked New York cheesecake on a buttery graham cracker crust, served with a blueberry coulis.',                 image_url:imgs.cheesecake,  is_available:true,  createdAt:new Date() },
];

let orders = [
  {
    _id:'o1', customer_name:'Priya Sharma', customer_phone:'9876543210',
    total:410, status:'preparing', payment_done:true,
    whatsapp_link:'https://wa.me/919876543210?text=Test',
    items:[
      { food_item_id:'2',  name:'Cafe Latte',        quantity:2, price_at_time:150 },
      { food_item_id:'19', name:'Butter Croissant',  quantity:1, price_at_time:100 },
      { food_item_id:'11', name:'Masala Chai',        quantity:1, price_at_time:60  },
    ],
    createdAt: new Date(Date.now() - 10 * 60000),
  },
  {
    _id:'o2', customer_name:'Arjun Mehta', customer_phone:'9123456789',
    total:580, status:'pending', payment_done:false,
    whatsapp_link:'https://wa.me/919123456789?text=Test',
    items:[
      { food_item_id:'35', name:'Chicken Burger',    quantity:2, price_at_time:280 },
      { food_item_id:'6',  name:'Cold Brew',         quantity:1, price_at_time:80  },
    ],
    createdAt: new Date(Date.now() - 4 * 60000),
  },
  {
    _id:'o3', customer_name:'Sneha Iyer', customer_phone:'9001234567',
    total:370, status:'ready', payment_done:true,
    whatsapp_link:'https://wa.me/919001234567?text=Test',
    items:[
      { food_item_id:'31', name:'Masala Dosa',       quantity:2, price_at_time:130 },
      { food_item_id:'6',  name:'Cold Brew',         quantity:1, price_at_time:160 },
    ],
    createdAt: new Date(Date.now() - 25 * 60000),
  },
  {
    _id:'o4', customer_name:'Rahul Gupta', customer_phone:'9887766554',
    total:480, status:'accepted', payment_done:false,
    whatsapp_link:'https://wa.me/919887766554?text=Test',
    items:[
      { food_item_id:'36', name:'Pasta Arrabbiata',  quantity:1, price_at_time:250 },
      { food_item_id:'39', name:'Chocolate Brownie', quantity:1, price_at_time:130 },
      { food_item_id:'1',  name:'Classic Espresso',  quantity:1, price_at_time:100 },
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
  res.json({ secure_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop' });
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
  const totalRevenue = orders.reduce((s,o) => s + o.total, 0);
  const itemCounts = {};
  orders.forEach(o => o.items.forEach(i => {
    itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
  }));
  const sorted = Object.entries(itemCounts).sort((a,b) => b[1]-a[1]);
  res.json({
    totalRevenue,
    orderCount: orders.length,
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
  console.log('📦  40 demo menu items loaded across 6 categories');
  console.log('🛒   4 demo orders loaded');
  console.log('\nOpen admin:    http://localhost:5173');
  console.log('Open customer: http://localhost:5174\n');
});
