"use client";

import { useMemo, useState } from "react";

export interface AdminPaymentRow {
  id: string;
  reference: string;
  amount: number;
  status: "paid" | "pending" | "processing" | "failed";
  method: string;
  date: string;
  invoice?: string;
}

// TODO: substituir por endpoint real quando disponível
const MOCK_PAYMENTS: AdminPaymentRow[] = [
  {
    id: "1",
    reference: "PAY-2023-001",
    amount: 1250.0,
    status: "paid",
    method: "Banco do Brasil",
    date: "15/04/2023",
    invoice: "INV-2023-001",
  },
  {
    id: "2",
    reference: "PAY-2023-002",
    amount: 980.5,
    status: "paid",
    method: "PayPal",
    date: "01/04/2023",
    invoice: "INV-2023-002",
  },
  {
    id: "3",
    reference: "PAY-2023-003",
    amount: 1850.0,
    status: "pending",
    method: "Pix",
    date: "15/05/2023",
  },
  {
    id: "4",
    reference: "PAY-2023-004",
    amount: 2150.0,
    status: "processing",
    method: "Banco do Brasil",
    date: "15/05/2023",
  },
  {
    id: "5",
    reference: "PAY-2023-005",
    amount: 750.0,
    status: "failed",
    method: "PayPal",
    date: "01/03/2023",
  },
  {
    id: "6",
    reference: "PAY-2023-006",
    amount: 1500.0,
    status: "paid",
    method: "Pix",
    date: "15/03/2023",
    invoice: "INV-2023-003",
  },
  {
    id: "7",
    reference: "PAY-2023-007",
    amount: 2300.0,
    status: "paid",
    method: "Banco do Brasil",
    date: "01/03/2023",
    invoice: "INV-2023-004",
  },
];

export function useAdminPaymentsTable(searchQuery = "") {
  const [loading] = useState(false);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();
    return MOCK_PAYMENTS.filter(
      (payment) =>
        payment.reference.toLowerCase().includes(normalizedSearch) ||
        payment.method.toLowerCase().includes(normalizedSearch),
    );
  }, [searchQuery]);

  return { filteredPayments, loading };
}
