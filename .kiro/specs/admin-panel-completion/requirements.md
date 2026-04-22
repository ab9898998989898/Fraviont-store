# Requirements Document

## Introduction

The Fraviont admin panel is partially built. Several management pages are stubs (placeholder text only) and two detail pages are missing entirely. This feature completes the admin panel by implementing:

1. A fully functional **Products table page** with search, category/status filters, edit links, and soft-delete (deactivate) actions
2. A fully functional **Orders table page** with status/date filters and search
3. An **Order detail page** with status timeline, line items, and a status-update form
4. A fully functional **Customers table page** with search
5. A **Customer detail page** with profile info and order history

All pages must conform to the Fraviont design system (#0A0A0A background, #F5F0E8 ivory text, #C9A84C gold accent, Cormorant Garamond display font, Jost body font, `rounded-none` elements, dark shimmer skeletons) and the project's absolute rules (TypeScript strict, Server Components first, `adminProcedure` protection, loading skeletons, toast feedback).

The tRPC procedures `orders.getAll`, `orders.getById`, `orders.updateStatus`, `orders.addNote`, `customers.getAll`, and `customers.getById` are already implemented in the routers and must be consumed — not re-implemented.

---

## Glossary

- **Admin_Panel**: The Next.js App Router route group at `src/app/admin/(dashboard)/` protected by `adminProcedure`
- **Products_Page**: The page at `/admin/products` listing all products
- **Orders_Page**: The page at `/admin/orders` listing all orders
- **Order_Detail_Page**: The page at `/admin/orders/[id]` showing a single order
- **Customers_Page**: The page at `/admin/customers` listing all customers
- **Customer_Detail_Page**: The page at `/admin/customers/[id]` showing a single customer
- **Products_Router**: The tRPC router `productsRouter` at `src/server/api/routers/products.ts`
- **Orders_Router**: The tRPC router `ordersRouter` at `src/server/api/routers/orders.ts`
- **Customers_Router**: The tRPC router `customersRouter` at `src/server/api/routers/customers.ts`
- **TableSkeleton**: The existing skeleton component at `src/components/shared/skeletons/TableSkeleton.tsx`
- **StatusBadge**: The existing component at `src/components/shared/StatusBadge.tsx`
- **StatusTimeline**: The existing component at `src/components/admin/StatusTimeline.tsx`
- **ProductForm**: The existing form component at `src/components/admin/ProductForm.tsx`
- **formatPrice**: The utility function in `src/lib/utils.ts` that formats integer cents as a currency string
- **Order_Status**: One of `pending | confirmed | processing | shipped | delivered | cancelled | refunded`
- **Soft-delete**: Setting `isActive = false` on a product rather than removing the database row

---

## Requirements

### Requirement 1: Products Table Page

**User Story:** As an admin, I want to view all products in a searchable, filterable table, so that I can quickly find and manage any product in the catalogue.

#### Acceptance Criteria

1. THE Products_Page SHALL render a data table displaying each product's name, category, price (formatted via `formatPrice`), active status, and creation date.
2. WHEN the admin types in the search input, THE Products_Page SHALL filter the table to products whose names match the search string, debounced by 300 ms.
3. WHEN the admin selects a category from the category filter, THE Products_Page SHALL filter the table to products belonging to that category.
4. WHEN the admin selects a status from the status filter (Active / Inactive / All), THE Products_Page SHALL filter the table to products matching that active status.
5. WHILE the Products_Router query is loading, THE Products_Page SHALL render the TableSkeleton component in place of the table.
6. IF the Products_Router query returns an error, THEN THE Products_Page SHALL display an error message and a retry button.
7. THE Products_Page SHALL display a "New Product" button that navigates to `/admin/products/new`.
8. WHEN the admin clicks the edit action for a product row, THE Products_Page SHALL navigate to `/admin/products/[id]/edit`.
9. WHEN the admin clicks the deactivate action for an active product row, THE Products_Page SHALL call `products.delete` (soft-delete), show a success toast on completion, and refresh the table.
10. IF the deactivate mutation fails, THEN THE Products_Page SHALL show an error toast with the failure reason.
11. THE Products_Page SHALL support pagination, displaying 20 products per page with previous/next controls.
12. WHEN the total number of products exceeds the page limit, THE Products_Page SHALL display the current page number and total page count.

---

### Requirement 2: Orders Table Page

**User Story:** As an admin, I want to view all orders in a filterable, searchable table, so that I can monitor order activity and quickly locate specific orders.

#### Acceptance Criteria

1. THE Orders_Page SHALL render a data table displaying each order's order number, customer email, total (formatted via `formatPrice`), order status (via StatusBadge), payment status, and creation date.
2. WHEN the admin selects an order status from the status filter, THE Orders_Page SHALL filter the table to orders matching that status.
3. WHEN the admin enters a date range using the date-from and date-to inputs, THE Orders_Page SHALL filter the table to orders created within that range.
4. WHEN the admin types in the search input, THE Orders_Page SHALL filter the table to orders whose order number or customer email matches the search string, debounced by 300 ms.
5. WHILE the Orders_Router query is loading, THE Orders_Page SHALL render the TableSkeleton component in place of the table.
6. IF the Orders_Router query returns an error, THEN THE Orders_Page SHALL display an error message and a retry button.
7. WHEN the admin clicks a row or a "View" action, THE Orders_Page SHALL navigate to `/admin/orders/[id]`.
8. THE Orders_Page SHALL support pagination, displaying 20 orders per page with previous/next controls.

---

### Requirement 3: Order Detail Page

**User Story:** As an admin, I want to view the full details of an order and update its status, so that I can manage fulfilment and communicate progress to customers.

#### Acceptance Criteria

1. THE Order_Detail_Page SHALL display the order number, customer email, shipping address, subtotal, shipping total, tax total, and order total (all monetary values formatted via `formatPrice`).
2. THE Order_Detail_Page SHALL render the StatusTimeline component showing the order's current status within the full status progression (`pending → confirmed → processing → shipped → delivered`).
3. THE Order_Detail_Page SHALL render a line-items table showing each item's product name, SKU, variant name, quantity, unit price, and line total (formatted via `formatPrice`).
4. THE Order_Detail_Page SHALL render a status-update form containing a status select input, an optional tracking number text input, and a submit button.
5. WHEN the admin submits the status-update form, THE Order_Detail_Page SHALL call `orders.updateStatus`, show a success toast on completion, and refresh the order data.
6. IF the `orders.updateStatus` mutation fails, THEN THE Order_Detail_Page SHALL show an error toast with the failure reason.
7. THE Order_Detail_Page SHALL render a notes section with a textarea and a save button that calls `orders.addNote`.
8. WHEN the admin saves a note, THE Order_Detail_Page SHALL show a success toast and refresh the order data.
9. IF the `orders.addNote` mutation fails, THEN THE Order_Detail_Page SHALL show an error toast with the failure reason.
10. WHILE the Orders_Router `getById` query is loading, THE Order_Detail_Page SHALL render skeleton placeholders matching the layout dimensions of the loaded content.
11. IF the order ID does not correspond to an existing order, THEN THE Order_Detail_Page SHALL render a "Order not found" message and a back link to `/admin/orders`.

---

### Requirement 4: Customers Table Page

**User Story:** As an admin, I want to view all customers in a searchable table, so that I can find and review any customer account.

#### Acceptance Criteria

1. THE Customers_Page SHALL render a data table displaying each customer's name, email, total orders count, total spent (formatted via `formatPrice`), and registration date.
2. WHEN the admin types in the search input, THE Customers_Page SHALL filter the table to customers whose name or email matches the search string, debounced by 300 ms.
3. WHILE the Customers_Router query is loading, THE Customers_Page SHALL render the TableSkeleton component in place of the table.
4. IF the Customers_Router query returns an error, THEN THE Customers_Page SHALL display an error message and a retry button.
5. WHEN the admin clicks a row or a "View" action, THE Customers_Page SHALL navigate to `/admin/customers/[id]`.
6. THE Customers_Page SHALL support pagination, displaying 20 customers per page with previous/next controls.

---

### Requirement 5: Customer Detail Page

**User Story:** As an admin, I want to view a customer's profile and their full order history, so that I can understand their purchasing behaviour and provide support.

#### Acceptance Criteria

1. THE Customer_Detail_Page SHALL display the customer's name, email, phone number, total orders count, and total spent (formatted via `formatPrice`).
2. THE Customer_Detail_Page SHALL render an order history table showing each of the customer's orders with order number, status (via StatusBadge), total (formatted via `formatPrice`), and creation date.
3. WHEN the admin clicks an order row in the history table, THE Customer_Detail_Page SHALL navigate to `/admin/orders/[id]`.
4. WHILE the Customers_Router `getById` query is loading, THE Customer_Detail_Page SHALL render skeleton placeholders matching the layout dimensions of the loaded content.
5. IF the customer ID does not correspond to an existing customer, THEN THE Customer_Detail_Page SHALL render a "Customer not found" message and a back link to `/admin/customers`.
6. IF the customer has no orders, THEN THE Customer_Detail_Page SHALL display an empty-state message in place of the order history table.

---

### Requirement 6: Admin Panel Design Consistency

**User Story:** As an admin, I want all admin pages to look and behave consistently, so that the panel feels cohesive and professional.

#### Acceptance Criteria

1. THE Admin_Panel SHALL apply the Fraviont design system on all new pages: `#0A0A0A` background, `#F5F0E8` ivory text, `#C9A84C` gold accent, Cormorant Garamond display headings, Jost body font, and `rounded-none` interactive elements.
2. THE Admin_Panel SHALL use dark shimmer skeletons (`#1a1a1a → #222222`, `rounded-none`) on all loading states, with staggered `animation-delay` on multi-row skeletons.
3. THE Admin_Panel SHALL protect all new pages and mutations with `adminProcedure`, ensuring unauthenticated or non-admin requests receive an UNAUTHORIZED error.
4. WHEN a mutation succeeds, THE Admin_Panel SHALL display a success toast via `react-hot-toast`.
5. WHEN a mutation fails, THE Admin_Panel SHALL display an error toast via `react-hot-toast` containing the failure reason.
6. THE Admin_Panel SHALL use the `"use client"` directive only on components that require event handlers, React hooks, or browser APIs; all other components SHALL be Server Components.
