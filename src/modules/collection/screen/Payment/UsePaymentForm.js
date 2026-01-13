// UsePaymentForm.js
import { useCallback, useRef, useState } from "react";
import * as Yup from "yup";

// ---------------------------
// Yup Validation Schema
// ---------------------------
export const paymentSchema = Yup.object().shape({
  type: Yup.number().required("Please select payment type"),
  mode: Yup.number().required("Payment mode required"),
  amount: Yup.string()
    .required("Amount is required")
    .test("valid-amount", "Amount must be greater than 0", (val) => {
      // treat empty string or non-number as invalid
      const n = Number(val);
      return !Number.isNaN(n) && n > 0;
    }),
  collectionMode: Yup.number().required("Select collection mode"),
  mobile: Yup.string()
    .required("Mobile number required")
    .min(10, "Enter valid mobile number")
    .max(10, "Enter valid mobile number"),
  chequeNo: Yup.string().when("collectionMode", {
    is: 1,
    then: (s) => s.required("Cheque No required").min(6).max(6),
    otherwise: (s) => s.notRequired(),
  }),
  // support collectionMode 2 (digital) and 3 (DD) for referenceNo
  referenceNo: Yup.string().when("collectionMode", {
    is: (val) => val === 2 || val === 3,
    then: (s) => s.required("Reference No required"),
    otherwise: (s) => s.notRequired(),
  }),
  remark: Yup.string().required("Remarks required"),
  dateTime: Yup.date().required("Date & Time required"),
});

// ---------------------------
// Form Initial State
// ---------------------------
export const initialState = {
  type: null,
  mode: 0,
  amount: "",
  amountDisabled: false,

  // charges toggles
  charges: {
    ot: true,
    dpc: true,
    chequeBounce: true,
  },

  collectionMode: 0,
  chequeNo: "",
  digitalMode: 0,
  referenceNo: "",
  mobile: "",
  remark: "",
  dateTime: new Date(),
  evidence: null,

  // internal flags:
  hasUserEditedAmount: false, // defaults false
};

// ---------------------------
// Hook (useState-based, persistent)
// ---------------------------
export default function usePaymentForm() {
  const [form, setForm] = useState(() => ({ ...initialState }));

  // last programmatic value used to fill the amount
  const lastAutoFillRef = useRef(null);

  // update generic field; special-case "amount" to keep auto-fill tracking correct
  const update = useCallback((field, value) => {
    setForm((prev) => {
      // if user types amount manually and it differs from last auto-fill, mark as edited
      if (field === "amount") {
        const s = value == null ? "" : String(value);
        const lastAuto = lastAutoFillRef.current;
        const shouldMarkUserEdited = lastAuto === null ? Boolean(s) : s !== String(lastAuto);
        return {
          ...prev,
          amount: s,
          hasUserEditedAmount: shouldMarkUserEdited,
        };
      }

      // normal update
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  // programmatically set amount (used by Payment.js auto-fill logic)
  const setProgrammaticAmount = useCallback((val) => {
    const s = val == null ? "" : String(val);
    lastAutoFillRef.current = s;
    setForm((prev) => ({
      ...prev,
      amount: s,
      hasUserEditedAmount: false,
    }));
  }, []);

  // clear amount and tracking
  const clearAmountAndTracking = useCallback(() => {
    lastAutoFillRef.current = null;
    setForm((prev) => ({
      ...prev,
      amount: "",
      hasUserEditedAmount: false,
    }));
  }, []);

  // full reset (explicit)
  const resetForm = useCallback(() => {
    lastAutoFillRef.current = null;
    setForm({ ...initialState });
  }, []);

  const validate = useCallback((payload) => {
    // allow validating any payload object; default to current form if none provided
    const target = payload || form;
    return paymentSchema.validate(target, { abortEarly: false });
  }, [form]);

  return {
    form,
    update,
    resetForm,
    setProgrammaticAmount,
    clearAmountAndTracking,
    validate,
    // expose the internal ref only for debugging if needed:
    _lastAutoFillRef: lastAutoFillRef,
  };
}
