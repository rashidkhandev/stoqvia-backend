# STOQVIA Backend

Node.js + Express + MongoDB/Mongoose backend for the STOQVIA retail & inventory system.

## Local Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

---

## Deploying to Render (Step-by-Step)

1. **Push your code to GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
3. Select your repository.
4. Fill in these settings:
   - **Name**: `stoqvia-backend`
   - **Region**: Closest to you (e.g., Frankfurt / Oregon / Singapore)
   - **Root Directory**: `stoqvia-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
5. In **Environment Variables** (Advanced / Environment), add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://rashidwazir093_db_user:0.0.0.0@cluster0.pwoormt.mongodb.net/stoqvia?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET` = `stoqvia_super_secret_2026`
   - `CLIENT_URL` = `https://<your-vercel-app>.vercel.app` (or leave empty initially, CORS allows all Vercel domains automatically)
6. Click **Create Web Service**.
7. Once deployed, Render will give you your live URL, e.g.:
   `https://stoqvia-backend.onrender.com`

---

## Default Admin Credentials

- **Phone**: `0300-0000000`
- **Password**: `admin123`
- **Role**: `Admin`

---

## Key Endpoints

- `GET /health` or `GET /api/health` - Health check (returns database status)
- `GET /` or `GET /api` - API directory & server status
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Current user profile
- `GET /api/products` - List products
- `POST /api/products` - Add product
- `GET /api/customers` - List customers & balances
- `GET /api/sales` - List sales
- `POST /api/sales` - Record new sale
- `GET /api/dashboard/summary` - Aggregate metrics
