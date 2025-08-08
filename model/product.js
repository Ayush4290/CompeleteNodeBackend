import { getConnection } from "../config/database";

class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.category = data.category;
        this.stock_quantity = data.stock_quantity;
        this.image = data.image;
        this.user_id = data.user_id;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findById(id) {
        const connection = await getConnection(); // Added await
        const [rows] = await connection.execute(
            'SELECT * FROM products WHERE id = ? AND is_active = true',
            [id]
        );
        return rows.length > 0 ? new Product(rows[0]) : null;
    }

    static async create(productData) {
        const connection = await getConnection(); // Added await
        const [result] = await connection.execute(
            'INSERT INTO products (name, description, price, category, stock_quantity, image, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                productData.name,
                productData.description,
                productData.price,
                productData.category,
                productData.stock_quantity || 0,
                productData.image,
                productData.user_id
            ]
        );
        
        return await Product.findById(result.insertId);
    }

    static async findAll(options = {}) {
        const {
            limit = 10,
            offset = 0,
            search = '',
            category = '',
            sortBy = 'created_at',
            sortOrder = 'DESC',
            minPrice,
            maxPrice
        } = options;

        const connection = await getConnection(); // Added await
        let query = 'SELECT * FROM products WHERE is_active = true';
        let params = [];

        // Search filter
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Category filter
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        // Price filters
        if (minPrice !== undefined) {
            query += ' AND price >= ?';
            params.push(minPrice);
        }

        if (maxPrice !== undefined) {
            query += ' AND price <= ?';
            params.push(maxPrice);
        }

        // Sorting
        const allowedSortFields = ['name', 'price', 'created_at', 'stock_quantity'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`;
        params.push(String(limit), String(offset)); // Ensure limit and offset are strings

        const [rows] = await connection.execute(query, params);
        
        // Get total count with same filters
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE is_active = true';
        let countParams = [];
        
        if (search) {
            countQuery += ' AND (name LIKE ? OR description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }
        
        if (minPrice !== undefined) {
            countQuery += ' AND price >= ?';
            countParams.push(minPrice);
        }
        
        if (maxPrice !== undefined) {
            countQuery += ' AND price <= ?';
            countParams.push(maxPrice);
        }
        
        const [countResult] = await connection.execute(countQuery, countParams);
        
        return {
            products: rows.map(row => new Product(row)),
            total: countResult[0].total
        };
    }

    async update(updateData) {
        const connection = await getConnection(); // Added await
        const fields = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });

        if (fields.length === 0) return this;

        values.push(this.id);
        
        await connection.execute(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await Product.findById(this.id);
    }

    async softDelete() {
        const connection = await getConnection(); // Added await
        await connection.execute(
            'UPDATE products SET is_active = false WHERE id = ?',
            [this.id]
        );
    }
}

export default Product;