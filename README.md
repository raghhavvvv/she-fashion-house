# She Fashion House - Booking System

A simple, powerful, and private desktop application designed for boutique owners to manage customer bookings, track deliveries, and handle payments. Built with Node.js and Electron, this app runs entirely on your local machine, ensuring your business data stays with you.

 
*(Feel free to replace this with a screenshot of your own app!)*

---

## ✨ Features

This application provides a complete solution for managing the day-to-day operations of a small fashion house or tailor shop.

*   **Dashboard:** At a glance, see all deliveries scheduled for today and quickly add new bookings.
*   **Add New Booking:** A simple form to capture all essential details:
    *   Customer Name & Phone Number
    *   Cloth Details/Color
    *   Booking & Delivery Dates
    *   Total Order Amount
    *   Emergency Delivery flag
*   **All Bookings View:** A comprehensive list of all active bookings with powerful tools:
    *   **Search:** Instantly find any booking by customer name.
    *   **Filter:** A detailed pop-up allows you to filter bookings by date, phone number, cloth color, delivery status, and more.
    *   **Quick Actions:** Mark bookings as "Delivered" or move them to the bin with a single click.
*   **Payment Management:** A dedicated section to track your finances:
    *   **Pending Payments:** See all orders with outstanding balances.
    *   **Record Payments:** Easily record full or partial payments for any booking.
    *   **Completed Payments:** A clean record of all fully paid orders.
*   **Recycle Bin:** Deleted bookings are moved to a bin, allowing you to restore them or delete them permanently.
*   **Fully Offline:** Runs 100% locally on your desktop. No internet connection required, and your data is never sent to the cloud.

---

## 🛠️ Tech Stack

*   **Backend:** Node.js with Express.js
*   **Database:** SQLite (a serverless, file-based database perfect for local apps)
*   **Frontend:** EJS (Embedded JavaScript templating) for rendering HTML pages
*   **Desktop App Framework:** Electron (to package the web app as a native desktop application)

---

## 🚀 Getting Started (For Users)

To run the pre-built application, simply download the latest release for your operating system (e.g., `She-Fashion-House-win32-x64.zip`), unzip the folder, and double-click the `She Fashion House.exe` (on Windows) or `She Fashion House.app` (on macOS) file.

## ⚙️ Setup and Development (For Developers)

If you want to run the application from the source code or contribute to its development, follow these steps.

### Prerequisites

*   **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
*   **(For Windows builds on Mac/Linux):** You will need to install Wine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/she-fashion-house.git
    cd she-fashion-house
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:** Run this command **only once** to create the `bookings.db` file with the correct schema.
    ```bash
    node setupDatabase.js
    ```

### Running the App in Development Mode

To run the application with live reloading and access to developer tools:
```bash
npm run electron-start
```
Building the Desktop Application
To package the application into a distributable format for different operating systems:

For Windows:
```bash
npm run package-win
```
For macOS:
```bash
npm run package-mac
```
The final application will be located in the dist/ folder.
