
// File Path: src/pages/admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";

import {
  HiSearch,
  HiDownload,
  HiTrash,
  HiShieldCheck,
  HiUsers,
  HiUserGroup,
  HiLogout,
  HiViewGrid,
  HiMenuAlt2,
  HiChevronLeft,
  HiHome,
  HiClipboardList,
} from "react-icons/hi";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();

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

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/admin/users");

      setUsers(data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await API.delete(`/admin/user/${id}`);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== id)
      );

      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Delete user error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete user"
      );
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    navigate("/login");
  };

  // Dynamic stats
  const totalUsers = users.length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const customerCount = users.filter(
    (user) => user.role === "customer"
  ).length;

  // Search filter
  const filteredUsers = users.filter((user) => {
    const name = user?.name || "";
    const email = user?.email || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      {/* Sidebar */}
      <aside
        className={`bg-[#161920] border-r border-gray-800/60 flex flex-col py-6 justify-between z-20 transition-all duration-300 ${
          isSidebarOpen ? "w-64 px-6" : "w-20 px-3"
        }`}
      >
        <div>
          {/* Logo + Toggle */}
          <div className="flex items-center justify-between mb-10">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-black">
                  IN
                </div>

                <div>
                  <h2 className="text-sm font-black text-white">
                    Infynest
                  </h2>

                  <p className="text-[9px] text-gray-500">
                    Admin Panel
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-black">
                IN
              </div>
            )}

            <button
              onClick={() =>
                setIsSidebarOpen((prev) => !prev)
              }
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
          <nav className="flex flex-col gap-3">
            {/* Dashboard */}
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-4 p-3 rounded-xl bg-purple-600/20 text-purple-400 font-semibold transition"
            >
              <HiViewGrid
                size={22}
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
              title="Products"
            >
              <HiViewGrid
                size={22}
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
              title="Orders"
            >
              <HiClipboardList
                size={22}
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
              title="Visit Website"
            >
              <HiHome
                size={22}
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
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-500/20 transition cursor-pointer w-full"
            title="Logout"
          >
            <HiLogout
              size={22}
              className="flex-shrink-0"
            />

            {isSidebarOpen && (
              <span className="text-xs">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-gray-800/60 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-10">
          {/* Search */}
          <div className="relative w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <HiSearch size={18} />
            </span>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-11 pr-4 py-2.5 bg-[#181b22] border border-gray-800 rounded-2xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Admin Info */}
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-semibold tracking-wider text-gray-400 italic hidden md:block">
              Infynest Admin Panel
            </h2>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                {userInfo?.name
                  ? userInfo.name.charAt(0).toUpperCase()
                  : "A"}
              </div>

              <div className="hidden sm:block">
                <h4 className="text-xs font-bold text-white">
                  {userInfo?.name || "Admin"}
                </h4>

                <p className="text-[10px] text-gray-400">
                  {userInfo?.email ||
                    "admin@infynest.com"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-8 space-y-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Hello, {userInfo?.name || "Admin"}
            </h1>

            <p className="text-xs text-gray-400 mt-1">
              Here is what's happening with your store
              users today.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-400 to-emerald-400 text-gray-900 flex justify-between items-center shadow-lg shadow-teal-500/10">
              <div>
                <p className="text-xs font-bold tracking-wider opacity-80 uppercase">
                  Total Users
                </p>

                <h3 className="text-3xl font-black mt-1">
                  {totalUsers}
                </h3>

                <span className="text-xs font-semibold underline mt-3 inline-block">
                  Registered accounts
                </span>
              </div>

              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-teal-900">
                <HiUsers size={28} />
              </div>
            </div>

            {/* Admins */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-300 to-yellow-400 text-gray-900 flex justify-between items-center shadow-lg shadow-yellow-500/10">
              <div>
                <p className="text-xs font-bold tracking-wider opacity-80 uppercase">
                  Total Admins
                </p>

                <h3 className="text-3xl font-black mt-1">
                  {adminCount}
                </h3>

                <span className="text-xs font-semibold underline mt-3 inline-block">
                  Privileged roles
                </span>
              </div>

              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-yellow-900">
                <HiShieldCheck size={28} />
              </div>
            </div>

            {/* Customers */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-fuchsia-400 to-pink-500 text-white flex justify-between items-center shadow-lg shadow-pink-500/10">
              <div>
                <p className="text-xs font-bold tracking-wider opacity-90 uppercase">
                  Customers
                </p>

                <h3 className="text-3xl font-black mt-1">
                  {customerCount}
                </h3>

                <span className="text-xs font-semibold underline mt-3 inline-block">
                  Regular users
                </span>
              </div>

              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                <HiUserGroup size={28} />
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-[#161920] border border-gray-800/60 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Manage Users ({filteredUsers.length})
                </h3>

                <p className="text-[11px] text-gray-400">
                  View, search and manage store registered
                  users
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3.5 py-2 bg-[#1e222d] text-gray-300 rounded-xl text-xs font-semibold border border-gray-700/50 hover:bg-gray-800 transition cursor-pointer"
                >
                  Filter
                </button>

                <button
                  type="button"
                  className="px-3.5 py-2 bg-[#1e222d] text-gray-300 rounded-xl text-xs font-semibold border border-gray-700/50 hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <HiDownload size={14} />
                  Download
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>

                <p className="text-xs text-gray-400 mt-3 font-medium">
                  Loading user database...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No users found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">
                        User Details
                      </th>

                      <th className="py-3 px-4">
                        Email Address
                      </th>

                      <th className="py-3 px-4">
                        Role
                      </th>

                      <th className="py-3 px-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-800/60 text-xs">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-800/30 transition"
                      >
                        <td className="py-4 px-4 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                              {user?.name
                                ? user.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}
                            </div>

                            <div>
                              <p className="font-bold text-white">
                                {user?.name || "Unknown"}
                              </p>

                              <p className="text-[10px] text-gray-500">
                                ID:{" "}
                                {user?._id
                                  ? user._id.slice(-6)
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-gray-400">
                          {user?.email || "N/A"}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide inline-flex items-center gap-1 ${
                              user.role === "admin"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {user.role === "admin" && (
                              <HiShieldCheck size={12} />
                            )}

                            {user.role || "user"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteUser(
                                user._id
                              )
                            }
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition flex items-center gap-1 ml-auto cursor-pointer"
                            title="Delete User"
                          >
                            <HiTrash size={14} />
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
        </main>
      </div>
    </div>
  );
}

