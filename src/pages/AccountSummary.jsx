import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Wallet, Target, PieChart, ChevronDown, ChevronRight } from 'lucide-react';
import { summaryAPI } from '../services/api';
import { useToast } from '../components/ui/use-toast';

const AccountSummary = () => {
  const [summary, setSummary] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [topAccounts, setTopAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    account_type: '',
    show_inactive: false
  });
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadSummaryData();
  }, [filters]);

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      
      // Load hierarchical account summary
      const summaryResponse = await summaryAPI.getAll(filters);
      setSummary(summaryResponse.data.accounts || []);
      
      // Load financial summary
      const financialResponse = await summaryAPI.financialSummary(filters);
      setFinancialSummary(financialResponse.data);
      
      // Load top accounts
      const topAccountsResponse = await summaryAPI.getTopAccounts(filters);
      setTopAccounts(topAccountsResponse.data.accounts || []);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat data ringkasan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'all' ? '' : value
    }));
  };

  const handleRefresh = async () => {
    await loadSummaryData();
  };

  const toggleAccountExpansion = (accountId) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getAccountTypeLabel = (type) => {
    const labels = {
      asset: 'Asset',
      liability: 'Liability',
      equity: 'Equity',
      revenue: 'Revenue',
      expense: 'Expense'
    };
    return labels[type] || type;
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      asset: 'text-blue-600 bg-blue-50',
      liability: 'text-red-600 bg-red-50',
      equity: 'text-green-600 bg-green-50',
      revenue: 'text-purple-600 bg-purple-50',
      expense: 'text-orange-600 bg-orange-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const renderAccount = (account, level = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const indent = level * 24;

    return (
      <React.Fragment key={account.id}>
        <TableRow className="hover:bg-gray-50">
          <TableCell>
            <div 
              className="flex items-center" 
              style={{ paddingLeft: `${indent}px` }}
            >
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6 mr-2"
                  onClick={() => toggleAccountExpansion(account.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && (
                <div className="w-6 mr-2" />
              )}
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-gray-500">{account.code}</p>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
              {getAccountTypeLabel(account.type)}
            </span>
          </TableCell>
          <TableCell className="text-right">
            <span className="text-sm font-medium">
              {formatCurrency(account.balance || account.opening_balance || 0)}
            </span>
          </TableCell>
          <TableCell className="text-right text-green-600">
            {formatCurrency(account.total_debit || 0)}
          </TableCell>
          <TableCell className="text-right text-red-600">
            {formatCurrency(account.total_credit || 0)}
          </TableCell>
          <TableCell className="text-right font-bold">
            {formatCurrency(account.total_balance || (account.balance || account.opening_balance || 0))}
          </TableCell>
          <TableCell className="text-center">
            {account.transaction_count || 0}
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && (
          account.children.map(child => renderAccount(child, level + 1))
        )}
      </React.Fragment>
    );
  };

  const cards = [
    {
      title: 'Total Asset',
      value: financialSummary?.total_assets || 0,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Total aset perusahaan'
    },
    {
      title: 'Total Liability',
      value: financialSummary?.total_liabilities || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Total kewajiban'
    },
    {
      title: 'Total Equity',
      value: financialSummary?.total_equity || 0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Total modal perusahaan'
    },
    {
      title: 'Net Income',
      value: financialSummary?.net_income || 0,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Pendapatan bersih'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ringkasan Akun</h1>
          <p className="text-gray-600">Laporan keuangan dan analisis akun</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Ringkasan</CardTitle>
          <CardDescription>
            Filter ringkasan berdasarkan tipe akun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="account_type" className="text-sm font-medium">Tipe Akun</label>
              <Select
                value={filters.account_type || 'all'}
                onValueChange={(value) => handleFilterChange('account_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="show_inactive" className="text-sm font-medium">Tampilkan Tidak Aktif</label>
              <Select
                value={filters.show_inactive?.toString() || 'false'}
                onValueChange={(value) => handleFilterChange('show_inactive', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Hanya Aktif</SelectItem>
                  <SelectItem value="true">Semua Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(card.value)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Struktur Akun</CardTitle>
              <CardDescription>
                Hierarki akun dengan saldo dan transaksi
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Akun</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Saldo Awal</TableHead>
                      <TableHead className="text-right">Total Debit</TableHead>
                      <TableHead className="text-right">Total Credit</TableHead>
                      <TableHead className="text-right">Total Saldo</TableHead>
                      <TableHead className="text-center">Transaksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.length > 0 ? (
                      summary.map(account => renderAccount(account))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Tidak ada data akun</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Accounts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Akun Teratas</CardTitle>
              <CardDescription>
                Akun dengan saldo tertinggi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : topAccounts.length > 0 ? (
                <div className="space-y-4">
                  {topAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          <span className="text-blue-600 font-semibold text-sm">
                            {account.code.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-gray-500">{account.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(account.balance || account.total_balance || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada data akun</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;