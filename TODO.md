# Permission-Based API Implementation Plan

## Tasks:
- [x] 1. Create Permission Middleware (`middlewares/permission.middleware.js`) - ALREADY EXISTS
- [x] 2. Update Auth Middleware to add function to get user permissions - ALREADY IN PERMISSION MIDDLEWARE
- [x] 3. Update Product Controller with permission checks for all endpoints - ALREADY IMPLEMENTED
- [ ] 4. Create User Controller for user management (with permission checks)
- [ ] 5. Create Inventory Controller (with permission checks)
- [ ] 6. Create Orders Controller (with permission checks)
- [ ] 7. Update Routes to use permission middleware
- [ ] 8. Test the implementation

## Permission Matrix for FRANCHISE_ADMIN (userId: 694a4442c5dd77bfd45ef516):
- users: { read: true, create: false, update: false, delete: false }
- products: { read: false, create: true, update: false, delete: false }
- inventory: { read: false, updateQuantity: false, updatePrice: false }
- orders: { read: false, updateStatus: false }

## Detailed Implementation Plan:

### Step 1: Update Auth Middleware
- Add reference to getUserPermissions from permission middleware

### Step 2: Create User Controller
- Create file: `controller/dashboardController/userController/user.controller.js`
- Implement: getUsers, getUserById, createUser, updateUser, deleteUser
- Add permission checks for each endpoint

### Step 3: Create Inventory Controller
- Create file: `controller/dashboardController/inventoryController/inventory.controller.js`
- Implement: getInventory, updateInventoryQuantity, updateInventoryPrice
- Add permission checks for each endpoint

### Step 4: Create Orders Controller
- Create file: `controller/dashboardController/orderController/order.controller.js`
- Implement: getOrders, getOrderById, updateOrderStatus
- Add permission checks for each endpoint
- Note: No order model exists, will create basic functionality

### Step 5: Update Routes
- Update `routes/dashboardRoutes/superAdmin.routes.js` to use permission middleware
