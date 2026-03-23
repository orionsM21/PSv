# 🚀 PSv — Scalable Fintech React Native Architecture

A **production-grade React Native application** demonstrating a **modular, scalable architecture** for fintech systems like Loan Origination (LOS), Collections, and Payments.

---

## 📱 Demo APK

👉 https://drive.google.com/uc?export=download&id=1MMT6pMfnT08-uBI9knZi2wf0kurNqO07

---

## 📸 Screenshots

### 🧩 Module & Role Selection

![Module Selector](assets/screenshots/ModuleSelector.png)
![Module Selection](assets/screenshots/ModuleSelection.png)

---

### 💰 Loan Modules

![Gold Loan](assets/screenshots/GoldLoan.png)
![Vehicle Loan](assets/screenshots/VehicleLoan.png)

---

### 💳 Payments

![Payment Dashboard](assets/screenshots/Payment-Dashboard.png)
![Payment Drawer](assets/screenshots/Payment-Drawer.png)
![Send Money](assets/screenshots/Send-Money.png)
![Receive Money](assets/screenshots/Receive-Money.png)
![Money Analysis](assets/screenshots/MoneyAnalysis.png)
![Debit Card](assets/screenshots/DebCard.png)
![Flip Card](assets/screenshots/Flipdebit.png)
![User Profile](assets/screenshots/UserProfile.png)
![Payment Settings](assets/screenshots/payment-Settings.png)

---

### 📊 Collection

![Allocation](assets/screenshots/Allocation.png)
![Collection Dashboard](assets/screenshots/Dashboard-Collection.png)

---

### 🔍 OCR

![OCR Upload](assets/screenshots/OCR-Via-Camera-Upload.png)

---

## 📌 Problem Statement

Modern fintech applications require:

* Multiple independent modules (LOS, Collections, Payments)
* Role-based access control (Admin, Agent, Officer)
* Dynamic environment handling (multi-tenant BASE URLs)
* Secure API communication with token lifecycle
* Scalable architecture for continuous feature expansion

---

## 🏗 Architecture Overview

```
UI (Screens / Components)
        ↓
Redux Toolkit (Global State)
        ↓
Service Layer (Business Logic)
        ↓
API Client (Axios + Interceptors)
        ↓
Backend Services
```

---

## ⚙️ Architectural Decisions

### Feature-Based Modular Design

* Each domain (LOS, Payment, Collection) is isolated
* Enables independent development & scaling
* Reduces cross-module coupling

### Centralized API Layer

* Axios instance with interceptors
* Handles:

  * Auth token injection
  * Global error handling
  * Automatic logout on 401

### Service Layer Abstraction

* Business logic separated from UI
* Improves reusability and testability

### Global State Management

* Redux Toolkit for predictable state
* Manages auth, roles, and config

---

## 📂 Folder Structure

```
src/
├── app/
├── modules/
│   ├── goldLoan/
│   ├── payment/
│   ├── collection/
│   ├── los/
├── redux/
├── common/
├── components/
├── Drawer/
```

---

## ✨ Key Features

* Role-based module access
* Modular plug-and-play architecture
* Dynamic BASE_URL configuration
* Centralized API handling
* File upload support
* Persistent authentication
* Auto logout on token expiry

---

## ⚡ Performance Optimization

* React.memo
* useMemo
* useCallback
* Optimized FlatList
* Reduced unnecessary renders

---

## 🔐 Security

* Token-based authentication
* Secure storage (AsyncStorage)
* Interceptor-based protection
* Session expiration handling

---

## 📈 Scalability

* Independent modules
* Easy feature expansion
* Shared API/service layer
* Config-driven environments

---

## 🚀 Getting Started

```bash
npm install
npm start
npm run android
```

---

## 🔧 Tech Stack

* React Native
* Redux Toolkit
* Axios
* AsyncStorage
* React Navigation

---

## 👨‍💻 Author

Shivam Mishra
React Native Developer
