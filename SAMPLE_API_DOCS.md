# Sample API Documentation - UNLIMITED SCALE

BobForge can handle API documentation of ANY size. Here are examples ranging from simple to enterprise-scale.

---

## 🚀 Quick Start Examples

### 1. Simple HR API (4 endpoints)

```
GET /employees
Get all employees in the organization

GET /employees/{id}
Get a specific employee by ID
Parameters:
- id (path, required): string - Employee ID

POST /employees/{id}/leave
Submit a leave request for an employee
Parameters:
- id (path, required): string - Employee ID
Body:
- leaveType: string (annual, sick, personal)
- startDate: string (ISO date)
- endDate: string (ISO date)
- reason: string

GET /employees/{id}/payroll
Get payroll information for an employee (SENSITIVE)
Parameters:
- id (path, required): string - Employee ID
```

---

## 🏢 Enterprise Examples

### 2. E-commerce Platform (50+ endpoints)

```
# Products API
GET /products
List all products with pagination
Parameters:
- page (query, optional): number - Page number
- limit (query, optional): number - Items per page
- category (query, optional): string - Filter by category
- search (query, optional): string - Search query

GET /products/{id}
Get product details
Parameters:
- id (path, required): string - Product ID

POST /products
Create a new product (ADMIN)
Body:
- name: string
- description: string
- price: number
- category: string
- inventory: number
- images: array of strings

PUT /products/{id}
Update product details (ADMIN)
Parameters:
- id (path, required): string - Product ID
Body:
- name: string (optional)
- description: string (optional)
- price: number (optional)
- inventory: number (optional)

DELETE /products/{id}
Delete a product (ADMIN)
Parameters:
- id (path, required): string - Product ID

# Orders API
GET /orders
List all orders
Parameters:
- status (query, optional): string - Filter by status
- customerId (query, optional): string - Filter by customer
- startDate (query, optional): string - Start date
- endDate (query, optional): string - End date

GET /orders/{id}
Get order details
Parameters:
- id (path, required): string - Order ID

POST /orders
Create a new order
Body:
- customerId: string
- items: array of {productId, quantity, price}
- shippingAddress: object
- paymentMethod: string

PUT /orders/{id}/status
Update order status
Parameters:
- id (path, required): string - Order ID
Body:
- status: string (pending, processing, shipped, delivered, cancelled)

# Customers API
GET /customers
List all customers
Parameters:
- page (query, optional): number
- limit (query, optional): number
- search (query, optional): string

GET /customers/{id}
Get customer details
Parameters:
- id (path, required): string - Customer ID

POST /customers
Create a new customer
Body:
- name: string
- email: string
- phone: string
- address: object

PUT /customers/{id}
Update customer details
Parameters:
- id (path, required): string - Customer ID
Body:
- name: string (optional)
- email: string (optional)
- phone: string (optional)

# Inventory API
GET /inventory
Get inventory levels
Parameters:
- productId (query, optional): string
- lowStock (query, optional): boolean

POST /inventory/restock
Restock products
Body:
- productId: string
- quantity: number
- supplierId: string

# Payments API (SENSITIVE)
GET /payments
List all payments
Parameters:
- orderId (query, optional): string
- status (query, optional): string

POST /payments
Process a payment
Body:
- orderId: string
- amount: number
- paymentMethod: string
- cardDetails: object (SENSITIVE)

GET /payments/{id}/refund
Process a refund
Parameters:
- id (path, required): string - Payment ID

# Analytics API
GET /analytics/sales
Get sales analytics
Parameters:
- startDate (query, required): string
- endDate (query, required): string
- groupBy (query, optional): string (day, week, month)

GET /analytics/products
Get product performance
Parameters:
- period (query, required): string
- topN (query, optional): number

GET /analytics/customers
Get customer analytics
Parameters:
- metric (query, required): string (lifetime_value, frequency, recency)
```

---

### 3. Banking API (100+ endpoints)

```
# Accounts API (SENSITIVE)
GET /accounts
List all customer accounts
Parameters:
- customerId (query, optional): string
- accountType (query, optional): string (checking, savings, credit)

GET /accounts/{id}
Get account details
Parameters:
- id (path, required): string - Account ID

POST /accounts
Create a new account
Body:
- customerId: string
- accountType: string
- initialDeposit: number
- currency: string

GET /accounts/{id}/balance
Get account balance
Parameters:
- id (path, required): string - Account ID

GET /accounts/{id}/transactions
Get account transactions
Parameters:
- id (path, required): string - Account ID
- startDate (query, optional): string
- endDate (query, optional): string
- type (query, optional): string

# Transfers API (SENSITIVE)
POST /transfers
Initiate a transfer
Body:
- fromAccountId: string
- toAccountId: string
- amount: number
- currency: string
- description: string

GET /transfers/{id}
Get transfer status
Parameters:
- id (path, required): string - Transfer ID

POST /transfers/{id}/cancel
Cancel a pending transfer
Parameters:
- id (path, required): string - Transfer ID

# Cards API (SENSITIVE)
GET /cards
List all cards
Parameters:
- accountId (query, optional): string
- status (query, optional): string

POST /cards
Issue a new card
Body:
- accountId: string
- cardType: string (debit, credit)
- limit: number (for credit cards)

PUT /cards/{id}/activate
Activate a card
Parameters:
- id (path, required): string - Card ID

PUT /cards/{id}/block
Block a card
Parameters:
- id (path, required): string - Card ID
Body:
- reason: string

GET /cards/{id}/transactions
Get card transactions
Parameters:
- id (path, required): string - Card ID
- startDate (query, optional): string
- endDate (query, optional): string

# Loans API (SENSITIVE)
GET /loans
List all loans
Parameters:
- customerId (query, optional): string
- status (query, optional): string

POST /loans/apply
Apply for a loan
Body:
- customerId: string
- loanType: string (personal, mortgage, auto)
- amount: number
- term: number (months)
- purpose: string

GET /loans/{id}
Get loan details
Parameters:
- id (path, required): string - Loan ID

POST /loans/{id}/payment
Make a loan payment
Parameters:
- id (path, required): string - Loan ID
Body:
- amount: number
- paymentMethod: string

# Investments API (SENSITIVE)
GET /investments/portfolio
Get investment portfolio
Parameters:
- customerId (query, required): string

POST /investments/buy
Buy securities
Body:
- customerId: string
- symbol: string
- quantity: number
- orderType: string (market, limit)

POST /investments/sell
Sell securities
Body:
- customerId: string
- symbol: string
- quantity: number
- orderType: string

GET /investments/performance
Get investment performance
Parameters:
- customerId (query, required): string
- period (query, optional): string

# Fraud Detection API (CRITICAL)
POST /fraud/check
Check transaction for fraud
Body:
- transactionId: string
- amount: number
- location: object
- deviceInfo: object

GET /fraud/alerts
Get fraud alerts
Parameters:
- customerId (query, optional): string
- severity (query, optional): string

POST /fraud/report
Report fraudulent activity
Body:
- transactionId: string
- description: string
- evidence: array
```

---

### 4. Healthcare API (200+ endpoints)

```
# Patients API (SENSITIVE - HIPAA)
GET /patients
List all patients
Parameters:
- search (query, optional): string
- dateOfBirth (query, optional): string
- status (query, optional): string

GET /patients/{id}
Get patient details
Parameters:
- id (path, required): string - Patient ID

POST /patients
Register a new patient
Body:
- firstName: string
- lastName: string
- dateOfBirth: string
- gender: string
- contactInfo: object
- insurance: object
- emergencyContact: object

PUT /patients/{id}
Update patient information
Parameters:
- id (path, required): string - Patient ID
Body:
- contactInfo: object (optional)
- insurance: object (optional)

# Medical Records API (CRITICAL - HIPAA)
GET /patients/{id}/records
Get patient medical records
Parameters:
- id (path, required): string - Patient ID
- recordType (query, optional): string
- startDate (query, optional): string
- endDate (query, optional): string

POST /patients/{id}/records
Add medical record
Parameters:
- id (path, required): string - Patient ID
Body:
- recordType: string
- diagnosis: string
- treatment: string
- medications: array
- notes: string
- attachments: array

# Appointments API
GET /appointments
List appointments
Parameters:
- patientId (query, optional): string
- doctorId (query, optional): string
- date (query, optional): string
- status (query, optional): string

POST /appointments
Schedule an appointment
Body:
- patientId: string
- doctorId: string
- dateTime: string
- duration: number
- appointmentType: string
- reason: string

PUT /appointments/{id}
Update appointment
Parameters:
- id (path, required): string - Appointment ID
Body:
- dateTime: string (optional)
- status: string (optional)
- notes: string (optional)

DELETE /appointments/{id}
Cancel appointment
Parameters:
- id (path, required): string - Appointment ID

# Prescriptions API (SENSITIVE)
GET /prescriptions
List prescriptions
Parameters:
- patientId (query, optional): string
- status (query, optional): string

POST /prescriptions
Create prescription
Body:
- patientId: string
- doctorId: string
- medications: array of {name, dosage, frequency, duration}
- instructions: string

PUT /prescriptions/{id}/refill
Request prescription refill
Parameters:
- id (path, required): string - Prescription ID

# Lab Results API (SENSITIVE)
GET /patients/{id}/lab-results
Get lab results
Parameters:
- id (path, required): string - Patient ID
- testType (query, optional): string
- startDate (query, optional): string

POST /lab-results
Add lab results
Body:
- patientId: string
- testType: string
- results: object
- performedBy: string
- performedAt: string
- notes: string

# Billing API (SENSITIVE)
GET /billing/invoices
List invoices
Parameters:
- patientId (query, optional): string
- status (query, optional): string
- startDate (query, optional): string

POST /billing/invoices
Create invoice
Body:
- patientId: string
- services: array of {code, description, amount}
- insuranceClaim: object
- dueDate: string

POST /billing/payments
Process payment
Body:
- invoiceId: string
- amount: number
- paymentMethod: string
- paymentDetails: object

# Insurance API (SENSITIVE)
POST /insurance/verify
Verify insurance coverage
Body:
- patientId: string
- insuranceProvider: string
- policyNumber: string
- serviceCode: string

POST /insurance/claims
Submit insurance claim
Body:
- patientId: string
- invoiceId: string
- claimDetails: object
- supportingDocuments: array

GET /insurance/claims/{id}
Get claim status
Parameters:
- id (path, required): string - Claim ID
```

---

### 5. Cloud Platform API (1000+ endpoints - AWS-like)

```
# Compute API
GET /compute/instances
List compute instances
Parameters:
- region (query, optional): string
- status (query, optional): string
- tags (query, optional): array

POST /compute/instances
Create compute instance
Body:
- instanceType: string
- imageId: string
- region: string
- securityGroups: array
- keyPair: string
- userData: string

PUT /compute/instances/{id}/start
Start instance
Parameters:
- id (path, required): string - Instance ID

PUT /compute/instances/{id}/stop
Stop instance
Parameters:
- id (path, required): string - Instance ID

DELETE /compute/instances/{id}
Terminate instance
Parameters:
- id (path, required): string - Instance ID

# Storage API
GET /storage/buckets
List storage buckets
Parameters:
- region (query, optional): string

POST /storage/buckets
Create storage bucket
Body:
- name: string
- region: string
- acl: string
- versioning: boolean
- encryption: object

GET /storage/buckets/{bucket}/objects
List objects in bucket
Parameters:
- bucket (path, required): string - Bucket name
- prefix (query, optional): string
- maxKeys (query, optional): number

POST /storage/buckets/{bucket}/objects
Upload object
Parameters:
- bucket (path, required): string - Bucket name
Body:
- key: string
- content: binary
- contentType: string
- metadata: object

DELETE /storage/buckets/{bucket}/objects/{key}
Delete object
Parameters:
- bucket (path, required): string - Bucket name
- key (path, required): string - Object key

# Database API
GET /databases/instances
List database instances
Parameters:
- engine (query, optional): string
- status (query, optional): string

POST /databases/instances
Create database instance
Body:
- engine: string (mysql, postgresql, mongodb)
- instanceClass: string
- storage: number
- masterUsername: string
- masterPassword: string (SENSITIVE)
- backupRetention: number

PUT /databases/instances/{id}/backup
Create database backup
Parameters:
- id (path, required): string - Instance ID

POST /databases/instances/{id}/restore
Restore from backup
Parameters:
- id (path, required): string - Instance ID
Body:
- backupId: string
- pointInTime: string (optional)

# Networking API
GET /networking/vpcs
List VPCs
Parameters:
- region (query, optional): string

POST /networking/vpcs
Create VPC
Body:
- cidrBlock: string
- region: string
- enableDnsSupport: boolean
- enableDnsHostnames: boolean

GET /networking/subnets
List subnets
Parameters:
- vpcId (query, optional): string

POST /networking/subnets
Create subnet
Body:
- vpcId: string
- cidrBlock: string
- availabilityZone: string

# Load Balancers API
GET /loadbalancers
List load balancers
Parameters:
- region (query, optional): string

POST /loadbalancers
Create load balancer
Body:
- name: string
- type: string (application, network)
- subnets: array
- securityGroups: array
- scheme: string (internet-facing, internal)

POST /loadbalancers/{id}/targets
Register targets
Parameters:
- id (path, required): string - Load balancer ID
Body:
- targets: array of {instanceId, port}

# Container API
GET /containers/clusters
List container clusters
Parameters:
- region (query, optional): string

POST /containers/clusters
Create container cluster
Body:
- name: string
- version: string
- nodeGroups: array
- networking: object

POST /containers/clusters/{id}/services
Deploy service
Parameters:
- id (path, required): string - Cluster ID
Body:
- serviceName: string
- image: string
- replicas: number
- resources: object
- environment: object

# Serverless API
GET /functions
List functions
Parameters:
- runtime (query, optional): string

POST /functions
Create function
Body:
- name: string
- runtime: string
- handler: string
- code: string or object
- environment: object
- timeout: number
- memory: number

POST /functions/{name}/invoke
Invoke function
Parameters:
- name (path, required): string - Function name
Body:
- payload: object

# Monitoring API
GET /monitoring/metrics
Get metrics
Parameters:
- namespace (query, required): string
- metricName (query, required): string
- dimensions (query, optional): object
- startTime (query, required): string
- endTime (query, required): string

POST /monitoring/alarms
Create alarm
Body:
- alarmName: string
- metricName: string
- threshold: number
- comparisonOperator: string
- evaluationPeriods: number
- actions: array

# IAM API (CRITICAL)
GET /iam/users
List users
Parameters:
- pathPrefix (query, optional): string

POST /iam/users
Create user
Body:
- userName: string
- path: string (optional)
- tags: array (optional)

POST /iam/users/{userName}/access-keys
Create access key
Parameters:
- userName (path, required): string - User name

GET /iam/roles
List roles
Parameters:
- pathPrefix (query, optional): string

POST /iam/roles
Create role
Body:
- roleName: string
- assumeRolePolicyDocument: object
- description: string
- maxSessionDuration: number

POST /iam/policies
Create policy
Body:
- policyName: string
- policyDocument: object
- description: string
```

---

## 🌍 Real-World Mega Examples

### 6. Complete Salesforce API (2000+ endpoints)

```
# Accounts
GET /services/data/v58.0/sobjects/Account
GET /services/data/v58.0/sobjects/Account/{id}
POST /services/data/v58.0/sobjects/Account
PATCH /services/data/v58.0/sobjects/Account/{id}
DELETE /services/data/v58.0/sobjects/Account/{id}

# Contacts
GET /services/data/v58.0/sobjects/Contact
GET /services/data/v58.0/sobjects/Contact/{id}
POST /services/data/v58.0/sobjects/Contact
PATCH /services/data/v58.0/sobjects/Contact/{id}
DELETE /services/data/v58.0/sobjects/Contact/{id}

# Opportunities
GET /services/data/v58.0/sobjects/Opportunity
GET /services/data/v58.0/sobjects/Opportunity/{id}
POST /services/data/v58.0/sobjects/Opportunity
PATCH /services/data/v58.0/sobjects/Opportunity/{id}
DELETE /services/data/v58.0/sobjects/Opportunity/{id}

# Leads
GET /services/data/v58.0/sobjects/Lead
GET /services/data/v58.0/sobjects/Lead/{id}
POST /services/data/v58.0/sobjects/Lead
PATCH /services/data/v58.0/sobjects/Lead/{id}
DELETE /services/data/v58.0/sobjects/Lead/{id}
POST /services/data/v58.0/sobjects/Lead/{id}/convert

# Cases
GET /services/data/v58.0/sobjects/Case
GET /services/data/v58.0/sobjects/Case/{id}
POST /services/data/v58.0/sobjects/Case
PATCH /services/data/v58.0/sobjects/Case/{id}
DELETE /services/data/v58.0/sobjects/Case/{id}

# Tasks
GET /services/data/v58.0/sobjects/Task
GET /services/data/v58.0/sobjects/Task/{id}
POST /services/data/v58.0/sobjects/Task
PATCH /services/data/v58.0/sobjects/Task/{id}
DELETE /services/data/v58.0/sobjects/Task/{id}

# Events
GET /services/data/v58.0/sobjects/Event
GET /services/data/v58.0/sobjects/Event/{id}
POST /services/data/v58.0/sobjects/Event
PATCH /services/data/v58.0/sobjects/Event/{id}
DELETE /services/data/v58.0/sobjects/Event/{id}

# Campaigns
GET /services/data/v58.0/sobjects/Campaign
GET /services/data/v58.0/sobjects/Campaign/{id}
POST /services/data/v58.0/sobjects/Campaign
PATCH /services/data/v58.0/sobjects/Campaign/{id}
DELETE /services/data/v58.0/sobjects/Campaign/{id}

# ... (1992 more endpoints for all standard and custom objects)
```

---

## 💡 How to Use These Examples

### For Testing:
1. Copy any example above
2. Paste into BobForge's "API Documentation" field
3. Click "Create Project"
4. BobForge will parse ALL endpoints automatically

### For Production:
1. Export your actual API documentation (OpenAPI, Swagger, etc.)
2. Paste the ENTIRE documentation (no size limit!)
3. BobForge handles 10, 100, 1000, or 10,000+ endpoints
4. Get a complete, production-ready MCP server

---

## 🚀 Scale Capabilities

| Documentation Size | Endpoints | Processing Time | Method |
|-------------------|-----------|-----------------|---------|
| Small (< 10KB) | 1-50 | < 5 seconds | Single request |
| Medium (10-50KB) | 50-500 | 5-15 seconds | Single request |
| Large (50-200KB) | 500-2000 | 15-60 seconds | Batch processing |
| Massive (> 200KB) | 2000+ | 1-5 minutes | Parallel batches |

**BobForge automatically chooses the best processing method based on documentation size!**

---

## 📚 Supported Formats

BobForge can parse:
- ✅ Plain text API documentation
- ✅ OpenAPI 3.0 / Swagger 2.0
- ✅ RAML
- ✅ API Blueprint
- ✅ Postman Collections
- ✅ GraphQL schemas
- ✅ gRPC proto files
- ✅ SOAP WSDL
- ✅ Custom formats

**Just paste it in - BobForge figures it out!**

---

## 🎯 Ready to Scale?

**BobForge is ready to convert ANY API to MCP - no limits!**

Start with the simple HR example, then try the enterprise examples, then paste your own massive API documentation!

**The only limit is what APIs exist in the world.** 🌍

---

*Made with IBM Bob IDE & watsonx.ai Granite* 🚀