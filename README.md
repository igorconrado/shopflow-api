# shopflow-api

RESTful API for e-commerce management built with Node.js, Express and TypeScript.

## Features

- **JWT Authentication** with role-based access control (ADMIN/CUSTOMER)
- **Product catalog** with categories, filtering, search and pagination
- **Shopping cart** with automatic stock validation
- **Order management** with transactional checkout
- **Automatic stock control** - decrease on order creation, restore on cancellation
- **Admin dashboard** with revenue and inventory insights
- **Comprehensive test suite** with Jest and Supertest

## Tech Stack

- **Node.js 20** - JavaScript runtime
- **Express 5** - Web framework
- **TypeScript 5** - Type-safe development
- **Prisma ORM** - Database ORM with type safety
- **PostgreSQL** - Relational database
- **JWT** - Authentication and authorization
- **Zod** - Schema validation
- **Jest + Supertest** - Testing framework
- **Docker + Docker Compose** - Containerization

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/igorconrado/shopflow-api
   cd shopflow-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/shopflow
   JWT_SECRET=your-secret-key-minimum-32-characters-long
   JWT_EXPIRATION=86400000
   PORT=3000
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Running with Docker

```bash
docker-compose up
```

The API will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get token | Public |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products with filters | Public |
| GET | `/api/products/:id` | Get product by ID | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

**Query Parameters for GET /api/products:**
- `search` - Search by product name
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Example:**
```
GET /api/products?search=iphone&minPrice=1000&maxPrice=5000&page=1&limit=20
```

**Create Product Request:**
```json
{
  "name": "iPhone 15",
  "description": "Latest Apple smartphone",
  "price": 4999.99,
  "quantity": 50,
  "imageUrl": "https://example.com/iphone15.jpg",
  "categoryId": "uuid"
}
```

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | List all categories | Public |
| GET | `/api/categories/:id` | Get category by ID | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

**Create Category Request:**
```json
{
  "name": "Electronics"
}
```

### Cart

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get user's cart | Customer |
| POST | `/api/cart/items` | Add item to cart | Customer |
| PUT | `/api/cart/items/:id` | Update item quantity | Customer |
| DELETE | `/api/cart/items/:id` | Remove item | Customer |
| DELETE | `/api/cart` | Clear cart | Customer |

**Add Item Request:**
```json
{
  "productId": "uuid",
  "quantity": 2
}
```

**Cart Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "product": {
        "id": "uuid",
        "name": "iPhone 15",
        "price": 4999.99
      }
    }
  ],
  "total": 9999.98,
  "itemCount": 2
}
```

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order from cart | Customer |
| GET | `/api/orders` | List user's orders | Customer |
| GET | `/api/orders/:id` | Get order by ID | Customer |
| PATCH | `/api/orders/:id/status` | Update order status | Admin |
| POST | `/api/orders/:id/cancel` | Cancel pending order | Customer |

**Create Order:**
- Automatically creates order from cart items
- Validates stock availability
- Decreases product stock
- Clears cart after successful order
- Stores price snapshot for historical accuracy

**Update Status Request:**
```json
{
  "status": "CONFIRMED"
}
```

**Order Statuses:**
- `PENDING` - Initial status
- `CONFIRMED` - Order confirmed by admin
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

### Summary (Admin Dashboard)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/summary` | Get dashboard statistics | Admin |

**Dashboard Response:**
```json
{
  "ordersCount": {
    "PENDING": 5,
    "CONFIRMED": 10,
    "SHIPPED": 8,
    "DELIVERED": 50,
    "CANCELLED": 2
  },
  "totalRevenue": 125000.00,
  "totalRevenuePending": 15000.00,
  "lowStockProducts": [
    {
      "id": "uuid",
      "name": "Product Name",
      "quantity": 3,
      "price": 99.99
    }
  ],
  "topProducts": [
    {
      "product": {
        "id": "uuid",
        "name": "iPhone 15",
        "price": 4999.99
      },
      "totalSold": 150
    }
  ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | - |
| `JWT_EXPIRATION` | Token expiration time in milliseconds | 86400000 |
| `PORT` | Server port | 3000 |

## Database Schema

### User
- `id` - UUID
- `email` - Unique email
- `password` - Hashed password
- `name` - User's name
- `role` - CUSTOMER or ADMIN

### Category
- `id` - UUID
- `name` - Category name

### Product
- `id` - UUID
- `name` - Product name
- `description` - Product description
- `price` - Decimal price
- `quantity` - Stock quantity
- `imageUrl` - Product image URL
- `categoryId` - Foreign key to Category

### Cart
- `id` - UUID
- `userId` - Foreign key to User

### CartItem
- `id` - UUID
- `cartId` - Foreign key to Cart
- `productId` - Foreign key to Product
- `quantity` - Item quantity

### Order
- `id` - UUID
- `userId` - Foreign key to User
- `status` - Order status enum
- `total` - Total order value

### OrderItem
- `id` - UUID
- `orderId` - Foreign key to Order
- `productId` - Foreign key to Product
- `quantity` - Ordered quantity
- `unitPrice` - Price snapshot at order time

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Test Structure

- `tests/auth.test.ts` - Authentication tests
- `tests/products.test.ts` - Product CRUD and filtering tests
- `tests/orders.test.ts` - Order creation and cancellation tests

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
shopflow-api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── src/
│   ├── auth/                  # Authentication module
│   ├── cart/                  # Cart module
│   ├── category/              # Category module
│   ├── config/                # Configuration files
│   ├── middleware/            # Express middleware
│   ├── order/                 # Order module
│   ├── product/               # Product module
│   ├── summary/               # Dashboard module
│   └── server.ts              # Application entry point
├── tests/                     # Test files
├── .env                       # Environment variables
├── jest.config.ts             # Jest configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Documentation
```

## Error Handling

The API uses consistent error responses:

```json
{
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Admin and Customer roles
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma parameterized queries
- **CORS** - Configurable CORS settings

## Performance Features

- **Database Indexing** - Optimized queries with indexes
- **Pagination** - Efficient data loading
- **Transaction Support** - ACID compliance for orders
- **Connection Pooling** - Database connection management

## Development Workflow

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Run tests: `npm test`
4. Push and create PR: `git push origin feat/feature-name`
5. Merge after review

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Author

Igor Conrado - [GitHub](https://github.com/igorconrado)

## Support

For issues and questions, please open an issue on GitHub.
