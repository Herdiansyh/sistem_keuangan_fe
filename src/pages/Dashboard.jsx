import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Wallet, Receipt, TrendingUp, Users } from 'lucide-react';
import { summaryAPI, transactionsAPI, accountsAPI } from '../services/api';
import { useToast } from '../components/ui/use-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [accountStats, setAccountStats] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      // Load financial summary
      const summaryResponse = await summaryAPI.getFinancial();
      
      // Load recent transactions
      const transactionsResponse = await transactionsAPI.getAll();
      
      // Load account statistics
      const accountsResponse = await accountsAPI.getAll();

      setSummary(summaryResponse);
      setRecentTransactions(transactionsResponse.data?.transactions?.slice(0, 5) || []);
      setAccountStats(accountsResponse.data?.accounts || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Ringkasan sistem keuangan Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.total_debit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pemasukan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.total_credit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pengeluaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary?.net_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo bersih
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Akun</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountStats?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Akun terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              5 transaksi terakhir dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.account?.code} - {transaction.account?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.debit > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.debit > 0 ? '+' : '-'}
                        {formatCurrency(transaction.debit > 0 ? transaction.debit : transaction.credit)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.debit > 0 ? 'debit' : 'credit'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada transaksi</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Akses cepat ke fitur utama
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => navigate('/transactions')}
              >
                <Receipt className="h-6 w-6 mb-2" />
                <span>Buat Transaksi</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => navigate('/accounts')}
              >
                <Wallet className="h-6 w-6 mb-2" />
                <span>Tambah Akun</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => navigate('/account-summary')}
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Lihat Ringkasan</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => navigate('/transactions')}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Laporan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
