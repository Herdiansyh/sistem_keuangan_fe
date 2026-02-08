# Sistem Keuangan Frontend

## 📋 Deskripsi

Sistem keuangan frontend yang dibangun dengan React.js untuk menampilkan ringkasan akun dan laporan keuangan perusahaan.

## 🚀 Fitur Utama

### 1. **Ringkasan Akun**
- Menampilkan struktur akun secara hierarkis
- Filter berdasarkan tipe akun (Asset, Liability, Equity, Revenue, Expense)
- Expand/collapse untuk melihat detail anak akun
- Menampilkan saldo awal, total debit, total kredit, dan saldo akhir
- Counter transaksi untuk setiap akun

### 2. **Financial Summary Cards**
- Total Assets (Aset perusahaan)
- Total Liabilities (Kewajiban perusahaan)
- Total Equity (Modal perusahaan)
- Net Income (Pendapatan bersih)
- Data diambil dari backend API

### 3. **Top Accounts**
- Menampilkan akun dengan saldo tertinggi
- Informasi kode, nama, tipe, dan saldo
- Batasan maksimal 10 akun untuk performance

## 🛠️ Teknologi

- **Frontend:** React 18 dengan Hooks
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Backend API:** Laravel REST API

## 📁 Struktur File

```
src/
├── pages/
│   ├── AccountSummary.jsx     # Halaman utama ringkasan akun
│   ├── Dashboard.jsx         # Dashboard dengan summary cards
│   ├── Accounts.jsx          # Manajemen akun
│   └── Transactions.jsx     # Manajemen transaksi
├── services/
│   └── api.js              # API client dengan axios
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ui/                 # Custom components
└── utils/
    └── formatters.js       # Utility functions
```

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 16+ 
- npm atau yarn
- Backend Laravel API yang berjalan di `http://localhost:8000/api`

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
cd sistem_keuangan_fe
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi API URL

# Jalankan development server
npm start
```

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 🔧 Konfigurasi API

### Endpoints yang Digunakan

#### Account Summary
- `GET /api/account-summary` - Get all account summaries
- `GET /api/account-summary/{id}` - Get specific account summary
- `GET /api/account-summary/financial` - Get financial summary
- `GET /api/account-summary/top` - Get top accounts by balance
- `GET /api/account-summary/{id}/balance` - Get account balance

### Request/Response Format

#### Get Account Summary
```javascript
// Request
GET /api/account-summary?account_type=asset&show_inactive=false

// Response
{
  "success": true,
  "message": "Ringkasan akun berhasil diambil",
  "data": [
    {
      "id": 1,
      "code": "101",
      "name": "Kas",
      "type": "asset",
      "opening_balance": 1000000,
      "total_debit": 500000,
      "total_credit": 200000,
      "balance": 1300000,
      "total_balance": 1300000,
      "children": [...],
      "transaction_count": 15
    }
  ]
}
```

#### Get Financial Summary
```javascript
// Request
GET /api/account-summary/financial?start_date=2026-01-01&end_date=2026-12-31

// Response
{
  "success": true,
  "message": "Ringkasan keuangan berhasil diambil",
  "data": {
    "total_debit": 15000000,
    "total_credit": 12000000,
    "net_amount": 3000000,
    "total_assets": 85000000,
    "total_liabilities": 25000000,
    "total_equity": 60000000,
    "total_revenue": 20000000,
    "total_expenses": 5000000,
    "net_income": -30000000,
    "period": {
      "start_date": "2026-01-01",
      "end_date": "2026-12-31"
    }
  }
}
```

## 🎨 Komponen Utama

### AccountSummary Component
```javascript
// State management
const [summary, setSummary] = useState([]);
const [financialSummary, setFinancialSummary] = useState(null);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({
  account_type: '',
  show_inactive: false
});

// API calls
const summaryResponse = await summaryAPI.getAll(filters);
const financialResponse = await summaryAPI.financialSummary(filters);
```

### API Service
```javascript
export const summaryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/account-summary', { params });
    return response.data;
  },
  financialSummary: async (params = {}) => {
    const response = await api.get('/account-summary/financial', { params });
    return response.data;
  }
};
```

## 🔐 Error Handling

### Frontend Error Handling
```javascript
try {
  const response = await summaryAPI.getAll(filters);
  setSummary(response.data || []);
} catch (error) {
  toast({
    title: "Error",
    description: error.response?.data?.message || "Gagal memuat data ringkasan",
    variant: "destructive",
  });
} finally {
  setLoading(false);
}
```

### Backend Error Response Format
```json
{
  "success": false,
  "message": "Error message dari backend",
  "data": null
}
```

## 🎨 Styling

### Tailwind CSS Classes
```javascript
// Card styling
<Card className="bg-white shadow-lg">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-blue-600">
      Rp 1.000.000
    </div>
  </CardContent>
</Card>

// Table styling
<Table className="w-full">
  <TableHeader>
    <TableRow>
      <TableHead>Akun</TableHead>
      <TableHead className="text-right">Saldo</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Table rows */}
  </TableBody>
</Table>
```

## 🔄 Development Workflow

### 1. Setup Environment
```bash
# Backend
cd sistem_keuangan_BE
php artisan serve --host=127.0.0.1 --port=8000

# Frontend
cd sistem_keuangan_fe
npm start
```

### 2. Development Tips
- Gunakan browser dev tools untuk debugging
- Monitor network tab untuk API calls
- Check console untuk error messages
- Gunakan React DevTools untuk component inspection

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. API Connection Error
**Problem:** `Failed to load resource: the server responded with a status of 500`

**Solutions:**
- Check backend server is running
- Verify API URL in .env file
- Check CORS configuration
- Monitor Laravel logs: `php artisan log:tail`

#### 2. Data Not Displaying
**Problem:** Cards showing 0 values

**Solutions:**
- Check if backend returns data
- Verify API response structure
- Check if transactions exist in database
- Run database seeder: `php artisan db:seed`

#### 3. Method Not Found
**Problem:** `Call to undefined method`

**Solutions:**
- Verify method name in API call
- Check route definition in routes/api.php
- Clear route cache: `php artisan route:clear`

## 📦 Deployment

### Build for Production
```bash
# Build optimized version
npm run build

# Output akan ada di folder /build
```

### Environment Setup
```bash
# Production
REACT_APP_API_URL=https://your-domain.com/api

# Development
REACT_APP_API_URL=http://localhost:8000/api
```

## 🤝 Contributing

### Guidelines
1. Follow existing code style
2. Add proper error handling
3. Include comments for complex logic
4. Update documentation for new features
5. Test thoroughly before committing

### Git Workflow
```bash
# Feature branch
git checkout -b feature/account-summary-improvements

# Commit changes
git add .
git commit -m "Improve account summary display"

# Push changes
git push origin feature/account-summary-improvements

# Merge to main
git checkout main
git merge feature/account-summary-improvements
git push origin main
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👥 Support

Untuk pertanyaan atau bantuan:
- Check documentation terlebih dahulu
- Monitor issues di GitHub Issues
- Contact development team untuk technical support

**Happy Coding! 🚀**
