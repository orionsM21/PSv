import apiClient from "../../../../common/hooks/apiClient";
import { BASE_URL } from "../../service/api";

export const getPaymentHistory = async (loanNo, token) => {
  return apiClient.get(`${BASE_URL}getAllPaymentByLoanAccountNumber/${loanNo}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const submitPayment = async (payload, token) => {
  return apiClient.post(`${BASE_URL}submitPayment`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updatePayment = async (payload, token) => {
  return apiClient.put(`${BASE_URL}updatePayment`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
