import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Receipt, RotateCcw } from 'lucide-react';
import { transactionsAPI, accountsAPI } from '../services/api';
import { useToast } from '../components/ui/use-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    account_id: '',
    start_date: '',
    end_date: '',
    search: '',
    transaction_type: ''
  });
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    account_id: '',
    debit: 0,
    credit: 0,
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      // Load transactions with filters
      const transactionsResponse = await transactionsAPI.getAll(filters);
      setTransactions(transactionsResponse.data?.transactions || []);
      
      // Load accounts for dropdown
      const accountsResponse = await accountsAPI.getAll();
      setAccounts(accountsResponse.data?.accounts || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
      account_id: '',
      debit: 0,
      credit: 0,
      notes: ''
    });
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transaction_date: transaction.transaction_date,
      description: transaction.description,
      account_id: transaction.account_id,
      debit: transaction.debit,
      credit: transaction.credit,
      notes: transaction.notes || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi: salah satu dari debit atau credit harus diisi
    if (formData.debit <= 0 && formData.credit <= 0) {
      toast({
        title: "Validasi Gagal",
        description: "Salah satu dari debit atau credit harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (editingTransaction) {
        await transactionsAPI.update(editingTransaction.id, formData);
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil diperbarui",
        });
      } else {
        await transactionsAPI.create(formData);
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil ditambahkan",
        });
      }

      resetForm();
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transaction) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus transaksi "${transaction.description}"?`)) {
      try {
        await transactionsAPI.delete(transaction.id);
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil dihapus",
        });
        loadData();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus transaksi",
          variant: "destructive",
        });
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'all' ? '' : value
    }));
  };

  const resetFilters = () => {
    setFilters({
      account_id: '',
      start_date: '',
      end_date: '',
      search: '',
      transaction_type: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.account_id || filters.start_date || filters.end_date || filters.search || filters.transaction_type;
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
      month: 'short',
      year: 'numeric',
    });
  };

  const getActiveAccounts = () => {
    return accounts.filter(account => account.is_active);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-600">Manajemen transaksi keuangan</p>
        </div>
        <div className="flex space-x-2">
          {hasActiveFilters() && (
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filter
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
                </DialogTitle>
                <DialogDescription>
                  {editingTransaction 
                    ? 'Edit informasi transaksi yang ada.'
                    : 'Buat transaksi baru. Isi salah satu dari debit atau credit.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transaction_date">Tanggal</Label>
                      <Input
                        id="transaction_date"
                        type="date"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_id">Akun</Label>
                      <Select
                        value={formData.account_id}
                        onValueChange={(value) => setFormData({...formData, account_id: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih akun" />
                        </SelectTrigger>
                        <SelectContent>
                          {getActiveAccounts().map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Contoh: Pembelian ATK kantor"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="debit">Debit</Label>
                      <Input
                        id="debit"
                        type="number"
                        value={formData.debit}
                        onChange={(e) => setFormData({...formData, debit: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credit">Credit</Label>
                      <Input
                        id="credit"
                        type="number"
                        value={formData.credit}
                        onChange={(e) => setFormData({...formData, credit: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Catatan tambahan"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : (editingTransaction ? 'Update' : 'Simpan')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                Filter Transaksi
                {hasActiveFilters() && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Aktif
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Filter transaksi berdasarkan kriteria
              </CardDescription>
            </div>
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter_account">Akun</Label>
              <Select
                value={filters.account_id}
                onValueChange={(value) => handleFilterChange('account_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua akun</SelectItem>
                  {getActiveAccounts().map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter_type">Tipe Transaksi</Label>
              <Select
                value={filters.transaction_type}
                onValueChange={(value) => handleFilterChange('transaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua tipe</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Tanggal Selesai</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Pencarian</Label>
              <Input
                id="search"
                placeholder="Cari deskripsi..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            Semua transaksi dalam sistem keuangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Akun</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.account?.name}</p>
                          <p className="text-sm text-gray-500">{transaction.account?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Tidak ada transaksi ditemukan</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
