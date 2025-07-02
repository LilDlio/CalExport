# CalExport – Export Google Calendar to Sheet or Excel

📅 **CalExport** is a Chrome Extension that allows you to quickly export events from your Google Calendar to a Google Sheet or download them as an Excel (.xlsx) file.  
It’s lightweight, user-friendly, and works directly in your browser.

---

## 🚀 Features

- Choose a month to filter calendar events
- Export options:
  - 📄 Export to Google Sheet (automatically creates and opens)
  - ⬇️ Export to Excel (.xlsx)
- Clean, responsive UI with Vietnamese language support

---

## 🛠️ Manual Installation

1. Clone or download the source code:

```bash
git clone https://github.com/LilDlio/CalExport.git
```

- Or download the `.zip` and extract it

2. Open Chrome and go to:
   `chrome://extensions/`

3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder

---

## 📁 Folder Structure

```
📁 extension-root
├── background.js
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── assets/
│   ├── schedule.png
├── README.md
```

---

## 🔐 OAuth Setup & Client ID Replacement

This extension uses Google OAuth to request access tokens. You must create your own OAuth Client ID.

**Step 1: Create an OAuth Client ID**

1. Go to Google Cloud Console
2. Create a project or select an existing one
3. Enable the following APIs:

   - Google Calendar API
   - Google Sheets API
   - Google Drive API

4. Go to OAuth consent screen

   - Enter app name, scopes, and developer details

5. Go to Credentials → Create Credentials → OAuth Client ID

   - Choose Chrome App

   - For Application ID, use the extension ID found at chrome://extensions/

**Step 2: Replace the Client ID in `manifest.json`**

```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
  ]
}
```

Replace `YOUR_CLIENT_ID` with the Client ID you created in Google Cloud Console.

---

## 🧪 Required Permissions

The extension uses the following permissions:

```json
"permissions": ["identity", "scripting", "storage"],
"host_permissions": ["https://www.googleapis.com/*"]
```

- Used for:
  - Getting user authentication token
  - Reading calendar data
  - Writing to Google Sheets
  - Downloading Excel files

---

## 💻 How to Use

1. Click the extension icon in Chrome
2. Choose the target month

3. Click:
   - 📄 Export to Google Sheet to create and open a sheet
   - ⬇️ Download as Excel to save an .xlsx file

---

## 📜 License

```yaml
MIT License

Copyright © 2025 Captain D
```
