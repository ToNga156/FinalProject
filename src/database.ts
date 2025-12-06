// file myDatabase.db nằm ở /data/data/com.libraryappsqlite/databases/myDatabase.db
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

// Mở (hoặc tạo mới) database
const getDb = async (): Promise<SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'myDatabase.db', location: 'default' });
  return db;
};

// Kiểu dữ liệu
export type Category = { id: number; name: string; };
export type Product = { id: number; name: string; price: number; img: string; categoryId: number; };
export type User = { 
  id: number; 
  username: string; 
  password: string; 
  role: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string; // URI hoặc base64 của ảnh avatar
};
export type CartItem = { 
  id: number; 
  userId: number; 
  productId: number; 
  quantity: number;
  product?: Product;
};
export type Order = {
  id: number;
  userId: number;
  totalAmount: number;
  status: string; // 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled'
  createdAt: string;
  shippingAddress: string;
  phone: string;
  paymentMethod?: string; // 'cash', 'bank_transfer', 'credit_card'
  username?: string; // Tên người dùng (khi join với users table)
};
export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
};

// Dữ liệu mẫu
const initialCategories: Category[] = [
  { id: 1, name: 'Áo' }, { id: 2, name: 'Giày' }, { id: 3, name: 'Balo' },
  { id: 4, name: 'Mũ' }, { id: 5, name: 'Túi' },
];
const initialProducts: Product[] = [
  // Danh mục Áo (categoryId: 1)
  { id: 1, name: 'Áo sơ mi trắng', price: 250000, img: '../assets/images/somitrang.jpg', categoryId: 1 },
  { id: 2, name: 'Áo thun nam', price: 180000, img: '../assets/images/aothunnam.jpg', categoryId: 1 },
  { id: 3, name: 'Áo khoác gió', price: 450000, img: '../assets/images/aokhoacgio.jpg', categoryId: 1 },
  { id: 4, name: 'Áo polo', price: 320000, img: '../assets/images/aopolo.jpg', categoryId: 1 },
  { id: 5, name: 'Áo len', price: 380000, img: '../assets/images/images/28eddfd49ca1fbe3a605e461ab5bcdd3.jpg', categoryId: 1 },
  { id: 6, name: 'Áo hoodie', price: 420000, img: '../assets/images/images/2f037efeff55f8f0a1339d7e2ec48359.jpg', categoryId: 1 },
  
  // Danh mục Giày (categoryId: 2)
  { id: 7, name: 'Giày sneaker', price: 1100000, img: '../assets/images/7bc826eba41114e8d6e14913bba200ea.jpg', categoryId: 2 },
  { id: 8, name: 'Giày thể thao', price: 950000, img: '../assets/images/60a4448bc5d9b97f0b148deb2086a61e.jpg', categoryId: 2 },
  { id: 9, name: 'Giày cao gót', price: 650000, img: '../assets/images/fbcc9d99190adf16c0a0c50c56f72a21.jpg', categoryId: 2 },
  { id: 10, name: 'Giày búp bê', price: 480000, img: '../assets/images/c24d3694c02ec6c6357a272317a29379.jpg', categoryId: 2 },
  { id: 11, name: 'Giày boot', price: 1200000, img: '../assets/images/683f90012798ec5d6e581f2a73792656.jpg', categoryId: 2 },
  { id: 12, name: 'Giày sandal', price: 350000, img: '../assets/images/7a98c0d842332176931eff0285810bab.jpg', categoryId: 2 },
  
  // Danh mục Balo (categoryId: 3)
  { id: 13, name: 'Balo thời trang', price: 490000, img: '../assets/images/balothoitrang.jpg', categoryId: 3 },
  { id: 14, name: 'Balo laptop', price: 550000, img: '../assets/images/balolaptop.jpg', categoryId: 3 },
  { id: 15, name: 'Balo du lịch', price: 680000, img: '../assets/images/balodulich.jpg', categoryId: 3 },
  { id: 16, name: 'Balo thể thao', price: 420000, img: '../assets/images/balothethao.jpg', categoryId: 3 },
  { id: 17, name: 'Balo học sinh', price: 380000, img: '../assets/images/balohocsinh.jpg', categoryId: 3 },
  { id: 18, name: 'Balo mini', price: 320000, img: '../assets/images/baolomini.jpg', categoryId: 3 },
  
  // Danh mục Mũ (categoryId: 4)
  { id: 19, name: 'Mũ lưỡi trai', price: 120000, img: '../assets/images/muluoitrai.jpg', categoryId: 4 },
  { id: 20, name: 'Mũ bucket', price: 150000, img: '../assets/images/mubucket.jpg', categoryId: 4 },
  { id: 21, name: 'Mũ snapback', price: 180000, img: '../assets/images/musnapback.png', categoryId: 4 },
  { id: 22, name: 'Mũ len', price: 200000, img: '../assets/images/mulen.jpg', categoryId: 4 },
  { id: 23, name: 'Mũ rộng vành', price: 250000, img: '../assets/images/murongvanh.jpg', categoryId: 4 },
  { id: 24, name: 'Mũ beanie', price: 100000, img: '../assets/images/mubeanie.jpg', categoryId: 4 },
  
  // Danh mục Túi (categoryId: 5)
  { id: 25, name: 'Túi xách nữ', price: 980000, img: '../assets/images/tuixaschnu.jpg', categoryId: 5 },
  { id: 26, name: 'Túi đeo chéo', price: 450000, img: '../assets/images/tuideocheo.jpg', categoryId: 5 },
  { id: 27, name: 'Túi tote', price: 380000, img: '../assets/images/tuitote.jpg', categoryId: 5 },
  { id: 28, name: 'Túi mini', price: 320000, img: '../assets/images/tuimini.jpg', categoryId: 5 },
  { id: 29, name: 'Túi da', price: 1200000, img: '../assets/images/tuida.jpg', categoryId: 5 },
  { id: 30, name: 'Túi vải', price: 250000, img: '../assets/images/tuivai.jpg', categoryId: 5 },
];

// ========================== RESET DATABASE ==========================
// Hàm này sẽ xóa tất cả dữ liệu và tạo lại database với dữ liệu mới
export const resetDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = await getDb();

    database.transaction((tx) => {
      // Xóa tất cả các bảng cũ
      tx.executeSql('DROP TABLE IF EXISTS order_items');
      tx.executeSql('DROP TABLE IF EXISTS orders');
      tx.executeSql('DROP TABLE IF EXISTS cart');
      tx.executeSql('DROP TABLE IF EXISTS products');
      tx.executeSql('DROP TABLE IF EXISTS categories');
      // Giữ lại bảng users để không mất tài khoản admin
      // tx.executeSql('DROP TABLE IF EXISTS users');

      // Tạo lại các bảng và dữ liệu

      // 1️⃣ Tạo bảng categories
      tx.executeSql('CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT)');
      initialCategories.forEach((c) =>
        tx.executeSql('INSERT INTO categories (id, name) VALUES (?, ?)', [c.id, c.name])
      );

      // 2️⃣ Tạo bảng products
      tx.executeSql(`CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        img TEXT,
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )`);

      initialProducts.forEach((p) =>
        tx.executeSql('INSERT INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
          [p.id, p.name, p.price, p.img, p.categoryId])
      );

      // 3️⃣ Tạo bảng users (cập nhật với các trường mới)
      tx.executeSql(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        avatar TEXT
      )`);

      // Tạo user admin mặc định
      tx.executeSql(`
        INSERT INTO users (username, password, role)
        SELECT 'admin', '123456', 'admin'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
      `);

      // 4️⃣ Tạo bảng cart
      tx.executeSql(`CREATE TABLE cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER DEFAULT 1,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id),
        UNIQUE(userId, productId)
      )`);

      // 5️⃣ Tạo bảng orders
      tx.executeSql(`CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        totalAmount REAL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT (datetime('now')),
        shippingAddress TEXT,
        phone TEXT,
        paymentMethod TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`);

      // 6️⃣ Tạo bảng order_items
      tx.executeSql(`CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      )`);
    },
      (error) => {
        console.error('❌ Reset Database Transaction error:', error);
      },
      () => {
        console.log('✅ Database reset và khởi tạo lại thành công!');
        if (onSuccess) onSuccess();
      }
    );
  } catch (error) {
    console.error('❌ resetDatabase error:', error);
    throw error;
  }
};

// ========================== KHỞI TẠO DATABASE ==========================
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = await getDb();

    // Migration: Thêm cột paymentMethod vào bảng orders nếu chưa có
    try {
      await database.executeSql('ALTER TABLE orders ADD COLUMN paymentMethod TEXT');
    } catch (e: any) {
      // Cột đã tồn tại hoặc bảng chưa tồn tại, bỏ qua
      if (!e.message?.includes('duplicate column name') && !e.message?.includes('no such table')) {
        console.log('Migration note:', e.message);
      }
    }

    // Migration: Thêm cột avatar vào bảng users nếu chưa có
    try {
      await database.executeSql('ALTER TABLE users ADD COLUMN avatar TEXT');
    } catch (e: any) {
      // Cột đã tồn tại hoặc bảng chưa tồn tại, bỏ qua
      if (!e.message?.includes('duplicate column name') && !e.message?.includes('no such table')) {
        console.log('Migration note (avatar):', e.message);
      }
    }

    database.transaction((tx) => {
      // 1️⃣ Tạo bảng categories
      tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)');
      initialCategories.forEach((c) =>
        tx.executeSql('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [c.id, c.name])
      );

      // 2️⃣ Tạo bảng products
      tx.executeSql(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        img TEXT,
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )`);

      initialProducts.forEach((p) =>
        tx.executeSql('INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
          [p.id, p.name, p.price, p.img, p.categoryId])
      );

      // 3️⃣ Tạo bảng users (cập nhật với các trường mới)
      tx.executeSql(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        avatar TEXT
      )`);

      // Tạo user admin mặc định
      tx.executeSql(`
        INSERT INTO users (username, password, role)
        SELECT 'admin', '123456', 'admin'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
      `);

      // 4️⃣ Tạo bảng cart
      tx.executeSql(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER DEFAULT 1,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id),
        UNIQUE(userId, productId)
      )`);

      // 5️⃣ Tạo bảng orders
      tx.executeSql(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        totalAmount REAL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT (datetime('now')),
        shippingAddress TEXT,
        phone TEXT,
        paymentMethod TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`);

      // 6️⃣ Tạo bảng order_items
      tx.executeSql(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      )`);
    },
      (error) => console.error('❌ Transaction error:', error),
      () => {
        console.log('✅ Database initialized');
        if (onSuccess) onSuccess();
      }
    );
  } catch (error) {
    console.error('❌ initDatabase outer error:', error);
  }
};

// ========================== HÀM TRUY VẤN DỮ LIỆU ==========================
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM categories');
    const rows = results[0].rows;
    const list: Category[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM products');
    const rows = results[0].rows;
    const list: Product[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (p: Omit<Product, 'id'>) => {
  const db = await getDb();
  await db.executeSql('INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
    [p.name, p.price, p.img, p.categoryId]);
};

export const updateProduct = async (p: Product) => {
  const db = await getDb();
  await db.executeSql('UPDATE products SET name=?, price=?, img=?, categoryId=? WHERE id=?',
    [p.name, p.price, p.img, p.categoryId, p.id]);
};

export const deleteProduct = async (id: number) => {
  const db = await getDb();
  await db.executeSql('DELETE FROM products WHERE id=?', [id]);
};

export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  const db = await getDb();
  const [res] = await db.executeSql(`
    SELECT products.* FROM products
    JOIN categories ON products.categoryId = categories.id
    WHERE products.name LIKE ? OR categories.name LIKE ?
  `, [`%${keyword}%`, `%${keyword}%`]);
  const rows = res.rows;
  const list: Product[] = [];
  for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
  return list;
};

// ====================== FILTER PRODUCTS ======================
export const filterProducts = async (
  nameKeyword?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> => {
  try {
    const db = await getDb();
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (nameKeyword && nameKeyword.trim()) {
      query += ' AND name LIKE ?';
      params.push(`%${nameKeyword.trim()}%`);
    }

    if (minPrice !== undefined && minPrice !== null) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    const results = await db.executeSql(query, params);
    const rows = results[0].rows;
    const list: Product[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error filtering products:', error);
    return [];
  }
};

// ====================== FETCH PRODUCTS BY CATEGORY ======================
export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const db = await getDb();
    const results = await db.executeSql('SELECT * FROM products WHERE categoryId = ?', [categoryId]);
    const rows = results[0].rows;
    const list: Product[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// ====================== USER FUNCTIONS ======================
export const addUser = async (username: string, password: string, role: string = 'user'): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
  } catch (error: any) {
    console.error('❌ Error adding user:', error);
    throw error;
  }
};

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const db = await getDb();
    const results = await db.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    const rows = results[0].rows;
    if (rows.length > 0) {
      return rows.item(0) as User;
    }
    return null;
  } catch (error) {
    console.error('❌ Error logging in user:', error);
    return null;
  }
};

// ====================== USER MANAGEMENT FUNCTIONS ======================
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const db = await getDb();
    const results = await db.executeSql('SELECT * FROM users ORDER BY id');
    const rows = results[0].rows;
    const list: User[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: number, role: string): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM users WHERE id = ?', [userId]);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
};

// ====================== CATEGORY MANAGEMENT FUNCTIONS ======================
export const addCategory = async (name: string): Promise<void> => {
  try {
    const db = await getDb();
    // Tìm id lớn nhất và tăng lên 1
    const [result] = await db.executeSql('SELECT MAX(id) as maxId FROM categories');
    const maxId = result.rows.item(0).maxId || 0;
    await db.executeSql('INSERT INTO categories (id, name) VALUES (?, ?)', [maxId + 1, name]);
  } catch (error) {
    console.error('❌ Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id: number, name: string): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    const db = await getDb();
    // Xóa các sản phẩm thuộc category này trước
    await db.executeSql('DELETE FROM products WHERE categoryId = ?', [id]);
    // Sau đó xóa category
    await db.executeSql('DELETE FROM categories WHERE id = ?', [id]);
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
};

// ====================== CART FUNCTIONS ======================
export const addToCart = async (userId: number, productId: number, quantity: number = 1): Promise<void> => {
  try {
    const db = await getDb();
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const [result] = await db.executeSql(
      'SELECT * FROM cart WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    
    if (result.rows.length > 0) {
      // Nếu đã có, cập nhật số lượng
      const currentQuantity = result.rows.item(0).quantity;
      await db.executeSql(
        'UPDATE cart SET quantity = ? WHERE userId = ? AND productId = ?',
        [currentQuantity + quantity, userId, productId]
      );
    } else {
      // Nếu chưa có, thêm mới
      await db.executeSql(
        'INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    throw error;
  }
};

export const getCartItems = async (userId: number): Promise<CartItem[]> => {
  try {
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT cart.*, products.name, products.price, products.img, products.categoryId 
       FROM cart 
       JOIN products ON cart.productId = products.id 
       WHERE cart.userId = ?`,
      [userId]
    );
    const rows = result.rows;
    const list: CartItem[] = [];
    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);
      list.push({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          img: item.img,
          categoryId: item.categoryId
        }
      });
    }
    return list;
  } catch (error) {
    console.error('❌ Error fetching cart items:', error);
    return [];
  }
};

export const updateCartItemQuantity = async (cartItemId: number, quantity: number): Promise<void> => {
  try {
    const db = await getDb();
    if (quantity <= 0) {
      await db.executeSql('DELETE FROM cart WHERE id = ?', [cartItemId]);
    } else {
      await db.executeSql('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, cartItemId]);
    }
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (cartItemId: number): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM cart WHERE id = ?', [cartItemId]);
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (userId: number): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM cart WHERE userId = ?', [userId]);
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    throw error;
  }
};

// ====================== ORDER FUNCTIONS ======================
export const createOrder = async (
  userId: number,
  cartItems: CartItem[],
  shippingAddress: string,
  phone: string,
  paymentMethod: string = 'cash'
): Promise<number> => {
  try {
    const db = await getDb();

    // Tính tổng tiền
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Tạo đơn hàng
    const [orderResult] = await db.executeSql(
      `INSERT INTO orders (userId, totalAmount, status, shippingAddress, phone, paymentMethod, createdAt) 
       VALUES (?, ?, 'pending', ?, ?, ?, datetime('now'))`,
      [userId, totalAmount, shippingAddress, phone, paymentMethod]
    );
    const orderId = orderResult.insertId;

    // Thêm các order items
    for (const item of cartItems) {
      if (item.product) {
        await db.executeSql(
          'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.product.price]
        );
      }
    }

    // Xóa giỏ hàng
    await db.executeSql('DELETE FROM cart WHERE userId = ?', [userId]);

    return orderId;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (userId: number): Promise<Order[]> => {
  try {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    const rows = result.rows;
    const list: Order[] = [];
    for (let i = 0; i < rows.length; i++) {
      list.push(rows.item(i) as Order);
    }
    return list;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
};

export const getOrderItems = async (orderId: number): Promise<OrderItem[]> => {
  try {
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT order_items.*, products.name, products.img, products.categoryId 
       FROM order_items 
       JOIN products ON order_items.productId = products.id 
       WHERE order_items.orderId = ?`,
      [orderId]
    );
    const rows = result.rows;
    const list: OrderItem[] = [];
    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);
      list.push({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          img: item.img,
          categoryId: item.categoryId
        }
      });
    }
    return list;
  } catch (error) {
    console.error('❌ Error fetching order items:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
};

// ====================== USER PROFILE FUNCTIONS ======================
export const updateUserProfile = async (
  userId: number,
  email?: string,
  phone?: string,
  address?: string,
  username?: string,
  password?: string,
  avatar?: string
): Promise<void> => {
  try {
    const db = await getDb();
    const updates: string[] = [];
    const params: any[] = [];

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }
    if (password !== undefined) {
      updates.push('password = ?');
      params.push(password);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length > 0) {
      params.push(userId);
      await db.executeSql(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT orders.*, users.username 
       FROM orders 
       JOIN users ON orders.userId = users.id 
       ORDER BY orders.createdAt DESC`
    );
    const rows = result.rows;
    const list: Order[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      list.push({
        id: row.id,
        userId: row.userId,
        totalAmount: row.totalAmount,
        status: row.status,
        createdAt: row.createdAt,
        shippingAddress: row.shippingAddress,
        phone: row.phone,
        paymentMethod: row.paymentMethod,
        username: row.username
      } as Order);
    }
    return list;
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    return [];
  }
};

export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const db = await getDb();
    const [result] = await db.executeSql('SELECT * FROM users WHERE id = ?', [userId]);
    if (result.rows.length > 0) {
      return result.rows.item(0) as User;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return null;
  }
};
