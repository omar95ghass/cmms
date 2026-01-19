# API Documentation - Patients Endpoints

## Base URL
`/api/patients`

All endpoints require authentication (Bearer token in Authorization header).

---

## 1. Get All Patients

**GET** `/api/patients`

Get a list of all patients.

### Query Parameters (Optional)
- `search` (string): Search term to filter patients by name, patient ID, phone, or ID number

### Response
```json
[
  {
    "id": 1,
    "patient_id": "PAT123ABC",
    "full_name": "أحمد محمد",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "phone": "0501234567",
    "email": "ahmed@example.com",
    "created_at": "2024-01-15 10:30:00"
  }
]
```

---

## 2. Get Patient by ID

**GET** `/api/patients/:id`

Get patient details by database ID.

### Parameters
- `id` (integer): Patient database ID

### Response
```json
{
  "id": 1,
  "patient_id": "PAT123ABC",
  "first_name": "أحمد",
  "last_name": "محمد",
  "full_name": "أحمد محمد",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "phone": "0501234567",
  "email": "ahmed@example.com",
  "address": "الرياض",
  "id_number": "1234567890",
  "created_at": "2024-01-15 10:30:00"
}
```

### Error Responses
- `404`: Patient not found

---

## 3. Create Patient

**POST** `/api/patients`

Create a new patient. Patient ID is automatically generated.

### Request Body
```json
{
  "first_name": "أحمد",
  "last_name": "محمد",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "phone": "0501234567",
  "email": "ahmed@example.com",
  "address": "الرياض",
  "id_number": "1234567890"
}
```

### Required Fields
- `first_name` (string, min 2 characters)
- `last_name` (string, min 2 characters)
- `date_of_birth` (date, format: YYYY-MM-DD)
- `gender` (string, must be "male" or "female")

### Optional Fields
- `phone` (string, 8-15 digits)
- `email` (string, valid email format)
- `address` (string)
- `id_number` (string, min 5 characters)

### Response (201 Created)
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "id": 1,
    "patient_id": "PAT123ABC",
    "first_name": "أحمد",
    "last_name": "محمد",
    "full_name": "أحمد محمد",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "phone": "0501234567",
    "email": "ahmed@example.com",
    "address": "الرياض",
    "id_number": "1234567890",
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### Error Responses
- `400`: Validation errors
  ```json
  {
    "errors": {
      "first_name": "First name is required",
      "email": "Invalid email format"
    }
  }
  ```
- `409`: Patient with same ID number already exists
  ```json
  {
    "error": "Patient with this ID number already exists",
    "patient_id": "PAT123ABC"
  }
  ```

---

## 4. Update Patient

**PUT** `/api/patients/:id`

Update patient information. Patient ID cannot be changed.

### Parameters
- `id` (integer): Patient database ID

### Request Body
Same as Create Patient (all fields optional except required ones)

### Response
```json
{
  "id": 1,
  "patient_id": "PAT123ABC",
  "first_name": "أحمد",
  "last_name": "محمد",
  "full_name": "أحمد محمد",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "phone": "0501234567",
  "email": "ahmed@example.com",
  "address": "الرياض",
  "id_number": "1234567890",
  "updated_at": "2024-01-15 11:00:00"
}
```

### Error Responses
- `404`: Patient not found
- `400`: Validation errors

---

## Validation Rules

### First Name / Last Name
- Required
- Minimum 2 characters
- Automatically trimmed

### Date of Birth
- Required
- Format: YYYY-MM-DD
- Cannot be in the future

### Gender
- Required
- Must be "male" or "female"

### Email
- Optional
- Must be valid email format
- Automatically converted to lowercase

### Phone
- Optional
- 8-15 digits (spaces, dashes, parentheses allowed but ignored in validation)
- Examples: `0501234567`, `+966501234567`

### ID Number
- Optional
- Minimum 5 characters
- Must be unique (if provided)

---

## Patient ID Generation

Patient ID is automatically generated when creating a new patient:
- Format: `PAT` + 6 random alphanumeric characters (uppercase)
- Example: `PATABC123`
- Guaranteed to be unique
- Cannot be changed after creation

---

## Activity Logging

All patient operations are automatically logged:
- **Create**: Logs patient creation with patient ID and name
- **Update**: Logs changes with before/after values
- **View**: (Can be added if needed)

---

## Example Usage

### Create Patient
```bash
curl -X POST http://localhost:8000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "أحمد",
    "last_name": "محمد",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "phone": "0501234567",
    "email": "ahmed@example.com"
  }'
```

### Search Patients
```bash
curl -X GET "http://localhost:8000/api/patients?search=أحمد" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Patient
```bash
curl -X PUT http://localhost:8000/api/patients/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0509876543",
    "address": "جدة"
  }'
```
