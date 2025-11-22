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
export type User = { id: number; username: string; password: string; role: string; };

// Dữ liệu mẫu
const initialCategories: Category[] = [
  { id: 1, name: 'Áo' }, { id: 2, name: 'Giày' }, { id: 3, name: 'Balo' },
  { id: 4, name: 'Mũ' }, { id: 5, name: 'Túi' },
];
const initialProducts: Product[] = [
  // Danh mục Áo (categoryId: 1)
  { id: 1, name: 'Áo sơ mi trắng', price: 250000, img: 'ao1.jpg', categoryId: 1 },
  { id: 2, name: 'Áo thun nam', price: 180000, img: 'ao2.jpg', categoryId: 1 },
  { id: 3, name: 'Áo khoác gió', price: 450000, img: 'ao3.jpg', categoryId: 1 },
  { id: 4, name: 'Áo polo', price: 320000, img: 'ao4.jpg', categoryId: 1 },
  { id: 5, name: 'Áo len', price: 380000, img: 'ao5.jpg', categoryId: 1 },
  { id: 6, name: 'Áo hoodie', price: 420000, img: 'ao6.jpg', categoryId: 1 },
  
  // Danh mục Giày (categoryId: 2)
  { id: 7, name: 'Giày sneaker', price: 1100000, img: 'giay1.jpg', categoryId: 2 },
  { id: 8, name: 'Giày thể thao', price: 950000, img: 'giay2.jpg', categoryId: 2 },
  { id: 9, name: 'Giày cao gót', price: 650000, img: 'giay3.jpg', categoryId: 2 },
  { id: 10, name: 'Giày búp bê', price: 480000, img: 'giay4.jpg', categoryId: 2 },
  { id: 11, name: 'Giày boot', price: 1200000, img: 'giay5.jpg', categoryId: 2 },
  { id: 12, name: 'Giày sandal', price: 350000, img: 'giay6.jpg', categoryId: 2 },
  
  // Danh mục Balo (categoryId: 3)
  { id: 13, name: 'Balo thời trang', price: 490000, img: 'balo1.jpg', categoryId: 3 },
  { id: 14, name: 'Balo laptop', price: 550000, img: 'balo2.jpg', categoryId: 3 },
  { id: 15, name: 'Balo du lịch', price: 680000, img: 'balo3.jpg', categoryId: 3 },
  { id: 16, name: 'Balo thể thao', price: 420000, img: 'balo4.jpg', categoryId: 3 },
  { id: 17, name: 'Balo học sinh', price: 380000, img: 'balo5.jpg', categoryId: 3 },
  { id: 18, name: 'Balo mini', price: 320000, img: 'balo6.jpg', categoryId: 3 },
  
  // Danh mục Mũ (categoryId: 4)
  { id: 19, name: 'Mũ lưỡi trai', price: 120000, img: 'mu1.jpg', categoryId: 4 },
  { id: 20, name: 'Mũ bucket', price: 150000, img: 'mu2.jpg', categoryId: 4 },
  { id: 21, name: 'Mũ snapback', price: 180000, img: 'mu3.jpg', categoryId: 4 },
  { id: 22, name: 'Mũ len', price: 200000, img: 'mu4.jpg', categoryId: 4 },
  { id: 23, name: 'Mũ rộng vành', price: 250000, img: 'mu5.jpg', categoryId: 4 },
  { id: 24, name: 'Mũ beanie', price: 100000, img: 'mu6.jpg', categoryId: 4 },
  
  // Danh mục Túi (categoryId: 5)
  { id: 25, name: 'Túi xách nữ', price: 980000, img: 'tui1.jpg', categoryId: 5 },
  { id: 26, name: 'Túi đeo chéo', price: 450000, img: 'tui2.jpg', categoryId: 5 },
  { id: 27, name: 'Túi tote', price: 380000, img: 'tui3.jpg', categoryId: 5 },
  { id: 28, name: 'Túi mini', price: 320000, img: 'tui4.jpg', categoryId: 5 },
  { id: 29, name: 'Túi da', price: 1200000, img: 'tui5.jpg', categoryId: 5 },
  { id: 30, name: 'Túi vải', price: 250000, img: 'tui6.jpg', categoryId: 5 },
];

// ========================== KHỞI TẠO DATABASE ==========================
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = await getDb();

    database.transaction((tx) => {
      // tx.executeSql('DROP TABLE IF EXISTS products');
      // tx.executeSql('DROP TABLE IF EXISTS categories');

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

      // 3️⃣ Tạo bảng users
      tx.executeSql(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`);

      // Tạo user admin mặc định
      tx.executeSql(`
        INSERT INTO users (username, password, role)
        SELECT 'admin', '123456', 'admin'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
      `);
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
