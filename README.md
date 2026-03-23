# 🚀 PSv — Scalable Fintech React Native Architecture

A **production-grade React Native application** demonstrating a **modular, scalable architecture** for fintech systems like Loan Origination (LOS), Collections, and Payments.

---

## 📱 Demo APK

👉 https://drive.google.com/uc?export=download&id=1MMT6pMfnT08-uBI9knZi2wf0kurNqO07

---

## 📸 Screenshots

### 🧩 Module & Role Selection

![Module Selection](assets/screenshots/ModuleSelector.png)
![Role Selection](assets/screenshots/ModuleSelection.png)

### 💰 Loan Modules

![Gold Loan](assets/screenshots/GoldLoan.png)
![Vehicle Loan](assets/screenshots/VehicleLoan.png)

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

### 📊 Collection

![Allocation](assets/screenshots/Allocation.png)
![Collection Dashboard](assets/screenshots/Dashboard-Collection.png)

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

### 1. Feature-Based Modular Design

* Each domain (LOS, Payment, Collection) is isolated
* Enables independent development & scaling
* Reduces cross-module coupling

### 2. Centralized API Layer

* Axios instance with interceptors
* Handles:

  * Auth token injection
  * Global error handling
  * Automatic logout on 401

### 3. Service Layer Abstraction

* Business logic separated from UI
* Improves testability and reuse

### 4. Global State Management

* Redux Toolkit for predictable state
* Manages:

  * Authentication state
  * User roles
  * Global configuration

---

## 📂 Folder Structure

```
src/
├── app/              # Navigation & app setup
├── modules/          # Feature modules
│   ├── goldLoan/
│   ├── payment/
│   ├── collection/
│   ├── los/
├── redux/            # Global state management
├── common/           # Utilities & helpers
├── components/       # Reusable UI components
├── Drawer/           # Custom drawer system
```

---

## ✨ Key Features

* Role-based module access
* Modular plug-and-play architecture
* Dynamic BASE_URL (runtime configurable)
* Centralized API handling using Axios interceptors
* File upload support (Blob handling)
* Persistent authentication using AsyncStorage
* Automatic logout on token expiry

---

## ⚡ Performance Optimization

* React.memo → Prevent unnecessary re-renders
* useMemo → Avoid expensive recalculations
* useCallback → Stable function references
* Optimized FlatList rendering
* Reduced redundant Redux updates

---

## 🔐 Security

* Token-based authentication
* Secure storage using AsyncStorage
* Interceptor-based API protection
* Session invalidation on expiry

---

## 📈 Scalability

* Independent feature modules
* Easy addition of new modules
* Reusable service and API layers
* Config-driven environment switching

---

## 🧠 Real-World Use Case

Inspired by real fintech systems handling:

* Loan Origination Systems (LOS)
* Collection & recovery platforms (10k+ users)
* Payment transaction systems

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start Metro

```bash
npm start
```

### 3. Run Android

```bash
npm run android
```

---

## 🔧 Tech Stack

* React Native
* Redux Toolkit
* Axios
* AsyncStorage
* React Navigation
* Gesture Handler

---

## ⚠️ Known Limitations

* No offline support
* No caching layer (React Query / SWR)
* Basic token handling (no refresh queue)
* No automated tests

---

## 🔮 Future Improvements

* Add React Query for server-state management
* Implement token refresh queue handling
* Add offline-first support (MMKV/SQLite)
* Introduce unit & integration testing
* Performance monitoring & profiling

---

## 👨‍💻 Author

**Shivam Mishra**
React Native Developer (2+ years)
