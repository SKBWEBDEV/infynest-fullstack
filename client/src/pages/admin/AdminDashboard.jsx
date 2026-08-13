// File Path: src/pages/admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import OrderStatusChart from "./OrderStatusChart";

import {
  HiSearch,
  HiDownload,
  HiTrash,
  HiShieldCheck,
  HiUsers,
  HiUserGroup,
  HiLogout,
  HiViewGrid,
  HiShoppingBag,
  HiMenuAlt2,
  HiChevronLeft,
  HiHome,
  HiClipboardList,
} from "react-icons/hi";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();

  // --------------------------------------------------
  // USER INFO
  // --------------------------------------------------

  const getUserInfo = () => {
    try {
      const storedUser = localStorage.getItem("userInfo");

      if (!storedUser) {
        return {};
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid userInfo:", error);
      return {};
    }
  };

  const userInfo = getUserInfo();

  // --------------------------------------------------
  // FETCH USERS
  // --------------------------------------------------

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/admin/users");

      setUsers(data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);

      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH ORDERS
  // --------------------------------------------------

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);

      const response = await API.get("/orders");

      console.log("Dashboard Orders Response:", response.data);

      if (Array.isArray(response.data?.data)) {
        setOrders(response.data.data);
      } else if (Array.isArray(response.data?.orders)) {
        setOrders(response.data.orders);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard orders:", error);

      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL FETCH
  // --------------------------------------------------

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await API.delete(`/admin/user/${id}`);

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));

      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Delete user error:", error);

      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    navigate("/login");
  };

  // --------------------------------------------------
  // USER STATS
  // --------------------------------------------------

  const totalUsers = users.length;

  const adminCount = users.filter((user) => user.role === "admin").length;

  const customerCount = users.filter(
    (user) => user.role === "customer" || user.role === "user",
  ).length;

  // --------------------------------------------------
  // SEARCH USERS
  // --------------------------------------------------

  const filteredUsers = users.filter((user) => {
    const name = user?.name || "";
    const email = user?.email || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`bg-[#161920] border-r border-gray-800/60 flex flex-col py-6 justify-between z-20 transition-all duration-300 shrink-0 ${
          isSidebarOpen ? "w-64 px-6" : "w-20 px-3"
        }`}
      >
        {/* Logo + Toggle */}

        <div>
          <div className="flex items-center justify-between mb-10">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-black">
                  IN
                </div>

                <div>
                  <h2 className="text-sm font-black text-white">INFYNEST</h2>

                  <p className="text-[9px] text-gray-500">Admin Panel</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-black mx-auto">
                IN
              </div>
            )}

            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition cursor-pointer"
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? (
                <HiChevronLeft size={20} />
              ) : (
                <HiMenuAlt2 size={20} />
              )}
            </button>
          </div>

          {/* Navigation */}

          {/* Navigation */}

<nav className="flex flex-col gap-2">

  {/* Dashboard */}

  <Link
    to="/admin/dashboard"
    className="flex items-center gap-4 p-3 rounded-xl bg-purple-600/20 text-purple-400 font-semibold transition"
  >
    <HiViewGrid
      size={21}
      className="flex-shrink-0"
    />

    {isSidebarOpen && (
      <span className="text-xs">
        Dashboard
      </span>
    )}
  </Link>


  {/* Products */}

  <Link
    to="/admin/products"
    className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition"
  >
    <HiShoppingBag
      size={21}
      className="flex-shrink-0 text-purple-400"
    />

    {isSidebarOpen && (
      <span className="text-xs">
        Products
      </span>
    )}
  </Link>


  {/* Orders */}

  <Link
    to="/admin/orders"
    className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-purple-400 transition"
  >
    <HiClipboardList
      size={21}
      className="flex-shrink-0 text-purple-400"
    />

    {isSidebarOpen && (
      <span className="text-xs">
        Orders
      </span>
    )}
  </Link>


  {/* Visit Website */}

  <Link
    to="/"
    className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition"
  >
    <HiHome
      size={21}
      className="flex-shrink-0 text-purple-400"
    />

    {isSidebarOpen && (
      <span className="text-xs">
        Visit Website
      </span>
    )}
  </Link>

</nav>

          
        </div>

        {/* Logout */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-500/20 transition cursor-pointer w-full"
        >
          <HiLogout size={21} className="flex-shrink-0" />

          {isSidebarOpen && <span className="text-xs">Logout</span>}
        </button>
      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* ==================================================
            TOP NAVBAR
        ================================================== */}

        <header className="h-20 px-5 md:px-8 flex items-center justify-between border-b border-gray-800/60 bg-[#0f1115]/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
          {/* Search */}

          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <HiSearch size={17} />
            </span>

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181b22] border border-gray-800 rounded-2xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Admin */}

          <div className="flex items-center gap-3 ml-4">
            <div className="hidden md:block text-right">
              <h4 className="text-xs font-bold text-white">
                {userInfo?.name || "Admin"}
              </h4>

              <p className="text-[10px] text-gray-500">
                {userInfo?.email || "admin@infynest.com"}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-sm">
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        {/* ==================================================
            DASHBOARD BODY
        ================================================== */}

        <main className="p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Welcome */}

          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Hello, {userInfo?.name || "Admin"}
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Here is what's happening with your store today.
            </p>
          </div>

          {/* ==================================================
              STATS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Users */}

            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-gray-900 flex justify-between items-center shadow-lg shadow-teal-500/10">
              <div>
                <p className="text-[10px] font-bold tracking-wider opacity-80 uppercase">
                  Total Users
                </p>

                <h3 className="text-2xl md:text-3xl font-black mt-1">
                  {totalUsers}
                </h3>

                <span className="text-[10px] font-semibold opacity-70">
                  Registered accounts
                </span>
              </div>

              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <HiUsers size={23} />
              </div>
            </div>

            {/* Admins */}

            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 text-gray-900 flex justify-between items-center shadow-lg shadow-yellow-500/10">
              <div>
                <p className="text-[10px] font-bold tracking-wider opacity-80 uppercase">
                  Total Admins
                </p>

                <h3 className="text-2xl md:text-3xl font-black mt-1">
                  {adminCount}
                </h3>

                <span className="text-[10px] font-semibold opacity-70">
                  Privileged roles
                </span>
              </div>

              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <HiShieldCheck size={23} />
              </div>
            </div>

            {/* Customers */}

            <div className="p-5 rounded-2xl bg-gradient-to-r from-fuchsia-400 to-pink-500 text-white flex justify-between items-center shadow-lg shadow-pink-500/10">
              <div>
                <p className="text-[10px] font-bold tracking-wider opacity-90 uppercase">
                  Customers
                </p>

                <h3 className="text-2xl md:text-3xl font-black mt-1">
                  {customerCount}
                </h3>

                <span className="text-[10px] font-semibold opacity-80">
                  Regular users
                </span>
              </div>

              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <HiUserGroup size={23} />
              </div>
            </div>
          </div>

          {/* ==================================================
              CHART + USER MANAGEMENT
          ================================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-5 items-start">
            {/* ORDER STATUS */}

            <div className="min-w-0">
              {ordersLoading ? (
                <div className="bg-[#161920] border border-gray-800/60 rounded-2xl p-5 h-[360px] flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />

                  <p className="text-[11px] text-gray-500 mt-3">
                    Loading order statistics...
                  </p>
                </div>
              ) : (
                <OrderStatusChart orders={orders} />
              )}
            </div>

            {/* USER MANAGEMENT */}

            <div className="bg-[#161920] border border-gray-800/60 rounded-2xl p-5 shadow-sm min-w-0">
              {/* Header */}

              <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Manage Users ({filteredUsers.length})
                  </h3>

                  <p className="text-[10px] text-gray-500 mt-1">
                    View and manage registered users
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 bg-[#1e222d] text-gray-300 rounded-xl text-[10px] font-semibold border border-gray-700/50 hover:bg-gray-800 transition"
                  >
                    Filter
                  </button>

                  <button
                    type="button"
                    className="px-3 py-2 bg-[#1e222d] text-gray-300 rounded-xl text-[10px] font-semibold border border-gray-700/50 hover:bg-gray-800 transition flex items-center gap-1.5"
                  >
                    <HiDownload size={13} />
                    Download
                  </button>
                </div>
              </div>

              {/* Loading */}

              {loading ? (
                <div className="py-14 text-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-purple-500 border-t-transparent" />

                  <p className="text-[11px] text-gray-500 mt-3">
                    Loading users...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-14 text-center text-gray-500 text-xs">
                  No users found.
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto overflow-x-auto rounded-xl">
                    <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#161920] z-10">
                      <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3">User</th>

                        <th className="py-3 px-3">Email</th>

                        <th className="py-3 px-3">Role</th>

                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-800/60 text-xs">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-800/30 transition"
                        >
                          {/* User */}

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {user?.name
                                  ? user.name.charAt(0).toUpperCase()
                                  : "U"}
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-[130px]">
                                  {user?.name || "Unknown"}
                                </p>

                                <p className="text-[9px] text-gray-600">
                                  ID: {user?._id ? user._id.slice(-6) : "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Email */}

                          <td className="py-3 px-3 text-gray-400">
                            <span className="block max-w-[180px] truncate">
                              {user?.email || "N/A"}
                            </span>
                          </td>

                          {/* Role */}

                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${
                                user.role === "admin"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {user.role === "admin" && (
                                <HiShieldCheck size={10} />
                              )}

                              {user.role || "user"}
                            </span>
                          </td>

                          {/* Action */}

                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user._id)}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[9px] font-semibold transition inline-flex items-center gap-1"
                              title="Delete User"
                            >
                              <HiTrash size={11} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
