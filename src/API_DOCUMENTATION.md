# 📡 API Documentation - BloodLink System

## Base URL
```
http://your-domain.com/api
```

## Authentication
جميع الطلبات تحتاج إلى Token في الـ Headers:
```
Authorization: Bearer <your_token>
```

---

## 🔐 Authentication Endpoints

### 1. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@bloodbank.gov.eg",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@bloodbank.gov.eg",
    "role": "admin"
  }
}
```

---

### 2. Get Current User
```http
GET /auth/me
```

**Response:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@bloodbank.gov.eg",
  "role": "admin"
}
```

---

### 3. Logout
```http
POST /auth/logout
```

---

## 📊 Dashboard Endpoints

### 1. Get Dashboard Stats
```http
GET /dashboard/stats
```

**Response:**
```json
{
  "totalUnits": 12450,
  "activeRequests": 85,
  "urgentRequests": 12,
  "weeklyDonors": 669,
  "activeHospitals": 47
}
```

---

### 2. Get Daily Consumption
```http
GET /dashboard/consumption
```

**Response:**
```json
[
  {
    "day": "Saturday",
    "consumption": 420,
    "donations": 380
  },
  {
    "day": "Sunday",
    "consumption": 380,
    "donations": 450
  }
]
```

---

### 3. Get Weekly Donations
```http
GET /dashboard/donations/weekly
```

**Response:**
```json
[
  { "bloodType": "A+", "count": 145 },
  { "bloodType": "O+", "count": 198 },
  { "bloodType": "B+", "count": 87 }
]
```

---

### 4. Get Hospitals
```http
GET /dashboard/hospitals
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cairo General Hospital",
    "location": {
      "lat": 30.0444,
      "lng": 31.2357
    },
    "inventory": 85,
    "status": "adequate"
  }
]
```

---

## 🩸 Blood Inventory Endpoints

### 1. Get All Inventory
```http
GET /inventory
```

**Response:**
```json
[
  {
    "bloodType": "A+",
    "unitsAvailable": 520,
    "expiringSoon": 12,
    "averageDemand": 400,
    "status": "adequate",
    "fillPercentage": 85
  }
]
```

---

### 2. Get Inventory by Blood Type
```http
GET /inventory/:bloodType
```

Example: `GET /inventory/A+`

**Response:**
```json
{
  "bloodType": "A+",
  "unitsAvailable": 520,
  "expiringSoon": 12,
  "averageDemand": 400,
  "status": "adequate",
  "fillPercentage": 85,
  "history": [
    { "date": "2025-10-20", "units": 510 },
    { "date": "2025-10-21", "units": 520 }
  ]
}
```

---

### 3. Update Inventory
```http
PUT /inventory/:bloodType
```

**Request Body:**
```json
{
  "unitsAvailable": 550,
  "notes": "New donation batch received"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "bloodType": "A+",
    "unitsAvailable": 550
  }
}
```

---

## 🏥 Hospitals & Requests Endpoints

### 1. Get All Hospitals
```http
GET /hospitals
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cairo General Hospital",
    "location": "Cairo",
    "phone": "+20 123 456 7890",
    "email": "contact@cairohospital.gov.eg",
    "inventory": 85
  }
]
```

---

### 2. Get Hospital Requests
```http
GET /hospitals/requests?status=pending&location=Cairo
```

**Query Parameters:**
- `status`: pending, urgent, fulfilled
- `location`: Cairo, Giza, etc.
- `bloodType`: A+, O-, etc.

**Response:**
```json
[
  {
    "id": 1,
    "hospital": "Cairo General Hospital",
    "bloodType": "A+",
    "units": 15,
    "status": "pending",
    "urgency": "normal",
    "requestDate": "2025-10-20",
    "location": "Cairo"
  }
]
```

---

### 3. Approve Request
```http
POST /hospitals/requests/:id/approve
```

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "requestId": 1
}
```

---

### 4. Reject Request
```http
POST /hospitals/requests/:id/reject
```

**Request Body:**
```json
{
  "reason": "Insufficient stock"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request rejected",
  "requestId": 1
}
```

---

## 📢 Campaigns Endpoints

### 1. Get All Campaigns
```http
GET /campaigns
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cairo University Campaign",
    "location": "Faculty of Medicine - Cairo University",
    "coords": [30.0266, 31.2099],
    "date": "2025-10-25",
    "donors": 156,
    "target": 200,
    "status": "active",
    "coordinator": "Dr. Ahmed Mohamed"
  }
]
```

---

### 2. Create Campaign
```http
POST /campaigns
```

**Request Body:**
```json
{
  "name": "New Campaign",
  "location": "Location details",
  "coords": [30.0444, 31.2357],
  "date": "2025-11-01",
  "target": 300,
  "coordinator": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaignId": 6
}
```

---

### 3. Update Campaign
```http
PUT /campaigns/:id
```

**Request Body:**
```json
{
  "donors": 180,
  "status": "active"
}
```

---

### 4. Delete Campaign
```http
DELETE /campaigns/:id
```

---

## 🚚 Transfers Endpoints

### 1. Get All Transfers
```http
GET /transfers
```

**Response:**
```json
[
  {
    "id": "TRF-001",
    "from": "Central Blood Bank",
    "to": "Cairo General Hospital",
    "bloodType": "O+",
    "units": 15,
    "status": "in-transit",
    "driver": "Mohamed Ahmed",
    "vehicle": "ABC 1234",
    "departureTime": "08:30 AM",
    "estimatedArrival": "09:15 AM"
  }
]
```

---

### 2. Create Transfer
```http
POST /transfers
```

**Request Body:**
```json
{
  "from": "Central Blood Bank",
  "to": "Cairo General Hospital",
  "bloodType": "O+",
  "units": 15,
  "driver": "Mohamed Ahmed",
  "vehicle": "ABC 1234"
}
```

---

### 3. Update Transfer Status
```http
PATCH /transfers/:id/status
```

**Request Body:**
```json
{
  "status": "delivered"
}
```

---

## 📈 Analytics Endpoints

### 1. Get Monthly Data
```http
GET /analytics/monthly
```

**Response:**
```json
[
  {
    "month": "January",
    "donations": 2400,
    "requests": 2100,
    "inventory": 8500
  }
]
```

---

### 2. Get Blood Type Distribution
```http
GET /analytics/blood-types
```

**Response:**
```json
[
  { "type": "A+", "value": 32, "color": "#ef4444" },
  { "type": "O+", "value": 28, "color": "#f97316" }
]
```

---

### 3. Export Report
```http
GET /analytics/export?type=monthly&period=2025-10
```

**Response:** PDF or Excel file download

---

## ⚙️ Settings Endpoints

### 1. Get Profile
```http
GET /settings/profile
```

**Response:**
```json
{
  "firstName": "Mohamed",
  "lastName": "Ahmed",
  "email": "mohamed.ahmed@bloodbank.gov.eg",
  "phone": "+20 123 456 7890",
  "position": "System Administrator"
}
```

---

### 2. Update Profile
```http
PUT /settings/profile
```

**Request Body:**
```json
{
  "firstName": "Mohamed",
  "lastName": "Ahmed",
  "phone": "+20 123 456 7890"
}
```

---

### 3. Update Password
```http
PUT /settings/password
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## ❌ Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Notes

1. **Rate Limiting:** 100 requests per minute
2. **Pagination:** Use `?page=1&limit=20`
3. **Sorting:** Use `?sort=date&order=desc`
4. **Filtering:** Use query parameters

---

**Version:** 2.5.1  
**Last Updated:** October 2025
