import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Wallet, ChevronDown, ChevronRight } from 'lucide-react';
import { accountsAPI } from '../services/api';
import { useToast } from '../components/ui/use-toast';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset',
    parent_id: 'none',
    opening_balance: 0,
    description: '',
    is_active: true
  });
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountsAPI.getTree();
      setAccounts(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data akun",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAccountCode = (type) => {
    const prefixes = {
      asset: '1',
      liability: '2',
      equity: '3',
      revenue: '4',
      expense: '5'
    };
    
    const prefix = prefixes[type] || '1';
    
    // Get existing accounts with same type to find next available number
    const sameTypeAccounts = accounts.filter(acc => acc.type === type);
    const maxNumber = sameTypeAccounts.reduce((max, acc) => {
      const codeNum = parseInt(acc.code.replace(/\D/g, ''));
      return codeNum > max ? codeNum : max;
    }, parseInt(prefix + '000'));
    
    const nextNumber = maxNumber + 1;
    return prefix + nextNumber.toString().padStart(3, '0');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      parent_id: 'none',
      opening_balance: 0,
      description: '',
      is_active: true
    });
    setEditingAccount(null);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      parent_id: account.parent_id ? account.parent_id.toString() : 'none',
      opening_balance: account.opening_balance || 0,
      description: account.description || '',
      is_active: account.is_active
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const accountData = {
        ...formData,
        parent_id: formData.parent_id === 'none' ? null : formData.parent_id
      };

      if (editingAccount) {
        await accountsAPI.update(editingAccount.id, accountData);
        toast({
          title: "Berhasil",
          description: "Akun berhasil diperbarui",
        });
      } else {
        await accountsAPI.create(accountData);
        toast({
          title: "Berhasil",
          description: "Akun berhasil ditambahkan",
        });
      }
      
      setDialogOpen(false);
      resetForm();
      loadAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan akun",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (account) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun "${account.name}"?`)) {
      try {
        await accountsAPI.delete(account.id);
        toast({
          title: "Berhasil",
          description: "Akun berhasil dihapus",
        });
        loadAccounts();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus akun",
          variant: "destructive",
        });
      }
    }
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
            {formatCurrency(account.balance || account.opening_balance || 0)}
          </TableCell>
          <TableCell className="text-center">
            {account.is_active ? 'Aktif' : 'Tidak Aktif'}
          </TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(account)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(account)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && (
          account.children.map(child => renderAccount(child, level + 1))
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Akun</h1>
          <p className="text-gray-600">Manajemen akun keuangan</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Akun
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount 
                  ? 'Edit informasi akun yang ada.'
                  : 'Buat akun baru dalam sistem.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode Akun</Label>
                    <Input
                      id="code"
                      value={editingAccount ? formData.code : generateAccountCode(formData.type)}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      readOnly={editingAccount}
                      placeholder={editingAccount ? "" : "Auto-generated"}
                      className={editingAccount ? '' : 'bg-gray-100'}
                    />
                    <p className="text-xs text-gray-500">
                      {editingAccount 
                        ? "Kode akun tidak dapat diubah"
                        : "Kode akan digenerate otomatis"
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe Akun</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({...formData, type: value})}
                      disabled={editingAccount}
                    >
                      <SelectTrigger className={editingAccount ? 'bg-gray-100' : ''}>
                        <SelectValue placeholder="Pilih tipe akun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Akun</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Kas Bank"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_id">Akun Induk</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) => setFormData({...formData, parent_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih akun induk (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada induk</SelectItem>
                      {accounts.filter(acc => acc.is_active && !acc.parent_id).map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opening_balance">Saldo Awal</Label>
                  <Input
                    id="opening_balance"
                    type="number"
                    value={formData.opening_balance}
                    onChange={(e) => setFormData({...formData, opening_balance: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Deskripsi akun (opsional)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <Label htmlFor="is_active">Akun Aktif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : (editingAccount ? 'Update' : 'Simpan')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun</CardTitle>
          <CardDescription>
            Semua akun dalam sistem keuangan
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
                  <TableHead>Akun</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length > 0 ? (
                  accounts.map(account => renderAccount(account))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Tidak ada akun ditemukan</p>
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

export default Accounts;
