// File Path: frontend/src/pages/admin/AdminFinancial.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../services/api";
import toast from "react-hot-toast";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function AdminFinancial() {
  const navigate = useNavigate();

  // ======================================================
  // DEFAULT VALUES
  // ======================================================

  const defaultDashboard = {
    totalIncome: 0,
    totalExpense: 0,
    totalRefund: 0,
    totalPaymentFee: 0,
    totalShipping: 0,
    totalCosts: 0,
    netProfit: 0,
    profitMargin: 0,
    transactionCount: 0,
  };

  const defaultPagination = {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  // ======================================================
  // STATE
  // ======================================================

  const [dashboard, setDashboard] =
    useState(defaultDashboard);

  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [allChartTransactions, setAllChartTransactions] =
    useState([]);

  const [allChartExpenses, setAllChartExpenses] =
    useState([]);

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [loadingTransactions, setLoadingTransactions] =
    useState(true);

  const [loadingExpenses, setLoadingExpenses] =
    useState(true);

  const [loadingChart, setLoadingChart] =
    useState(true);

  const [downloadingPDF, setDownloadingPDF] =
    useState(false);




  // ======================================================
  // NORMAL FILTER STATE
  // ======================================================

  const [transactionType, setTransactionType] =
    useState("");

  const [transactionCategory, setTransactionCategory] =
    useState("");

  const [expenseCategory, setExpenseCategory] =
    useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ======================================================
  // REPORT PDF FILTER
  // ======================================================

  const [reportType, setReportType] =
    useState("monthly");

  const [reportDate, setReportDate] =
    useState("");

  const [reportWeek, setReportWeek] =
    useState("");

  const [reportMonth, setReportMonth] =
    useState("");

  const [reportStartDate, setReportStartDate] =
    useState("");

  const [reportEndDate, setReportEndDate] =
    useState("");

  // ======================================================
  // PAGINATION
  // ======================================================

  const [transactionPagination, setTransactionPagination] =
    useState(defaultPagination);

  const [expensePagination, setExpensePagination] =
    useState(defaultPagination);

  // ======================================================
  // EXPENSE FORM
  // ======================================================

  const [showExpenseForm, setShowExpenseForm] =
    useState(false);

  const [creatingExpense, setCreatingExpense] =
    useState(false);

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "other",
    amount: "",
    paymentMethod: "other",
    description: "",
    expenseDate: "",
  });

  // ======================================================
  // FORMAT CURRENCY
  // ======================================================

  const formatCurrency = (amount) => {
    return `৳${Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPDFCurrency = (amount) => {
    return `BDT ${Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ======================================================
  // ERROR MESSAGE
  // ======================================================

  const getErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      error?.message ||
      fallback
    );
  };

  // ======================================================
  // DATE PARAMS
  // ======================================================

  const getDateParams = () => {
    const params = {};

    if (startDate) {
      params.startDate = startDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    return params;
  };

  // ======================================================
  // REPORT TYPE LABEL
  // ======================================================

  const getReportTypeLabel = () => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      custom: "Custom Date Range",
    };

    return labels[reportType] || "Monthly";
  };

  // ======================================================
  // GET MONDAY OF WEEK
  // ======================================================

  const getMonday = (date) => {
    const d = new Date(date);

    const day = d.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    d.setDate(d.getDate() + diff);

    return d;
  };

  // ======================================================
  // FORMAT YYYY-MM-DD
  // ======================================================

  const formatInputDate = (date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ======================================================
  // GET WEEK RANGE
  // ======================================================

  const getWeekRangeFromInput = (weekValue) => {
    if (!weekValue) {
      return null;
    }

    const match = weekValue.match(
      /^(\d{4})-W(\d{2})$/,
    );

    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const week = Number(match[2]);

    const jan4 = new Date(
      year,
      0,
      4,
    );

    const monday = getMonday(jan4);

    monday.setDate(
      monday.getDate() +
      (week - 1) * 7,
    );

    const sunday = new Date(monday);

    sunday.setDate(
      sunday.getDate() + 6,
    );

    return {
      startDate: formatInputDate(monday),
      endDate: formatInputDate(sunday),
    };
  };

  // ======================================================
  // GET REPORT DATE RANGE
  // ======================================================

  const getReportDateRange = () => {
    // DAILY
    if (reportType === "daily") {
      if (!reportDate) {
        return null;
      }

      return {
        startDate: reportDate,
        endDate: reportDate,
        label: formatDate(reportDate),
      };
    }

    // WEEKLY
    if (reportType === "weekly") {
      if (!reportWeek) {
        return null;
      }

      const range =
        getWeekRangeFromInput(reportWeek);

      if (!range) {
        return null;
      }

      return {
        ...range,
        label: `${formatDate(
          range.startDate,
        )} - ${formatDate(
          range.endDate,
        )}`,
      };
    }

    // MONTHLY
    if (reportType === "monthly") {
      if (!reportMonth) {
        return null;
      }

      const [year, month] =
        reportMonth
          .split("-")
          .map(Number);

      if (!year || !month) {
        return null;
      }

      const firstDay = new Date(
        year,
        month - 1,
        1,
      );

      const lastDay = new Date(
        year,
        month,
        0,
      );

      return {
        startDate: formatInputDate(
          firstDay,
        ),
        endDate: formatInputDate(
          lastDay,
        ),
        label: firstDay.toLocaleDateString(
          "en-BD",
          {
            month: "long",
            year: "numeric",
          },
        ),
      };
    }

    // CUSTOM
    if (reportType === "custom") {
      if (
        !reportStartDate ||
        !reportEndDate
      ) {
        return null;
      }

      if (
        new Date(reportStartDate) >
        new Date(reportEndDate)
      ) {
        return null;
      }

      return {
        startDate: reportStartDate,
        endDate: reportEndDate,
        label: `${formatDate(
          reportStartDate,
        )} - ${formatDate(
          reportEndDate,
        )}`,
      };
    }

    return null;
  };

  // ======================================================
  // FETCH DASHBOARD
  // ======================================================

  const fetchDashboard = async () => {
    try {
      setLoadingDashboard(true);

      const { data } = await API.get(
        "/financial/dashboard",
        {
          params: getDateParams(),
        },
      );

      if (data?.success) {
        setDashboard({
          ...defaultDashboard,
          ...(data.data || {}),
        });
      } else {
        setDashboard(
          defaultDashboard,
        );
      }
    } catch (error) {
      console.error(
        "Financial dashboard error:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "Failed to load financial dashboard",
        ),
      );

      setDashboard(
        defaultDashboard,
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  // ======================================================
  // FETCH TRANSACTIONS
  // ======================================================

  const fetchTransactions = async (
    page = 1,
  ) => {
    try {
      setLoadingTransactions(true);

      const params = {
        page,
        limit: 20,
      };

      if (transactionType) {
        params.type =
          transactionType;
      }

      if (transactionCategory) {
        params.category =
          transactionCategory;
      }

      if (startDate) {
        params.startDate =
          startDate;
      }

      if (endDate) {
        params.endDate =
          endDate;
      }

      const { data } =
        await API.get(
          "/financial/transactions",
          {
            params,
          },
        );

      if (data?.success) {
        setTransactions(
          Array.isArray(data.data)
            ? data.data
            : [],
        );

        setTransactionPagination({
          ...defaultPagination,
          ...(data.pagination ||
            {}),
        });
      } else {
        setTransactions([]);
        setTransactionPagination(
          defaultPagination,
        );
      }
    } catch (error) {
      console.error(
        "Financial transactions error:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "Failed to load transactions",
        ),
      );

      setTransactions([]);
      setTransactionPagination(
        defaultPagination,
      );
    } finally {
      setLoadingTransactions(
        false,
      );
    }
  };

  // ======================================================
  // FETCH EXPENSES
  // ======================================================

  const fetchExpenses = async (
    page = 1,
  ) => {
    try {
      setLoadingExpenses(true);

      const params = {
        page,
        limit: 20,
      };

      if (expenseCategory) {
        params.category =
          expenseCategory;
      }

      if (startDate) {
        params.startDate =
          startDate;
      }

      if (endDate) {
        params.endDate =
          endDate;
      }

      const { data } =
        await API.get(
          "/financial/expenses",
          {
            params,
          },
        );

      if (data?.success) {
        setExpenses(
          Array.isArray(data.data)
            ? data.data
            : [],
        );

        setExpensePagination({
          ...defaultPagination,
          ...(data.pagination ||
            {}),
        });
      } else {
        setExpenses([]);
        setExpensePagination(
          defaultPagination,
        );
      }
    } catch (error) {
      console.error(
        "Financial expenses error:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "Failed to load expenses",
        ),
      );

      setExpenses([]);
      setExpensePagination(
        defaultPagination,
      );
    } finally {
      setLoadingExpenses(false);
    }
  };

  // ======================================================
  // FETCH CHART DATA
  // ======================================================

  const fetchChartData = async () => {
    try {
      setLoadingChart(true);

      const [
        transactionResponse,
        expenseResponse,
      ] = await Promise.all([
        API.get(
          "/financial/transactions",
          {
            params: {
              page: 1,
              limit: 100000,
            },
          },
        ),

        API.get(
          "/financial/expenses",
          {
            params: {
              page: 1,
              limit: 100000,
            },
          },
        ),
      ]);

      const transactionData =
        transactionResponse.data
          ?.success &&
          Array.isArray(
            transactionResponse.data
              ?.data,
          )
          ? transactionResponse.data
            .data
          : [];

      const expenseData =
        expenseResponse.data
          ?.success &&
          Array.isArray(
            expenseResponse.data
              ?.data,
          )
          ? expenseResponse.data
            .data
          : [];

      setAllChartTransactions(
        transactionData,
      );

      setAllChartExpenses(
        expenseData,
      );
    } catch (error) {
      console.error(
        "Financial chart error:",
        error,
      );

      setAllChartTransactions([]);
      setAllChartExpenses([]);
    } finally {
      setLoadingChart(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchDashboard();
    fetchTransactions(1);
    fetchExpenses(1);
    fetchChartData();
  }, []);

  // ======================================================
  // APPLY FILTERS
  // ======================================================

  const applyFilters = async () => {
    if (
      startDate &&
      endDate &&
      new Date(startDate) >
      new Date(endDate)
    ) {
      toast.error(
        "Start date cannot be after end date",
      );

      return;
    }

    await Promise.all([
      fetchDashboard(),
      fetchTransactions(1),
      fetchExpenses(1),
    ]);
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = async () => {
    setStartDate("");
    setEndDate("");
    setTransactionType("");
    setTransactionCategory("");
    setExpenseCategory("");

    try {
      setLoadingDashboard(true);
      setLoadingTransactions(true);
      setLoadingExpenses(true);

      const [
        dashboardResponse,
        transactionResponse,
        expenseResponse,
      ] = await Promise.all([
        API.get(
          "/financial/dashboard",
        ),

        API.get(
          "/financial/transactions",
          {
            params: {
              page: 1,
              limit: 20,
            },
          },
        ),

        API.get(
          "/financial/expenses",
          {
            params: {
              page: 1,
              limit: 20,
            },
          },
        ),
      ]);

      if (
        dashboardResponse.data
          ?.success
      ) {
        setDashboard({
          ...defaultDashboard,
          ...(dashboardResponse.data
            .data || {}),
        });
      }

      if (
        transactionResponse.data
          ?.success
      ) {
        setTransactions(
          Array.isArray(
            transactionResponse.data
              .data,
          )
            ? transactionResponse.data
              .data
            : [],
        );

        setTransactionPagination({
          ...defaultPagination,
          ...(transactionResponse
            .data.pagination ||
            {}),
        });
      }

      if (
        expenseResponse.data
          ?.success
      ) {
        setExpenses(
          Array.isArray(
            expenseResponse.data
              .data,
          )
            ? expenseResponse.data
              .data
            : [],
        );

        setExpensePagination({
          ...defaultPagination,
          ...(expenseResponse.data
            .pagination || {}),
        });
      }
    } catch (error) {
      console.error(
        "Clear financial filters error:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "Failed to reset financial data",
        ),
      );
    } finally {
      setLoadingDashboard(false);
      setLoadingTransactions(
        false,
      );
      setLoadingExpenses(false);
    }
  };

  // ======================================================
  // EXPENSE FORM CHANGE
  // ======================================================

  const handleExpenseChange = (
    e,
  ) => {
    const {
      name,
      value,
    } = e.target;

    setExpenseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // CREATE EXPENSE
  // ======================================================

  const handleCreateExpense = async (
    e,
  ) => {
    e.preventDefault();

    const title =
      expenseForm.title.trim();

    const amount = Number(
      expenseForm.amount,
    );

    if (!title) {
      toast.error(
        "Expense title is required",
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      toast.error(
        "Enter a valid expense amount",
      );
      return;
    }

    try {
      setCreatingExpense(true);

      const payload = {
        title,
        category:
          expenseForm.category,
        amount,
        paymentMethod:
          expenseForm.paymentMethod,
        description:
          expenseForm.description.trim(),

        ...(expenseForm.expenseDate && {
          expenseDate:
            expenseForm.expenseDate,
        }),
      };

      const { data } =
        await API.post(
          "/financial/expenses",
          payload,
        );

      if (!data?.success) {
        throw new Error(
          data?.message ||
          "Failed to create expense",
        );
      }

      toast.success(
        "Expense added successfully",
      );

      setExpenseForm({
        title: "",
        category: "other",
        amount: "",
        paymentMethod: "other",
        description: "",
        expenseDate: "",
      });

      setShowExpenseForm(false);

      await Promise.all([
        fetchDashboard(),
        fetchTransactions(1),
        fetchExpenses(1),
        fetchChartData(),
      ]);
    } catch (error) {
      console.error(
        "Create expense error:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "Failed to create expense",
        ),
      );
    } finally {
      setCreatingExpense(false);
    }
  };

  // ======================================================
  // TRANSACTION TYPE LABEL
  // ======================================================

  const transactionTypeLabel = (
    type,
  ) => {
    const labels = {
      income: "Income",
      expense: "Expense",
      product_cost:
        "Product Cost",
      refund: "Refund",
      payment_fee:
        "Payment Fee",
      shipping: "Shipping",
    };

    return (
      labels[type] ||
      type ||
      "Unknown"
    );
  };

  // ======================================================
  // CATEGORY LABEL
  // ======================================================

  const categoryLabel = (
    category,
  ) => {
    if (!category) return "-";

    return category
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  };

  // ======================================================
  // TRANSACTION STYLE
  // ======================================================

  const getTransactionStyle = (
    type,
  ) => {
    const styles = {
      income:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",

      expense:
        "bg-red-500/10 text-red-400 border border-red-500/20",

      product_cost:
        "bg-orange-500/10 text-orange-400 border border-orange-500/20",

      refund:
        "bg-orange-500/10 text-orange-400 border border-orange-500/20",

      payment_fee:
        "bg-purple-500/10 text-purple-400 border border-purple-500/20",

      shipping:
        "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    };

    return (
      styles[type] ||
      "bg-slate-800 text-slate-300 border border-slate-700"
    );
  };

  // ======================================================
  // PROFIT STATUS
  // ======================================================

  const profitPositive =
    Number(
      dashboard.netProfit || 0,
    ) >= 0;

  // ======================================================
  // KPI CARDS
  // ======================================================

  const cards = useMemo(
    () => [
      {
        title: "Total Income",
        value:
          dashboard.totalIncome,
        icon: "↗",
        className:
          "bg-emerald-500 border-emerald-800/60",
        valueClass:
          "text-white",
      },

      {
        title: "Total Expense",
        value:
          dashboard.totalExpense,
        icon: "↘",
        className:
          "bg-red-500 border-red-800/60",
        valueClass:
          "text-white",
      },

      {
        title: "Total Expense + Product Cost",
        value:
          dashboard.totalCosts,
        icon: "−",
        className:
          "bg-orange-500 border-orange-800/60",
        valueClass:
          "text-white",
      },

      {
        title: "Net Profit",
        value:
          dashboard.netProfit,
        icon: profitPositive
          ? "✓"
          : "!",
        className:
          profitPositive
            ? "bg-indigo-500 border-indigo-800/60"
            : "bg-red-950/60 border-red-800/60",
        valueClass:
          "text-white",
      },

      {
        title: "Profit Margin",
        value: `${Number(
          dashboard.profitMargin ||
          0,
        ).toFixed(2)}%`,
        icon: "%",
        className:
          "bg-blue-500 border-blue-800/60",
        valueClass:
          "text-white",
        isCurrency: false,
      },

      {
        title: "Transactions",
        value:
          dashboard.transactionCount,
        icon: "#",
        className:
          "bg-purple-500 border-purple-800/60",
        valueClass:
          "text-white",
        isCurrency: false,
      },
    ],
    [
      dashboard,
      profitPositive,
    ],
  );


  // ======================================================
  // MONTHLY CHART DATA
  // ======================================================

  const monthlyFinancialData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = months.map((month) => ({
      month,
      income: 0,
      expense: 0,
      profit: 0,
    }));

    // ------------------------------------------------------
    // USE FINANCIAL TRANSACTIONS ONLY
    // ------------------------------------------------------
    // Important:
    // Do NOT add allChartExpenses separately here.
    // Expense records are already represented as transactions.
    // Adding both causes double counting.
    // ------------------------------------------------------

    allChartTransactions.forEach((transaction) => {
      const date = new Date(
        transaction.transactionDate
      );

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthIndex = date.getMonth();

      const amount = Math.abs(
        Number(transaction.amount || 0)
      );

      if (transaction.type === "income") {
        // Revenue
        result[monthIndex].income += amount;
      } else {
        // Every non-income financial transaction
        // is a business cost/reduction from profit.
        result[monthIndex].expense += amount;
      }
    });

    // ------------------------------------------------------
    // PROFIT
    // ------------------------------------------------------

    result.forEach((item) => {
      item.profit = item.income - item.expense;
    });

    return result;
  }, [allChartTransactions]);



  // ======================================================
  // DOWNLOAD FILTERED PDF
  // ======================================================

  const downloadFinancialPDF =
    async () => {
      try {
        setDownloadingPDF(true);

        // --------------------------------------------------
        // GET SELECTED REPORT RANGE
        // --------------------------------------------------

        const reportRange =
          getReportDateRange();

        if (!reportRange) {
          toast.error(
            "Please select a valid report period",
          );

          return;
        }

        const {
          startDate:
          pdfStartDate,
          endDate:
          pdfEndDate,
          label:
          reportPeriodLabel,
        } = reportRange;

        // --------------------------------------------------
        // FETCH FILTERED TRANSACTIONS
        // --------------------------------------------------

        const transactionParams = {
          page: 1,
          limit: 100000,
          startDate:
            pdfStartDate,
          endDate:
            pdfEndDate,
        };

        // --------------------------------------------------
        // FETCH FILTERED EXPENSES
        // --------------------------------------------------

        const expenseParams = {
          page: 1,
          limit: 100000,
          startDate:
            pdfStartDate,
          endDate:
            pdfEndDate,
        };

        // Keep category filters if selected
        if (transactionType) {
          transactionParams.type =
            transactionType;
        }

        if (transactionCategory) {
          transactionParams.category =
            transactionCategory;
        }

        if (expenseCategory) {
          expenseParams.category =
            expenseCategory;
        }

        // --------------------------------------------------
        // FETCH DATA
        // --------------------------------------------------

        const [
          transactionResponse,
          expenseResponse,
          dashboardResponse,
        ] = await Promise.all([
          API.get(
            "/financial/transactions",
            {
              params:
                transactionParams,
            },
          ),

          API.get(
            "/financial/expenses",
            {
              params:
                expenseParams,
            },
          ),

          API.get(
            "/financial/dashboard",
            {
              params: {
                startDate:
                  pdfStartDate,
                endDate:
                  pdfEndDate,
              },
            },
          ),
        ]);

        const allTransactions =
          transactionResponse
            .data?.success &&
            Array.isArray(
              transactionResponse
                .data?.data,
            )
            ? transactionResponse
              .data.data
            : [];

        const allExpenses =
          expenseResponse.data
            ?.success &&
            Array.isArray(
              expenseResponse
                .data?.data,
            )
            ? expenseResponse
              .data.data
            : [];

        const pdfDashboard =
          dashboardResponse
            .data?.success
            ? {
              ...defaultDashboard,
              ...(dashboardResponse
                .data.data || {}),
            }
            : defaultDashboard;

        // --------------------------------------------------
        // CREATE PDF
        // --------------------------------------------------

        const doc =
          new jsPDF({
            orientation:
              "landscape",
            unit: "mm",
            format: "a4",
          });

        const pageWidth =
          doc.internal.pageSize.getWidth();

        const pageHeight =
          doc.internal.pageSize.getHeight();

        // --------------------------------------------------
        // HEADER
        // --------------------------------------------------

        doc.setFillColor(
          15,
          23,
          42,
        );

        doc.rect(
          0,
          0,
          pageWidth,
          38,
          "F",
        );

        doc.setTextColor(
          255,
          255,
          255,
        );

        doc.setFontSize(20);

        doc.setFont(
          "helvetica",
          "bold",
        );

        doc.text(
          "FINANCIAL REPORT",
          14,
          14,
        );

        doc.setFontSize(9);

        doc.setFont(
          "helvetica",
          "normal",
        );

        doc.text(
          "Business Financial Overview",
          14,
          21,
        );

        doc.setFontSize(9);

        doc.text(
          `Report Type: ${getReportTypeLabel()}`,
          pageWidth - 14,
          14,
          {
            align: "right",
          },
        );

        doc.text(
          `Period: ${reportPeriodLabel}`,
          pageWidth - 14,
          21,
          {
            align: "right",
          },
        );

        doc.text(
          `Generated: ${new Date().toLocaleDateString(
            "en-BD",
          )}`,
          pageWidth - 14,
          28,
          {
            align: "right",
          },
        );

        // --------------------------------------------------
        // SUMMARY
        // --------------------------------------------------

        autoTable(doc, {
          startY: 46,

          head: [
            [
              "Financial Summary",
              "Amount",
            ],
          ],

          body: [
            [
              "Report Type",
              getReportTypeLabel(),
            ],

            [
              "Report Period",
              reportPeriodLabel,
            ],

            [
              "Total Income",
              formatPDFCurrency(
                pdfDashboard.totalIncome,
              ),
            ],

            [
              "Total Expense",
              formatPDFCurrency(
                pdfDashboard.totalExpense,
              ),
            ],

            [
              "Total Refund",
              formatPDFCurrency(
                pdfDashboard.totalRefund,
              ),
            ],

            [
              "Payment Fees",
              formatPDFCurrency(
                pdfDashboard.totalPaymentFee,
              ),
            ],

            [
              "Shipping Cost",
              formatPDFCurrency(
                pdfDashboard.totalShipping,
              ),
            ],

            [
              "Total Costs",
              formatPDFCurrency(
                pdfDashboard.totalCosts,
              ),
            ],

            [
              "Net Profit",
              formatPDFCurrency(
                pdfDashboard.netProfit,
              ),
            ],

            [
              "Profit Margin",
              `${Number(
                pdfDashboard.profitMargin ||
                0,
              ).toFixed(2)}%`,
            ],

            [
              "Transactions",
              String(
                pdfDashboard.transactionCount ||
                0,
              ),
            ],
          ],

          theme: "grid",

          headStyles: {
            fillColor: [
              30,
              41,
              59,
            ],
            textColor: 255,
            fontStyle:
              "bold",
          },

          styles: {
            fontSize: 9,
            cellPadding: 3,
          },

          columnStyles: {
            0: {
              cellWidth: 100,
            },

            1: {
              cellWidth: 80,
              halign:
                "right",
            },
          },
        });

        // --------------------------------------------------
        // TRANSACTIONS
        // --------------------------------------------------

        let transactionStartY =
          doc.lastAutoTable
            .finalY + 12;

        if (
          transactionStartY >
          pageHeight - 40
        ) {
          doc.addPage();

          transactionStartY = 18;
        }

        doc.setTextColor(
          15,
          23,
          42,
        );

        doc.setFontSize(14);

        doc.setFont(
          "helvetica",
          "bold",
        );

        doc.text(
          `Financial Transactions (${allTransactions.length})`,
          14,
          transactionStartY,
        );

        const transactionRows =
          allTransactions.map(
            (
              transaction,
            ) => {
              const isIncome =
                transaction.type ===
                "income";

              return [
                formatDate(
                  transaction.transactionDate,
                ),

                transaction.title ||
                "-",

                transactionTypeLabel(
                  transaction.type,
                ),

                categoryLabel(
                  transaction.category,
                ),

                transaction.paymentMethod ||
                "-",

                `${isIncome
                  ? "+"
                  : "-"
                }${formatPDFCurrency(
                  transaction.amount,
                )}`,
              ];
            },
          );

        autoTable(doc, {
          startY:
            transactionStartY +
            5,

          head: [
            [
              "Date",
              "Title",
              "Type",
              "Category",
              "Payment",
              "Amount",
            ],
          ],

          body:
            transactionRows.length
              ? transactionRows
              : [
                [
                  "No transactions",
                  "",
                  "",
                  "",
                  "",
                  "",
                ],
              ],

          theme: "striped",

          headStyles: {
            fillColor: [
              15,
              23,
              42,
            ],
            textColor: 255,
            fontStyle:
              "bold",
          },

          styles: {
            fontSize: 8,
            cellPadding: 3,
          },

          columnStyles: {
            0: {
              cellWidth: 28,
            },

            1: {
              cellWidth: 65,
            },

            2: {
              cellWidth: 35,
            },

            3: {
              cellWidth: 45,
            },

            4: {
              cellWidth: 40,
            },

            5: {
              cellWidth: 35,
              halign:
                "right",
            },
          },
        });

        // --------------------------------------------------
        // EXPENSES
        // --------------------------------------------------

        let expenseStartY =
          doc.lastAutoTable
            .finalY + 12;

        if (
          expenseStartY >
          pageHeight - 45
        ) {
          doc.addPage();

          expenseStartY = 18;
        }

        doc.setTextColor(
          15,
          23,
          42,
        );

        doc.setFontSize(14);

        doc.setFont(
          "helvetica",
          "bold",
        );

        doc.text(
          `Expense Records (${allExpenses.length})`,
          14,
          expenseStartY,
        );

        const expenseRows =
          allExpenses.map(
            (expense) => [
              formatDate(
                expense.expenseDate,
              ),

              expense.title ||
              "-",

              categoryLabel(
                expense.category,
              ),

              expense.paymentMethod ||
              "-",

              `-${formatPDFCurrency(
                expense.amount,
              )}`,
            ],
          );

        autoTable(doc, {
          startY:
            expenseStartY + 5,

          head: [
            [
              "Date",
              "Title",
              "Category",
              "Payment",
              "Amount",
            ],
          ],

          body:
            expenseRows.length
              ? expenseRows
              : [
                [
                  "No expenses",
                  "",
                  "",
                  "",
                  "",
                ],
              ],

          theme: "striped",

          headStyles: {
            fillColor: [
              15,
              23,
              42,
            ],
            textColor: 255,
            fontStyle:
              "bold",
          },

          styles: {
            fontSize: 8,
            cellPadding: 3,
          },

          columnStyles: {
            0: {
              cellWidth: 30,
            },

            1: {
              cellWidth: 75,
            },

            2: {
              cellWidth: 55,
            },

            3: {
              cellWidth: 45,
            },

            4: {
              cellWidth: 40,
              halign:
                "right",
            },
          },
        });

        // --------------------------------------------------
        // FOOTER
        // --------------------------------------------------

        const totalPages =
          doc.internal.getNumberOfPages();

        for (
          let page = 1;
          page <= totalPages;
          page++
        ) {
          doc.setPage(page);

          doc.setFontSize(8);

          doc.setFont(
            "helvetica",
            "normal",
          );

          doc.setTextColor(
            100,
            116,
            139,
          );

          doc.text(
            `Financial Report • ${getReportTypeLabel()} • Page ${page} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 8,
            {
              align: "center",
            },
          );
        }

        // --------------------------------------------------
        // SAVE PDF
        // --------------------------------------------------

        const fileDate =
          new Date()
            .toISOString()
            .split("T")[0];

        const safeReportName =
          getReportTypeLabel()
            .toLowerCase()
            .replace(
              /\s+/g,
              "-",
            );

        doc.save(
          `financial-report-${safeReportName}-${fileDate}.pdf`,
        );

        toast.success(
          "Financial PDF downloaded successfully",
        );
      } catch (error) {
        console.error(
          "Financial PDF error:",
          error,
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to generate financial PDF",
          ),
        );
      } finally {
        setDownloadingPDF(false);
      }
    };


    const filteredTransactions =
  transactionCategory === "all"
    ? transactions
    : transactions.filter(
        (transaction) =>
          transaction.category === transactionCategory
      );

  // ======================================================
  // RENDER
  // ======================================================



  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/dashboard",
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                mb-4
                px-3.5
                py-2
                rounded-lg
                bg-slate-900
                border
                border-slate-700
                text-slate-300
                hover:text-white
                hover:bg-slate-800
                transition
                text-sm
                font-semibold
              "
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Financial Dashboard
            </h1>

            <p className="mt-1.5 text-sm text-slate-400">
              Track income, expenses,
              costs and overall
              business profit.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              type="button"
              onClick={() =>
                setShowExpenseForm(
                  (prev) => !prev,
                )
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-lg
                bg-indigo-700
                hover:bg-indigo-600
                text-white
                text-sm
                font-semibold
                transition
              "
            >
              <span className="text-lg">
                +
              </span>

              Add Expense
            </button>

          </div>

        </div>

        {/* ==================================================
            PDF REPORT SELECTOR
        ================================================== */}

        <div
          className="
            mb-7
            bg-slate-900
            border
            border-indigo-500/30
            rounded-2xl
            p-5
            shadow-xl
          "
        >

          <div className="mb-4">

            <h2 className="text-lg font-bold text-white">
              Financial PDF Report
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Select a period and download
              only that period's financial
              data.
            </p>

          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-4
              items-end
            "
          >

            {/* REPORT TYPE */}

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Report Type
              </label>

              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(
                    e.target.value,
                  );

                  setReportDate("");
                  setReportWeek("");
                  setReportMonth("");
                  setReportStartDate("");
                  setReportEndDate("");
                }}
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  text-white
                  text-sm
                  outline-none
                  focus:border-indigo-500
                "
              >

                <option value="daily">
                  Daily
                </option>

                <option value="weekly">
                  Weekly
                </option>

                <option value="monthly">
                  Monthly
                </option>

                <option value="custom">
                  Custom Date Range
                </option>

              </select>

            </div>

            {/* DAILY */}

            {reportType ===
              "daily" && (
                <div>

                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Select Date
                  </label>

                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) =>
                      setReportDate(
                        e.target.value,
                      )
                    }
                    className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    text-sm
                    outline-none
                    focus:border-indigo-500
                  "
                  />

                </div>
              )}

            {/* WEEKLY */}

            {reportType ===
              "weekly" && (
                <div>

                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Select Week
                  </label>

                  <input
                    type="week"
                    value={reportWeek}
                    onChange={(e) =>
                      setReportWeek(
                        e.target.value,
                      )
                    }
                    className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    text-sm
                    outline-none
                    focus:border-indigo-500
                  "
                  />

                </div>
              )}

            {/* MONTHLY */}

            {reportType ===
              "monthly" && (
                <div>

                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Select Month
                  </label>

                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(e) =>
                      setReportMonth(
                        e.target.value,
                      )
                    }
                    className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    text-sm
                    outline-none
                    focus:border-indigo-500
                  "
                  />

                </div>
              )}

            {/* CUSTOM START */}

            {reportType ===
              "custom" && (
                <>
                  <div>

                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={
                        reportStartDate
                      }
                      onChange={(e) =>
                        setReportStartDate(
                          e.target.value,
                        )
                      }
                      className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-950
                      text-white
                      text-sm
                      outline-none
                      focus:border-indigo-500
                    "
                    />

                  </div>

                  <div>

                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={
                        reportEndDate
                      }
                      onChange={(e) =>
                        setReportEndDate(
                          e.target.value,
                        )
                      }
                      className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-950
                      text-white
                      text-sm
                      outline-none
                      focus:border-indigo-500
                    "
                    />

                  </div>
                </>
              )}

            {/* DOWNLOAD */}

            <div
              className={
                reportType ===
                  "custom"
                  ? "sm:col-span-2 lg:col-span-4"
                  : ""
              }
            >

              <button
                type="button"
                onClick={
                  downloadFinancialPDF
                }
                disabled={
                  downloadingPDF
                }
                className="
                  w-full
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-lg
                  bg-indigo-700
                  hover:bg-indigo-600
                  border
                  border-indigo-500
                  text-white
                  text-sm
                  font-semibold
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                <span className="text-base">
                  ↓
                </span>

                {downloadingPDF
                  ? "Generating..."
                  : "Download PDF"}

              </button>

            </div>

          </div>

        </div>

        {/* ==================================================
            EXPENSE FORM
        ================================================== */}

        {showExpenseForm && (
          <div
            className="
              mb-7
              bg-slate-900
              border
              border-slate-700
              rounded-2xl
              shadow-xl
              p-5
            "
          >

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-bold text-white">
                  Add New Expense
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Record a business expense.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowExpenseForm(
                    false,
                  )
                }
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-slate-800
                  hover:bg-slate-700
                  text-slate-400
                  hover:text-white
                  text-xl
                "
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCreateExpense
              }
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-4
              "
            >

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Expense Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    expenseForm.title
                  }
                  onChange={
                    handleExpenseChange
                  }
                  placeholder="e.g. Facebook Ads"
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    placeholder-slate-600
                    text-sm
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Category
                </label>

                <select
                  name="category"
                  value={
                    expenseForm.category
                  }
                  onChange={
                    handleExpenseChange
                  }
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    text-sm
                  "
                >

                  <option value="product_purchase">
                    Product Purchase
                  </option>

                  <option value="shipping">
                    Shipping
                  </option>

                  <option value="marketing">
                    Marketing
                  </option>

                  <option value="salary">
                    Salary
                  </option>

                  <option value="hosting">
                    Hosting
                  </option>

                  <option value="domain">
                    Domain
                  </option>

                  <option value="packaging">
                    Packaging
                  </option>

                  <option value="maintenance">
                    Maintenance
                  </option>

                  <option value="office">
                    Office
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={
                    expenseForm.amount
                  }
                  onChange={
                    handleExpenseChange
                  }
                  placeholder="0"
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    text-sm
                  "
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={
                    expenseForm.paymentMethod
                  }
                  onChange={
                    handleExpenseChange
                  }
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    text-sm
                  "
                >

                  <option value="cash">
                    Cash
                  </option>

                  <option value="bkash">
                    bKash
                  </option>

                  <option value="nagad">
                    Nagad
                  </option>

                  <option value="rocket">
                    Rocket
                  </option>

                  <option value="card">
                    Card
                  </option>

                  <option value="bank">
                    Bank
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Expense Date
                </label>

                <input
                  type="date"
                  name="expenseDate"
                  value={
                    expenseForm.expenseDate
                  }
                  onChange={
                    handleExpenseChange
                  }
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    text-sm
                  "
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={
                    expenseForm.description
                  }
                  onChange={
                    handleExpenseChange
                  }
                  placeholder="Optional"
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    text-white
                    placeholder-slate-600
                    text-sm
                  "
                />

              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowExpenseForm(
                      false,
                    )
                  }
                  className="
                    px-4
                    py-2.5
                    rounded-lg
                    border
                    border-slate-700
                    text-sm
                    font-semibold
                    text-slate-300
                    hover:bg-slate-800
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingExpense
                  }
                  className="
                    px-5
                    py-2.5
                    rounded-lg
                    bg-indigo-700
                    hover:bg-indigo-600
                    text-white
                    text-sm
                    font-semibold
                    disabled:opacity-50
                  "
                >
                  {creatingExpense
                    ? "Saving..."
                    : "Save Expense"}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* ==================================================
            NORMAL FILTERS
        ================================================== */}

        <div
          className="
            mb-7
            bg-slate-900
            border
            border-slate-700
            rounded-2xl
            p-4
          "
        >

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-6
              gap-3
            "
          >

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-1">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value,
                  )
                }
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  text-white
                  text-sm
                "
              />

            </div>

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-1">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value,
                  )
                }
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  text-white
                  text-sm
                "
              />

            </div>

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-1">
                Transaction Type
              </label>

              <select
                value={transactionType}
                onChange={(e) =>
                  setTransactionType(
                    e.target.value,
                  )
                }
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  text-white
                  text-sm
                "
              >

                <option value="">
                  All Types
                </option>

                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expense
                </option>

                <option value="product_cost">
                  Product Cost
                </option>

                <option value="refund">
                  Refund
                </option>

                <option value="payment_fee">
                  Payment Fee
                </option>

                <option value="shipping">
                  Shipping
                </option>

              </select>

            </div>

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-1">
                Transaction Category
              </label>

              <input
                type="text"
                value={
                  transactionCategory
                }
                onChange={(e) =>
                  setTransactionCategory(
                    e.target.value,
                  )
                }
                placeholder="e.g. marketing"
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  text-white
                  placeholder-slate-600
                  text-sm
                "
              />

            </div>

            <div>

              <label className="block text-xs font-medium text-slate-400 mb-1">
                Expense Category
              </label>

              <select
                value={
                  expenseCategory
                }
                onChange={(e) =>
                  setExpenseCategory(
                    e.target.value,
                  )
                }
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  text-white
                  text-sm
                "
              >

                <option value="">
                  All Expenses
                </option>

                <option value="product_purchase">
                  Product Purchase
                </option>

                <option value="shipping">
                  Shipping
                </option>

                <option value="marketing">
                  Marketing
                </option>

                <option value="salary">
                  Salary
                </option>

                <option value="hosting">
                  Hosting
                </option>

                <option value="domain">
                  Domain
                </option>

                <option value="packaging">
                  Packaging
                </option>

                <option value="maintenance">
                  Maintenance
                </option>

                <option value="office">
                  Office
                </option>

                <option value="other">
                  Other
                </option>

              </select>

            </div>

            <div className="flex items-end gap-2">

              <button
                type="button"
                onClick={
                  applyFilters
                }
                className="
                  flex-1
                  px-3
                  py-2.5
                  rounded-lg
                  bg-indigo-700
                  hover:bg-indigo-600
                  text-white
                  text-sm
                  font-semibold
                "
              >
                Apply
              </button>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  text-slate-300
                  hover:bg-slate-800
                  text-sm
                  font-semibold
                "
              >
                Clear
              </button>

            </div>

          </div>

        </div>

        {/* ==================================================
            KPI CARDS
        ================================================== */}

        {loadingDashboard ? (
          <div
            className="
              grid
              grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-6
              gap-4
              mb-7
            "
          >

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-32
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-2xl
                    animate-pulse
                  "
                />
              ),
            )}

          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-6
              gap-4
              mb-7
            "
          >

            {cards.map(
              (card) => (
                <div
                  key={
                    card.title
                  }
                  className={`
                    border
                    rounded-2xl
                    p-4
                    shadow-lg
                    ${card.className}
                  `}
                >

                  <div className="flex items-center justify-between">

                    <p className="text-xs font-semibold text-white">
                      {
                        card.title
                      }
                    </p>

                    <span className="text-lg font-bold opacity-80">
                      {
                        card.icon
                      }
                    </span>

                  </div>

                  <p
                    className={`
                      mt-3
                      text-lg
                      sm:text-xl
                      font-bold
                      ${card.valueClass}
                    `}
                  >
                    {card.isCurrency ===
                      false
                      ? card.value
                      : formatCurrency(
                        card.value,
                      )}
                  </p>

                </div>
              ),
            )}

          </div>
        )}

        {/* ==================================================
            SECONDARY SUMMARY
        ================================================== */}

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-4
            mb-7
          "
        >

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">

            <p className="text-xs text-slate-400">
              Refunds
            </p>

            <p className="mt-2 font-bold text-white">
              {formatCurrency(
                dashboard.totalRefund,
              )}
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">

            <p className="text-xs text-slate-400">
              Payment Fees
            </p>

            <p className="mt-2 font-bold text-white">
              {formatCurrency(
                dashboard.totalPaymentFee,
              )}
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">

            <p className="text-xs text-slate-400">
              Shipping Cost
            </p>

            <p className="mt-2 font-bold text-white">
              {formatCurrency(
                dashboard.totalShipping,
              )}
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">

            <p className="text-xs text-slate-400">
              Profit Status
            </p>

            <p
              className={`
                mt-2
                font-bold
                ${profitPositive
                  ? "text-emerald-400"
                  : "text-red-400"
                }
              `}
            >
              {profitPositive
                ? "Profitable"
                : "Loss"}
            </p>

          </div>

        </div>

        {/* ==================================================
            MONTHLY FINANCIAL CHART
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
            mb-7
          "
        >

          <div className="mb-5">

            <h2 className="text-lg font-bold text-white">
              Monthly Financial Overview
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Compare monthly revenue, total expense + product cost, and net profit.
            </p>

          </div>

          {loadingChart ? (
            <div className="h-[350px] flex items-center justify-center text-slate-500">
              Loading financial analytics...
            </div>
          ) : (
            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    monthlyFinancialData
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#0f172a",
                      border:
                        "1px solid #334155",
                      borderRadius:
                        "10px",
                      color: "#fff",
                    }}
                    formatter={(
                      value,
                    ) =>
                      formatCurrency(
                        value,
                      )
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10b981"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="expense"
                    name="Total Expense + Product Cost"
                    fill="#ef4444"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="profit"
                    name="Profit"
                    fill="#6366f1"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>
          )}

        </div>

        {/* ==================================================
            TRANSACTIONS
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            shadow-xl
            mb-7
            overflow-hidden
          "
        >

          <div
            className="
              px-5
              py-4
              border-b
              border-slate-800
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-2
            "
          >

            <div>

              <h2 className="text-lg font-bold text-white">
                Financial Transactions
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Income and expense transaction history.
              </p>

            </div>

            <div className="mt-4">
  <select
    value={transactionCategory}
    onChange={(e) =>
      setTransactionCategory(e.target.value)
    }
    className="
      bg-slate-900
      border border-slate-700
      text-white
      text-sm
      rounded-lg
      px-3
      py-2
      outline-none
      focus:border-indigo-500
    "
  >
    <option value="all">
      All Categories
    </option>

    <option value="sales">
      Sales
    </option>

    <option value="marketing">
      Marketing
    </option>

    <option value="shipping">
      Shipping
    </option>

    <option value="product-cost">
      Product Cost
    </option>
  </select>
</div>

            <span className="text-xs text-slate-400">
              {
                transactionPagination.total ||
                0
              }{" "}
              transactions
            </span>

          </div>

          <div className="h-[450px] overflow-y-auto overflow-x-auto">

            <table className="min-w-[900px] w-full">

              <thead className="bg-slate-950">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Date
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Title
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Type
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Category
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Payment
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {loadingTransactions ? (
                  <tr>

                    <td
                      colSpan="6"
                      className="
                        px-5
                        py-12
                        text-center
                        text-sm
                        text-slate-500
                      "
                    >
                      Loading transactions...
                    </td>

                  </tr>
                ) : transactions.length ===
                  0 ? (
                  <tr>

                    <td
                      colSpan="6"
                      className="
                        px-5
                        py-12
                        text-center
                        text-sm
                        text-slate-500
                      "
                    >
                      No financial
                      transactions
                      found.
                    </td>

                  </tr>
                ) : (
                  filteredTransactions.map(
                    (
                      transaction,
                    ) => (
                      <tr
                        key={
                          transaction._id
                        }
                        className="hover:bg-slate-800/40 transition"
                      >

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {formatDate(
                            transaction.transactionDate,
                          )}
                        </td>

                        <td className="px-5 py-3">

                          <p className="text-sm font-semibold text-white">
                            {
                              transaction.title
                            }
                          </p>

                          {transaction.description && (
                            <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                              {
                                transaction.description
                              }
                            </p>
                          )}

                        </td>

                        <td className="px-5 py-3">

                          <span
                            className={`
                              inline-flex
                              px-2.5
                              py-1
                              rounded-full
                              text-[11px]
                              font-semibold
                              ${getTransactionStyle(
                              transaction.type,
                            )}
                            `}
                          >
                            {transactionTypeLabel(
                              transaction.type,
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {categoryLabel(
                            transaction.category,
                          )}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-300 capitalize">
                          {
                            transaction.paymentMethod ||
                            "-"
                          }
                        </td>

                        <td className="px-5 py-3 text-right">

                          <span
                            className={`
                              font-bold
                              ${transaction.type ===
                                "income"
                                ? "text-emerald-400"
                                : "text-red-400"
                              }
                            `}
                          >

                            {transaction.type ===
                              "income"
                              ? "+"
                              : "-"}

                            {formatCurrency(
                              transaction.amount,
                            )}

                          </span>

                        </td>

                      </tr>
                    ),
                  )
                )}

              </tbody>

            </table>

          </div>

          {transactionPagination.totalPages >
            1 && (
              <div
                className="
                px-5
                py-4
                border-t
                border-slate-800
                flex
                items-center
                justify-between
              "
              >

                <button
                  type="button"
                  disabled={
                    transactionPagination.page <=
                    1
                  }
                  onClick={() =>
                    fetchTransactions(
                      transactionPagination.page -
                      1,
                    )
                  }
                  className="
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-slate-700
                  text-sm
                  text-slate-300
                  hover:bg-slate-800
                  disabled:opacity-40
                "
                >
                  Previous
                </button>

                <span className="text-xs text-slate-400">
                  Page{" "}
                  {
                    transactionPagination.page
                  }{" "}
                  of{" "}
                  {
                    transactionPagination.totalPages
                  }
                </span>

                <button
                  type="button"
                  disabled={
                    transactionPagination.page >=
                    transactionPagination.totalPages
                  }
                  onClick={() =>
                    fetchTransactions(
                      transactionPagination.page +
                      1,
                    )
                  }
                  className="
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-slate-700
                  text-sm
                  text-slate-300
                  hover:bg-slate-800
                  disabled:opacity-40
                "
                >
                  Next
                </button>

              </div>
            )}

        </div>

        {/* ==================================================
            EXPENSES
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            shadow-xl
            overflow-hidden
          "
        >

          <div
            className="
              px-5
              py-4
              border-b
              border-slate-800
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-2
            "
          >

            <div>

              <h2 className="text-lg font-bold text-white">
                Expense Records
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Business expenses
                recorded by admin.
              </p>

            </div>

            <span className="text-xs text-slate-400">
              {
                expensePagination.total ||
                0
              }{" "}
              expenses
            </span>

          </div>

          <div className="h-[450px] overflow-y-auto overflow-x-auto">

            <table className="min-w-[900px] w-full">

              <thead className="bg-slate-950">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Date
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Title
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Category
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">
                    Payment
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {loadingExpenses ? (
                  <tr>

                    <td
                      colSpan="5"
                      className="
                        px-5
                        py-12
                        text-center
                        text-sm
                        text-slate-500
                      "
                    >
                      Loading expenses...
                    </td>

                  </tr>
                ) : expenses.length ===
                  0 ? (
                  <tr>

                    <td
                      colSpan="5"
                      className="
                        px-5
                        py-12
                        text-center
                        text-sm
                        text-slate-500
                      "
                    >
                      No expenses found.
                    </td>

                  </tr>
                ) : (
                  expenses.map(
                    (expense) => (
                      <tr
                        key={
                          expense._id
                        }
                        className="hover:bg-slate-800/40 transition"
                      >

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {formatDate(
                            expense.expenseDate,
                          )}
                        </td>

                        <td className="px-5 py-3">

                          <p className="text-sm font-semibold text-white">
                            {
                              expense.title
                            }
                          </p>

                          {expense.description && (
                            <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                              {
                                expense.description
                              }
                            </p>
                          )}

                        </td>

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {categoryLabel(
                            expense.category,
                          )}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-300 capitalize">
                          {
                            expense.paymentMethod ||
                            "-"
                          }
                        </td>

                        <td className="px-5 py-3 text-right font-bold text-red-400">
                          -
                          {formatCurrency(
                            expense.amount,
                          )}
                        </td>

                      </tr>
                    ),
                  )
                )}

              </tbody>

            </table>

          </div>

          {expensePagination.totalPages >
            1 && (
              <div
                className="
                px-5
                py-4
                border-t
                border-slate-800
                flex
                items-center
                justify-between
              "
              >

                <button
                  type="button"
                  disabled={
                    expensePagination.page <=
                    1
                  }
                  onClick={() =>
                    fetchExpenses(
                      expensePagination.page -
                      1,
                    )
                  }
                  className="
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-slate-700
                  text-sm
                  text-slate-300
                  hover:bg-slate-800
                  disabled:opacity-40
                "
                >
                  Previous
                </button>

                <span className="text-xs text-slate-400">
                  Page{" "}
                  {
                    expensePagination.page
                  }{" "}
                  of{" "}
                  {
                    expensePagination.totalPages
                  }
                </span>

                <button
                  type="button"
                  disabled={
                    expensePagination.page >=
                    expensePagination.totalPages
                  }
                  onClick={() =>
                    fetchExpenses(
                      expensePagination.page +
                      1,
                    )
                  }
                  className="
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-slate-700
                  text-sm
                  text-slate-300
                  hover:bg-slate-800
                  disabled:opacity-40
                "
                >
                  Next
                </button>

              </div>
            )}

        </div>

      </div>
    </div>
  );
}