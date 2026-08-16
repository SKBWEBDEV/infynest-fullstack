import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==========================================
// LAYOUT
// ==========================================
import Layout from "./components/Layout";

// ==========================================
// PUBLIC PAGES
// ==========================================
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Men from "./pages/Men";
import Women from "./pages/Women";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import SpiderMan from "./pages/SpiderMan";
import ChainsawMan from "./pages/ChainsawMan";
import StrangerThings from "./pages/StrangerThings";
import GhostRider from "./pages/GhostRider";
import Essentials from "./pages/Essentials";
import Anime from "./pages/Anime";
import Venom from "./pages/Venom";

// ==========================================
// AUTH PAGES
// ==========================================
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ==========================================
// ROUTE PROTECTION
// ==========================================
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/routes/AdminRoute";

// ==========================================
// ADMIN PAGES
// ==========================================
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddProduct from "./pages/admin/AddProduct";
import Products from "./pages/admin/Products";
import AdminOrders from "./pages/admin/AdminOrders";
import EditProduct from "./pages/EditProduct";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminContacts from "./pages/admin/AdminContacts";

// =================================================================================
// APP
// =================================================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================================
            PUBLIC PAGES
            Navbar + Footer থাকবে Layout-এর মাধ্যমে
        ================================================================= */}

        <Route element={<Layout />}>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* SHOP - ALL PRODUCTS */}
          <Route path="/shop" element={<Shop />} />

          {/* REGULAR FIT - ONLY REGULAR FIT PRODUCTS */}
          <Route
            path="/regular-fit"
            element={<Shop category="Regular Fit" />}
          />

          {/* MEN */}
          <Route path="/men" element={<Men />} />

          {/* WOMEN */}
          <Route path="/women" element={<Women />} />

          {/* PRODUCT DETAILS */}
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* CART */}
          <Route path="/cart" element={<Cart />} />

          {/* ORDERS */}
          <Route path="/orders" element={<Orders />} />

          {/* DESIGN CATEGORIES */}
          <Route path="/spider-man" element={<SpiderMan />} />

          <Route path="/chainsaw-man" element={<ChainsawMan />} />

          <Route
            path="/stranger-things"
            element={<StrangerThings />}
          />

          <Route path="/ghost-rider" element={<GhostRider />} />

          <Route path="/essentials" element={<Essentials />} />

          <Route path="/anime" element={<Anime />} />

          <Route path="/venom" element={<Venom />} />
        </Route>

        {/* ================================================================
            AUTH PAGES
        ================================================================= */}

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* FORGOT PASSWORD */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* RESET PASSWORD */}
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* ================================================================
            PROTECTED USER ROUTES
        ================================================================= */}

        <Route element={<ProtectedRoute />}>
          {/* EDIT PRODUCT */}
          <Route
            path="/admin/edit-product/:id"
            element={<EditProduct />}
          />
        </Route>

        {/* ================================================================
            ADMIN ROUTES
        ================================================================= */}

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ADMIN PRODUCTS */}
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <Products />
            </AdminRoute>
          }
        />

        {/* ADMIN ADD PRODUCT */}
        <Route
          path="/admin/add-product"
          element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          }
        />

        {/* ADMIN ORDERS */}
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

<Route
  path="/admin/contacts"
  element={
    <AdminRoute>
      <AdminContacts />
    </AdminRoute>
  }
/>


        <Route
  path="/admin/finance"
  element={<AdminFinancial />}
/>

        <Route
  path="/admin/banners"
  element={<AdminBanners />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;