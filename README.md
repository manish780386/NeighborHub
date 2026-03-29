# NeighborHub 🏘️

> **Apni colony, apna network** — A hyperlocal community platform connecting people within 2km radius.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Django](https://img.shields.io/badge/Django-5.0-green?logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)
![WebSocket](https://img.shields.io/badge/WebSocket-Channels-orange)

---

## 📱 Features

- **Hyperlocal Feed** — See posts only within your 2km radius
- **Post Types** — Help Request, Lost & Found, Event, Sale, Alert
- **Real-time Chat** — WebSocket-powered DMs and group chat
- **Interactive Map** — View nearby posts on Leaflet.js map
- **Community Groups** — Create and join local groups
- **Marketplace** — Buy/sell nearby items without delivery
- **Notifications** — Auto notifications for upvotes, comments, joins
- **JWT Auth** — Secure login with token refresh

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Zustand, TailwindCSS, Leaflet.js |
| Backend | Django 5, Django REST Framework |
| Real-time | Django Channels, WebSocket |
| Database | PostgreSQL |
| Cache & Queue | Redis, Celery |
| Auth | JWT (SimpleJWT) |

---

## 📁 Project Structure

```
neighborhub/
├── neighborhub-frontend/        # React app
│   ├── src/
│   │   ├── pages/               # All pages
│   │   ├── components/          # Reusable components
│   │   ├── store/               # Zustand state management
│   │   ├── lib/                 # API client, utilities
│   │   └── hooks/               # Custom hooks
│   ├── package.json
│   └── vite.config.js
│
└── neighborhub-backend/         # Django app
    ├── neighborhub_backend/     # Project config
    ├── accounts/                # Auth, User model
    ├── posts/                   # Feed, posts, comments
    ├── chat/                    # WebSocket chat
    ├── groups/                  # Community groups
    ├── marketplace/             # Buy/sell listings
    ├── notifications/           # In-app notifications
    ├── manage.py
    └── requirements.txt
```

---

## 🚀 Local Setup (Windows)

### Prerequisites
- [Python 3.11+](https://python.org/downloads)
- [Node.js 20+](https://nodejs.org)
- [PostgreSQL 16](https://postgresql.org/download/windows)
- [WSL + Redis](https://learn.microsoft.com/en-us/windows/wsl/install) (for Windows)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/yourusername/neighborhub.git
cd neighborhub
```

---

### Step 2 — Backend setup

```bash
cd neighborhub-backend

# Virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install packages
pip install -r requirements.txt

# Environment variables
copy .env.example .env
# Edit .env with your DB credentials
```

**.env file:**
```env
DEBUG=True
SECRET_KEY=your-very-long-secret-key-here
DB_NAME=neighborhub
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:5173
```

---

### Step 3 — Database setup

```bash
# Create database (in pgAdmin or terminal)
psql -U postgres -c "CREATE DATABASE neighborhub;"

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
```

---

### Step 4 — Frontend setup

```bash
cd ../neighborhub-frontend
npm install
```

---

### Step 5 — Run everything

Open **3 terminals:**

**Terminal 1 — Redis** (Ubuntu/WSL):
```bash
sudo service redis-server start
```

**Terminal 2 — Backend:**
```bash
cd neighborhub-backend
venv\Scripts\activate
daphne -b 0.0.0.0 -p 8000 neighborhub_backend.asgi:application
```

**Terminal 3 — Frontend:**
```bash
cd neighborhub-frontend
npm run dev
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Admin Panel | http://localhost:8000/admin/ |
| WebSocket | ws://localhost:8000/ws/chat/ |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register/        Register new user
POST   /api/auth/login/           Login → JWT tokens
POST   /api/auth/logout/          Logout
POST   /api/auth/token/refresh/   Refresh access token
GET    /api/auth/me/              Get own profile
PATCH  /api/auth/me/              Update profile
```

### Posts
```
GET    /api/posts/feed/           Nearby feed (radius filter)
POST   /api/posts/                Create post
GET    /api/posts/<id>/           Post detail
POST   /api/posts/<id>/upvote/    Toggle upvote
POST   /api/posts/<id>/comments/  Add comment
```

### Chat
```
GET    /api/chat/rooms/                        Room list
POST   /api/chat/rooms/                        Create DM
GET    /api/chat/rooms/<id>/messages/          Message history
WS     ws://localhost:8000/ws/chat/<room_id>/  WebSocket
```

### Groups
```
GET    /api/groups/              List groups
POST   /api/groups/              Create group
POST   /api/groups/<id>/join/    Join group
POST   /api/groups/<id>/leave/   Leave group
GET    /api/groups/<id>/posts/   Group posts
```

### Marketplace
```
GET    /api/marketplace/listings/          All listings
POST   /api/marketplace/listings/          Create listing
GET    /api/marketplace/my-listings/       My listings
```

### Notifications
```
GET    /api/notifications/                 All notifications
POST   /api/notifications/mark-all-read/   Mark all read
GET    /api/notifications/unread-count/    Unread count
```

---

## 🔌 WebSocket Usage

Connect with JWT token:
```javascript
const ws = new WebSocket(
  `ws://localhost:8000/ws/chat/${roomId}/?token=${accessToken}`
)
```

Send message:
```json
{ "type": "chat_message", "content": "Hello!" }
```

Send typing indicator:
```json
{ "type": "typing", "is_typing": true }
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project!

---

## 👨‍💻 Author

Made with ❤️ for local communitie
