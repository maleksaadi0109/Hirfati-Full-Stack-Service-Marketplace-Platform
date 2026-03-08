# Hirfati (حرفتي)

<div align="center">
  <img src="./public/screenshots/landing_page.png" alt="Hirfati Logo" width="100%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">

  <br>

  <h1>The Premier Home Services Marketplace in Libya</h1>

  <p>
    <b>Connect with trusted local experts for home repairs, errands, and more.</b>
  </p>

  <p>
    <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel"></a>
    <a href="https://reactjs.org"><img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"></a>
    <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres"></a>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-license">License</a>
  </p>
</div>

---

## 📖 Overview

**Hirfati** is a robust multi-vendor marketplace designed to bridge the gap between Libyan homeowners and skilled service professionals. Whether you need a plumber, an electrician, or a general handyman, Hirfati makes it effortless to find, hire, and pay trusted professionals securely.

We focus on three core pillars: **Speed, Trust, and User Experience.**

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Smart Dashboard</b></td>
      <td align="center"><b>Real-time Chat</b></td>
    </tr>
    <tr>
      <td><img src="./public/screenshots/dashboard.png" width="400" alt="Dashboard"></td>
      <td><img src="./public/screenshots/messages.png" width="400" alt="Messages"></td>
    </tr>
    <tr>
      <td align="center" colspan="2"><b>Client Order Tracking</b></td>
    </tr>
    <tr>
      <td align="center" colspan="2"><img src="./public/screenshots/my_orders_dashboard.png" width="800" alt="Orders"></td>
    </tr>
  </table>
</div>

---

## ✨ Key Features

Hirfati is packed with state-of-the-art features tailored for the local market:

### 🤖 AI & Automation
* **📸 Instant AI Price Estimation:** Upload a photo of the repair needed, and our Computer Vision model (Hirfati Vision API) generates an instant budget range.
* **🧠 Smart Matching:** Our algorithm automatically pairs clients with the best-rated professionals nearby based on geolocation, skill set, and availability.

### 🛡️ Security & Trust
* **✅ Identity Verification:** Integration with national ID databases to verify professional identities.
* **🔐 Secure Escrow Payments:** Funds are held safely and only released when the job is marked complete by the client.
* **⚖️ Automated Dispute Resolution:** AI-driven mediation system to handle common conflicts fairly.

### ⚡ Performance & Experience
* **📍 Live Tracking:** Watch your professional arrive in real-time on an interactive map.
* **📱 PWA Support:** Installable as a native app with offline capabilities.
* **🌍 Bilingual Interface:** Native support for **Arabic (RTL)** and **English (LTR)**.

---

## 🛠 Tech Stack

We use a modern, monolithic architecture with microservices for specific high-load tasks.

| Category | Technologies |
| :--- | :--- |
| **Backend** | Laravel 11, PHP 8.3, Laravel Sanctum (Auth) |
| **Frontend** | React.js, Inertia.js, Tailwind CSS, Shadcn UI |
| **Database** | PostgreSQL, Redis (Caching & Queues) |
| **Real-time** | Laravel Reverb (WebSockets) |
| **DevOps** | Docker, Nginx, Supervisor |
| **Cloud (AWS)** | EC2, S3, CloudFront, RDS |

---

## 🏗 Architecture

The application follows a modular structure, utilizing Docker containers for consistency.

```mermaid
graph TD;
    Client[User Client/PWA] -->|HTTPS| LoadBalancer[Nginx / Load Balancer];
    LoadBalancer --> AppServer[Laravel 11 App Container];
    AppServer -->|Read/Write| DB[(PostgreSQL)];
    AppServer -->|Cache/Queue| Redis[(Redis)];
    AppServer -->|Store Files| S3[AWS S3 Bucket];
    AppServer -->|Events| Reverb[Laravel Reverb / WebSockets];
    Reverb --> Client;
