import { getConnection } from "../config/database";

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.profile_image = data.profile_image;
    this.is_active = data.is_active;
    this.create_at = data.create_at;
    this.update_at = data.update_at;
  }

  static async findByEmail(email) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ? AND is_active = true",
      [email]
    );
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async findById(id) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE id = ? AND is_active = true",
      [id]
    );
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async create(userData) {
    const connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [
        userData.username,
        userData.email,
        userData.password,
        userData.role || "user",
      ]
    );
    return await User.findById(result.insertId);
  }

  static async findAll(limit = 10, offset = 0, search = "") {
    const connection = await getConnection();
    let query =
      "SELECT id, username, email, role, profile_image, is_active, create_at FROM users WHERE is_active = true";
    let params = [];

    if (search) {
      query += " AND (username LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    query += " ORDER BY create_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await connection.execute(query, params);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM users WHERE is_active = true";
    let countParams = [];
    if (search) {
      countQuery += " AND (username LIKE ? OR email LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    return { users: rows.map((row) => new User(row)), total: countResult[0].total };
  }

  async update(updateData) {
    const connection = await getConnection();
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "id") {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);

    await connection.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return await User.findById(this.id);
  }

  async softDelete() {
    const connection = await getConnection();
    await connection.execute(
      "UPDATE users SET is_active = false WHERE id = ?",
      [this.id]
    );
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

export default User;