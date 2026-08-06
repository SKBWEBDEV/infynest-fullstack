import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import Products from './pages/admin/Products';
import Men from './pages/Men';
import Women from './pages/Women';
import EditProduct from './pages/EditProduct';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders'
import AdminOrders from './pages/admin/AdminOrders';

// =================================================================================


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- যেসব পেজে ওপরের নেভবার ও ফুটার পার্মানেন্ট থাকবে (পাবলিক পেজ) --- */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="men" element={<Men />} />       {/* Men পেজ */}
          <Route path="women" element={<Women />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* --- আলাদা পেজ (যেগুলোতে নেভবার বা ফুটার দরকার নেই, যেমন Login/Register) --- */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- প্রটেক্টেড রাউট (সাধারণ ইউজার লগইন ছাড়া ঢুকতে পারবে না, যেমন: কার্ট বা প্রোফাইল) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        </Route>

        {/* --- প্রোটেক্টেড এডমিন ড্যাশবোর্ড ও ম্যানেজমেন্ট রুটসমূহ --- */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/products" 
          element={
            <AdminRoute>
              <Products />
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/add-product" 
          element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          } 
        />

        <Route path="/admin/orders" element={<AdminOrders />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;