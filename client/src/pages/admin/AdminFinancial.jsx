// File Path: frontend/src/pages/admin/AdminFinancial.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../services/api";
import toast from "react-hot-toast";

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

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [loadingTransactions, setLoadingTransactions] =
    useState(true);

  const [loadingExpenses, setLoadingExpenses] =
    useState(true);

  const [downloadingPDF, setDownloadingPDF] =
    useState(false);

  // ======================================================
  // FILTER STATE
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
        setDashboard(defaultDashboard);
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

      setDashboard(defaultDashboard);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // ======================================================
  // FETCH TRANSACTIONS
  // ======================================================

  const fetchTransactions = async (page = 1) => {
    try {
      setLoadingTransactions(true);

      const params = {
        page,
        limit: 20,
      };

      if (transactionType) {
        params.type = transactionType;
      }

      if (transactionCategory) {
        params.category = transactionCategory;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const { data } = await API.get(
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
          ...(data.pagination || {}),
        });
      } else {
        setTransactions([]);
        setTransactionPagination(defaultPagination);
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
      setTransactionPagination(defaultPagination);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // ======================================================
  // FETCH EXPENSES
  // ======================================================

  const fetchExpenses = async (page = 1) => {
    try {
      setLoadingExpenses(true);

      const params = {
        page,
        limit: 20,
      };

      if (expenseCategory) {
        params.category = expenseCategory;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const { data } = await API.get(
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
          ...(data.pagination || {}),
        });
      } else {
        setExpenses([]);
        setExpensePagination(defaultPagination);
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
      setExpensePagination(defaultPagination);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchDashboard();
    fetchTransactions(1);
    fetchExpenses(1);
  }, []);

  // ======================================================
  // APPLY FILTERS
  // ======================================================

  const applyFilters = async () => {
    if (
      startDate &&
      endDate &&
      new Date(startDate) > new Date(endDate)
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
        API.get("/financial/dashboard"),

        API.get("/financial/transactions", {
          params: {
            page: 1,
            limit: 20,
          },
        }),

        API.get("/financial/expenses", {
          params: {
            page: 1,
            limit: 20,
          },
        }),
      ]);

      if (dashboardResponse.data?.success) {
        setDashboard({
          ...defaultDashboard,
          ...(dashboardResponse.data.data || {}),
        });
      }

      if (transactionResponse.data?.success) {
        setTransactions(
          Array.isArray(
            transactionResponse.data.data,
          )
            ? transactionResponse.data.data
            : [],
        );

        setTransactionPagination({
          ...defaultPagination,
          ...(transactionResponse.data.pagination ||
            {}),
        });
      }

      if (expenseResponse.data?.success) {
        setExpenses(
          Array.isArray(
            expenseResponse.data.data,
          )
            ? expenseResponse.data.data
            : [],
        );

        setExpensePagination({
          ...defaultPagination,
          ...(expenseResponse.data.pagination ||
            {}),
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
      setLoadingTransactions(false);
      setLoadingExpenses(false);
    }
  };

  // ======================================================
  // EXPENSE FORM CHANGE
  // ======================================================

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;

    setExpenseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // CREATE EXPENSE
  // ======================================================

  const handleCreateExpense = async (e) => {
    e.preventDefault();

    const title = expenseForm.title.trim();
    const amount = Number(expenseForm.amount);

    if (!title) {
      toast.error("Expense title is required");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid expense amount");
      return;
    }

    try {
      setCreatingExpense(true);

      const payload = {
        title,

        category: expenseForm.category,

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

      const { data } = await API.post(
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

  const transactionTypeLabel = (type) => {
    const labels = {
      income: "Income",
      expense: "Expense",
      product_cost: "Product Cost",
      refund: "Refund",
      payment_fee: "Payment Fee",
      shipping: "Shipping",
    };
    return labels[type] || type || "Unknown";
  };

  // ======================================================
  // CATEGORY LABEL
  // ======================================================

  const categoryLabel = (category) => {
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

  const getTransactionStyle = (type) => {
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
    Number(dashboard.netProfit || 0) >= 0;

  // ======================================================
  // KPI CARDS
  // ======================================================

  const cards = useMemo(
    () => [
      {
        title: "Total Income",
        value: dashboard.totalIncome,
        icon: "↗",
        className:
          "bg-emerald-950/50 border-emerald-800/60",
        valueClass: "text-emerald-400",
      },

      {
        title: "Total Expense",
        value: dashboard.totalExpense,
        icon: "↘",
        className:
          "bg-red-950/50 border-red-800/60",
        valueClass: "text-red-400",
      },

      {
        title: "Total Costs",
        value: dashboard.totalCosts,
        icon: "−",
        className:
          "bg-orange-950/50 border-orange-800/60",
        valueClass: "text-orange-400",
      },

      {
        title: "Net Profit",
        value: dashboard.netProfit,
        icon: profitPositive ? "✓" : "!",
        className: profitPositive
          ? "bg-indigo-950/60 border-indigo-800/60"
          : "bg-red-950/60 border-red-800/60",

        valueClass: profitPositive
          ? "text-indigo-400"
          : "text-red-400",
      },

      {
        title: "Profit Margin",
        value: `${Number(
          dashboard.profitMargin || 0,
        ).toFixed(2)}%`,
        icon: "%",
        className:
          "bg-blue-950/50 border-blue-800/60",
        valueClass: "text-blue-400",
        isCurrency: false,
      },

      {
        title: "Transactions",
        value: dashboard.transactionCount,
        icon: "#",
        className:
          "bg-purple-950/50 border-purple-800/60",
        valueClass: "text-purple-400",
        isCurrency: false,
      },
    ],
    [dashboard, profitPositive],
  );

  // ======================================================
  // DOWNLOAD PDF
  // ======================================================

  const downloadFinancialPDF = async () => {
    try {
      setDownloadingPDF(true);

      /*
       * =====================================================
       * FETCH ALL FILTERED TRANSACTIONS + EXPENSES
       * =====================================================
       *
       * Current table only loads 20 records.
       * For PDF we fetch all records matching the current filters.
       */

      const transactionParams = {
        page: 1,
        limit: 100000,
      };

      const expenseParams = {
        page: 1,
        limit: 100000,
      };

      // Transaction filters
      if (transactionType) {
        transactionParams.type = transactionType;
      }

      if (transactionCategory) {
        transactionParams.category = transactionCategory;
      }

      // Expense filters
      if (expenseCategory) {
        expenseParams.category = expenseCategory;
      }

      // Date filters
      if (startDate) {
        transactionParams.startDate = startDate;
        expenseParams.startDate = startDate;
      }

      if (endDate) {
        transactionParams.endDate = endDate;
        expenseParams.endDate = endDate;
      }

      const [
        transactionResponse,
        expenseResponse,
      ] = await Promise.all([
        API.get("/financial/transactions", {
          params: transactionParams,
        }),

        API.get("/financial/expenses", {
          params: expenseParams,
        }),
      ]);

      const allTransactions =
        transactionResponse.data?.success &&
          Array.isArray(transactionResponse.data?.data)
          ? transactionResponse.data.data
          : [];

      const allExpenses =
        expenseResponse.data?.success &&
          Array.isArray(expenseResponse.data?.data)
          ? expenseResponse.data.data
          : [];

      // =====================================================
      // CREATE PDF
      // =====================================================

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      // =====================================================
      // HEADER
      // =====================================================

      doc.setFillColor(15, 23, 42);

      doc.rect(
        0,
        0,
        pageWidth,
        32,
        "F",
      );

      doc.setTextColor(255, 255, 255);

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");

      doc.text(
        "FINANCIAL REPORT",
        14,
        14,
      );

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      doc.text(
        "Business Financial Overview",
        14,
        21,
      );

      const dateRange =
        startDate || endDate
          ? `${startDate || "Start"} → ${endDate || "Today"
          }`
          : "All Time";

      doc.text(
        `Period: ${dateRange}`,
        pageWidth - 14,
        14,
        {
          align: "right",
        },
      );

      doc.text(
        `Generated: ${new Date().toLocaleDateString(
          "en-BD",
        )}`,
        pageWidth - 14,
        21,
        {
          align: "right",
        },
      );

      // =====================================================
      // SUMMARY
      // =====================================================

      autoTable(doc, {
        startY: 40,

        head: [
          [
            "Financial Summary",
            "Amount",
          ],
        ],

        body: [
          [
            "Total Income",
            formatPDFCurrency(
              dashboard.totalIncome,
            ),
          ],

          [
            "Total Expense",
            formatPDFCurrency(
              dashboard.totalExpense,
            ),
          ],

          [
            "Total Refund",
            formatPDFCurrency(
              dashboard.totalRefund,
            ),
          ],

          [
            "Payment Fees",
            formatPDFCurrency(
              dashboard.totalPaymentFee,
            ),
          ],

          [
            "Shipping Cost",
            formatPDFCurrency(
              dashboard.totalShipping,
            ),
          ],

          [
            "Total Costs",
            formatPDFCurrency(
              dashboard.totalCosts,
            ),
          ],

          [
            "Net Profit",
            formatPDFCurrency(
              dashboard.netProfit,
            ),
          ],

          [
            "Profit Margin",
            `${Number(
              dashboard.profitMargin || 0,
            ).toFixed(2)}%`,
          ],

          [
            "Transactions",
            String(
              dashboard.transactionCount || 0,
            ),
          ],
        ],

        theme: "grid",

        headStyles: {
          fillColor: [30, 41, 59],
          textColor: 255,
          fontStyle: "bold",
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
            cellWidth: 70,
            halign: "right",
          },
        },
      });

      // =====================================================
      // TRANSACTIONS
      // =====================================================

      let transactionStartY =
        doc.lastAutoTable.finalY + 12;

      if (
        transactionStartY >
        pageHeight - 40
      ) {
        doc.addPage();

        transactionStartY = 18;
      }

      doc.setTextColor(15, 23, 42);

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
          (transaction) => {
            const isIncome =
              transaction.type === "income";

            return [
              formatDate(
                transaction.transactionDate,
              ),

              transaction.title || "-",

              transactionTypeLabel(
                transaction.type,
              ),

              categoryLabel(
                transaction.category,
              ),

              transaction.paymentMethod ||
              "-",

              `${isIncome ? "+" : "-"}${formatPDFCurrency(
                transaction.amount,
              )}`,
            ];
          },
        );

      autoTable(doc, {
        startY:
          transactionStartY + 5,

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
          fillColor: [15, 23, 42],
          textColor: 255,
          fontStyle: "bold",
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
            halign: "right",
          },
        },

        didDrawPage: () => {
          // Prevent table from touching footer
        },
      });

      // =====================================================
      // EXPENSES
      // =====================================================

      let expenseStartY =
        doc.lastAutoTable.finalY + 12;

      if (
        expenseStartY >
        pageHeight - 45
      ) {
        doc.addPage();

        expenseStartY = 18;
      }

      doc.setTextColor(15, 23, 42);

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

            expense.title || "-",

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
          fillColor: [15, 23, 42],
          textColor: 255,
          fontStyle: "bold",
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
            halign: "right",
          },
        },
      });

      // =====================================================
      // FOOTER ON EVERY PAGE
      // =====================================================

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
          `Financial Report • Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          {
            align: "center",
          },
        );
      }

      // =====================================================
      // SAVE FILE
      // =====================================================

      const fileDate =
        new Date()
          .toISOString()
          .split("T")[0];

      const filterName =
        startDate || endDate
          ? "filtered"
          : "all-time";

      doc.save(
        `financial-report-${filterName}-${fileDate}.pdf`,
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
            {/* BACK BUTTON */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/dashboard")
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
              Track income, expenses, costs and overall
              business profit.
            </p>
          </div>

          {/* HEADER BUTTONS */}

          <div className="flex flex-wrap items-center gap-2">

            {/* PDF BUTTON */}

            <button
              type="button"
              onClick={downloadFinancialPDF}
              disabled={downloadingPDF}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-lg
                bg-slate-800
                hover:bg-slate-700
                border
                border-slate-600
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

            {/* ADD EXPENSE */}

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
                shadow-lg
                shadow-indigo-950/30
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
              shadow-black/20
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
                  setShowExpenseForm(false)
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
                  transition
                "
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateExpense}
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-4
              "
            >

              {/* TITLE */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Expense Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={expenseForm.title}
                  onChange={handleExpenseChange}
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
                    focus:ring-2
                    focus:ring-indigo-500/20
                  "
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Category
                </label>

                <select
                  name="category"
                  value={expenseForm.category}
                  onChange={handleExpenseChange}
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

              {/* AMOUNT */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={handleExpenseChange}
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
                    placeholder-slate-600
                    text-sm
                    outline-none
                    focus:border-indigo-500
                  "
                />
              </div>

              {/* PAYMENT METHOD */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={expenseForm.paymentMethod}
                  onChange={handleExpenseChange}
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

              {/* DATE */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Expense Date
                </label>

                <input
                  type="date"
                  name="expenseDate"
                  value={expenseForm.expenseDate}
                  onChange={handleExpenseChange}
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

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={expenseForm.description}
                  onChange={handleExpenseChange}
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
                    outline-none
                    focus:border-indigo-500
                  "
                />
              </div>

              {/* BUTTONS */}

              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowExpenseForm(false)
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
                    hover:text-white
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingExpense}
                  className="
                    px-5
                    py-2.5
                    rounded-lg
                    bg-indigo-700
                    hover:bg-indigo-600
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-white
                    text-sm
                    font-semibold
                    transition
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
            FILTERS
        ================================================== */}

        <div
          className="
            mb-7
            bg-slate-900
            border
            border-slate-700
            rounded-2xl
            p-4
            shadow-xl
            shadow-black/10
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

            {/* START DATE */}

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
                  outline-none
                  focus:border-indigo-500
                "
              />
            </div>

            {/* END DATE */}

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
                  outline-none
                  focus:border-indigo-500
                "
              />
            </div>

            {/* TRANSACTION TYPE */}

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
                  outline-none
                  focus:border-indigo-500
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

            {/* TRANSACTION CATEGORY */}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Transaction Category
              </label>

              <input
                type="text"
                value={transactionCategory}
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
                  outline-none
                  focus:border-indigo-500
                "
              />
            </div>

            {/* EXPENSE CATEGORY */}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Expense Category
              </label>

              <select
                value={expenseCategory}
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
                  outline-none
                  focus:border-indigo-500
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

            {/* FILTER BUTTONS */}

            <div className="flex items-end gap-2">

              <button
                type="button"
                onClick={applyFilters}
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
                  transition
                "
              >
                Apply
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="
                  px-3
                  py-2.5
                  rounded-lg
                  border
                  border-slate-700
                  text-slate-300
                  hover:bg-slate-800
                  hover:text-white
                  text-sm
                  font-semibold
                  transition
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
            {cards.map((card) => (
              <div
                key={card.title}
                className={`
                  border
                  rounded-2xl
                  p-4
                  shadow-lg
                  shadow-black/10
                  ${card.className}
                `}
              >
                <div className="flex items-center justify-between">

                  <p className="text-xs font-semibold text-slate-400">
                    {card.title}
                  </p>

                  <span className="text-lg font-bold opacity-80">
                    {card.icon}
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
                  {card.isCurrency === false
                    ? card.value
                    : formatCurrency(
                      card.value,
                    )}
                </p>
              </div>
            ))}
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

          {/* REFUNDS */}

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

          {/* PAYMENT FEES */}

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

          {/* SHIPPING */}

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

          {/* PROFIT STATUS */}

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
            TRANSACTIONS
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            shadow-xl
            shadow-black/10
            mb-7
            overflow-hidden
          "
        >

          {/* HEADER */}

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

            <span className="text-xs text-slate-400">
              {transactionPagination.total ||
                0}{" "}
              transactions
            </span>
          </div>

          {/* TABLE */}

          <div className="max-h-[600px] overflow-auto">

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
                ) : transactions.length === 0 ? (
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
                      No financial transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map(
                    (transaction) => (
                      <tr
                        key={
                          transaction._id
                        }
                        className="
                          hover:bg-slate-800/40
                          transition
                        "
                      >

                        {/* DATE */}

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {formatDate(
                            transaction.transactionDate,
                          )}
                        </td>

                        {/* TITLE */}

                        <td className="px-5 py-3">

                          <p className="text-sm font-semibold text-white">
                            {transaction.title ||
                              "-"}
                          </p>

                          {transaction.description && (
                            <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                              {
                                transaction.description
                              }
                            </p>
                          )}

                        </td>

                        {/* TYPE */}

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

                        {/* CATEGORY */}

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {categoryLabel(
                            transaction.category,
                          )}
                        </td>

                        {/* PAYMENT */}

                        <td className="px-5 py-3 text-sm text-slate-300 capitalize">
                          {transaction.paymentMethod ||
                            "-"}
                        </td>

                        {/* AMOUNT */}

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

          {/* PAGINATION */}

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
                  disabled:cursor-not-allowed
                "
                >
                  Previous
                </button>

                <span className="text-xs text-slate-400">
                  Page{" "}
                  {transactionPagination.page}{" "}
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
                  disabled:cursor-not-allowed
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
            shadow-black/10
            overflow-hidden
          "
        >

          {/* HEADER */}

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
                Business expenses recorded by admin.
              </p>

            </div>

            <span className="text-xs text-slate-400">
              {expensePagination.total ||
                0}{" "}
              expenses
            </span>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

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
                ) : expenses.length === 0 ? (
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
                        key={expense._id}
                        className="
                          hover:bg-slate-800/40
                          transition
                        "
                      >

                        {/* DATE */}

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {formatDate(
                            expense.expenseDate,
                          )}
                        </td>

                        {/* TITLE */}

                        <td className="px-5 py-3">

                          <p className="text-sm font-semibold text-white">
                            {expense.title ||
                              "-"}
                          </p>

                          {expense.description && (
                            <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                              {
                                expense.description
                              }
                            </p>
                          )}

                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-3 text-sm text-slate-300">
                          {categoryLabel(
                            expense.category,
                          )}
                        </td>

                        {/* PAYMENT */}

                        <td className="px-5 py-3 text-sm text-slate-300 capitalize">
                          {expense.paymentMethod ||
                            "-"}
                        </td>

                        {/* AMOUNT */}

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

          {/* PAGINATION */}

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
                  disabled:cursor-not-allowed
                "
                >
                  Previous
                </button>

                <span className="text-xs text-slate-400">
                  Page{" "}
                  {expensePagination.page}{" "}
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
                  disabled:cursor-not-allowed
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