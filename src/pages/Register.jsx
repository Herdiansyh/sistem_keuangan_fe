import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { authAPI } from '../services/api';
import { useToast } from '../components/ui/use-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi password confirmation
    if (formData.password !== formData.password_confirmation) {
      toast({
        title: "Registrasi Gagal",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      
      if (response.success) {
        toast({
          title: "Registrasi Berhasil",
          description: "Akun Anda telah dibuat. Silakan login.",
        });
        
        // Redirect ke login
        navigate('/login');
      } else {
        toast({
          title: "Registrasi Gagal",
          description: response.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registrasi Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Buat Akun Baru</CardTitle>
          <CardDescription className="text-center">
            Daftar untuk mengakses sistem keuangan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="Masukkan kembali password"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
            <div className="text-center text-sm">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Masuk sekarang
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
