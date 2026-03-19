## 📸 Screenshots

### Organization Selection
![Module Selection](assets/screenshots/ModuleSelector.png)

### Module Selection
![Role Selection](assets/screenshots/ModuleSelection.png)

###  Screen
![Payment Screen](assets/screenshots/GoldLoan.png)
![Screen](assets/screenshots/UITheme.png)
[](assets/screenshots/VehicleLoan.png)

# 🚀 PSv - Scalable Fintech React Native Architecture

A production-grade React Native application demonstrating a **modular, scalable architecture** for fintech systems like Loan Origination (LOS), Collections, Payments, and more.

---

## 📌 Problem Statement

Fintech applications typically involve:

- Multiple independent modules (LOS, Collections, Payments)
- Role-based access (Admin, Loan Officer, Agent)
- Dynamic environments (different BASE URLs)
- Secure API communication
- Complex state management

This project solves these challenges using a **clean, scalable architecture**.

---

## 🏗 Architecture Overview
UI (Screens / Components) ↓ Redux (State Management) ↓ Service Layer (Business Logic) ↓ API Client (Axios + Interceptors) ↓ Backend

### Key Principles:
- Separation of concerns
- Feature-based modular architecture
- Centralized API handling
- Reusable components

---

## 📂 Folder Structure

src/ ├── app/            # Navigation setup ├── modules/        # Feature-based modules │    ├── goldLoan/ │    ├── payment/ │    ├── collection/ │    ├── los/ ├── redux/          # Global state management ├── common/         # Utilities & shared logic ├── Drawer/         # Custom drawer system ├── components/     # Reusable UI components

---

## ✨ Features

- ✅ Role-based module access
- ✅ Modular architecture (plug-and-play features)
- ✅ Dynamic BASE_URL (runtime config)
- ✅ Centralized API handling using Axios interceptors
- ✅ File upload support (Blob handling)
- ✅ Persistent authentication (AsyncStorage)
- ✅ Automatic logout on token expiry (401 handling)

---

## ⚡ Performance Optimizations

- `useMemo` → Avoid unnecessary recalculations
- `React.memo` → Prevent unnecessary re-renders
- `useCallback` → Stable function references
- Optimized `FlatList` rendering

---

## 🔐 Security

- Secure token storage using AsyncStorage
- Automatic session expiration handling
- Protected API calls using interceptors

---

## 📈 Impact

- Built scalable modular architecture for fintech flows
- Reduced code duplication via shared API/service layer
- Improved maintainability with clear separation of concerns
- Enabled easy addition of new modules without affecting existing ones

---

## 📸 Screenshots

### Module Selection
![Module Selection](assets/screenshots/module-selection.png)

### Role Selection
![Role Selection](assets/screenshots/role-selection.png)

### Payment Screen
![Payment Screen](assets/screenshots/payment-screen.png)

---

## 🎥 Demo

> Add your demo video link here (Google Drive / YouTube)

---

## 🧠 Real-world Use Case

Inspired by real fintech systems handling:

- Loan Origination Systems (LOS)
- Collection & Recovery apps (15k+ users)
- Payment processing flows

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install

2. Start Metro
npm start

3. Run app
npm run android 

🔧 Tech Stack
React Native
Redux Toolkit
Axios
AsyncStorage
React Navigation
Gesture Handler

👨‍💻 Author
Shivam Mishra
React Native Developer (2+ years)
