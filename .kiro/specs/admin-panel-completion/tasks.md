# Implementation Plan: Admin Panel Completion

## Overview

Complete the Fraviont admin panel by implementing the Products, Orders, and Customers management pages. All tRPC procedures are already implemented in the routers — this is purely UI work. The implementation follows the Fraviont design system (dark luxury aesthetic with #0A0A0A background, #F5F0E8 ivory text, #C9A84C gold accent) and project rules (TypeScript strict, Server Components first, adminProcedure protection, loading skeletons, toast feedback).

## Tasks

- [x] 1. Implement Products Table Page
  - [x] 1.1 Replace `src/app/admin/(dashboard)/products/page.tsx` stub with full implementation
    - Create a `"use client"` component that uses `api.products.getAll.useQuery`
    - Implement search input with 300ms debounce using a custom `useDebounce` hook or library
    - Implement category filter dropdown (All / Perfumes / Cosmetics / Jewelry / Gift Sets)
    - Implement status filter dropdown (All / Active / Inactive)
    - Implement pagination controls (20 products per page) with previous/next buttons and page count display
    - Render shadcn Table with columns: thumbnail image, name, category, price (via `formatPrice`), active status badge, createdAt (via `formatDate`), actions (Edit button, Deactivate button)
    - Wire Edit button to navigate to `/admin/products/[id]/edit`
    - Wire Deactivate button to call `api.products.delete.useMutation()` with confirmation, show success/error toast, refetch on success
    - Render `<TableSkeleton rows={20} cols={7} />` while `isPending` is true
    - Render error state with retry button if query fails
    - Add "New Product" button in header that navigates to `/admin/products/new`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12_

  - [x] 1.2 Create product edit page at `src/app/admin/(dashboard)/products/[id]/edit/page.tsx`
    - Create a Server Component that fetches the product via `api.products.getById` using the tRPC server caller
    - Wrap the `ProductForm` component in `<Suspense fallback={<div>Loading...</div>}>`
    - Pass the fetched product data to `ProductForm` as a prop
    - Handle not-found case: if product is null, render "Product not found" message with back link to `/admin/products`
    - _Requirements: 1.8_

- [x] 2. Implement Orders Table Page
  - [x] 2.1 Replace `src/app/admin/(dashboard)/orders/page.tsx` stub with full implementation
    - Create a `"use client"` component that uses `api.orders.getAll.useQuery`
    - Implement status filter dropdown (All / Pending / Confirmed / Processing / Shipped / Delivered / Cancelled / Refunded)
    - Implement date range filters with two date inputs (dateFrom, dateTo)
    - Implement search input with 300ms debounce for order number or customer email
    - Implement pagination controls (20 orders per page)
    - Render shadcn Table with columns: order number, customer email, total (via `formatPrice`), order status (via `StatusBadge`), payment status, createdAt (via `formatDate`), View button
    - Wire View button to navigate to `/admin/orders/[id]`
    - Render `<TableSkeleton rows={20} cols={7} />` while `isPending` is true
    - Render error state with retry button if query fails
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 3. Implement Order Detail Page
  - [x] 3.1 Create order detail page at `src/app/admin/(dashboard)/orders/[id]/page.tsx`
    - Create a `"use client"` component that uses `api.orders.getById.useQuery` with the order ID from params
    - Render order summary section: order number, customer email, shipping address (formatted), subtotal/shipping/tax/total (all via `formatPrice`)
    - Render `StatusTimeline` component passing the current order status
    - Render line items table using shadcn Table: columns are product name, SKU, variant name, quantity, unit price (via `formatPrice`), line total (via `formatPrice`)
    - Render status update form: shadcn Select for status, text input for tracking number (optional), submit button
    - Wire status update form to `api.orders.updateStatus.useMutation()`, show success/error toast, refetch order on success
    - Render notes section: textarea for note input, save button
    - Wire notes save button to `api.orders.addNote.useMutation()`, show success/error toast, refetch order on success
    - Render skeleton placeholders while `isPending` is true (use multiple `<div className="skeleton h-8 w-full" />` elements matching layout)
    - Handle not-found case: if order is null, render "Order not found" message with back link to `/admin/orders`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

- [x] 4. Implement Customers Table Page
  - [x] 4.1 Replace `src/app/admin/(dashboard)/customers/page.tsx` stub with full implementation
    - Create a `"use client"` component that uses `api.customers.getAll.useQuery`
    - Implement search input with 300ms debounce for customer name or email
    - Implement pagination controls (20 customers per page)
    - Render shadcn Table with columns: name, email, total orders count, total spent (via `formatPrice`), createdAt (via `formatDate`), View button
    - Wire View button to navigate to `/admin/customers/[id]`
    - Render `<TableSkeleton rows={20} cols={6} />` while `isPending` is true
    - Render error state with retry button if query fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 5. Implement Customer Detail Page
  - [x] 5.1 Create customer detail page at `src/app/admin/(dashboard)/customers/[id]/page.tsx`
    - Create a `"use client"` component that uses `api.customers.getById.useQuery` with the customer ID from params
    - Render customer profile section: name, email, phone, total orders count, total spent (via `formatPrice`)
    - Render order history table using shadcn Table: columns are order number (clickable link to `/admin/orders/[id]`), status (via `StatusBadge`), total (via `formatPrice`), createdAt (via `formatDate`)
    - Wire order number links to navigate to `/admin/orders/[id]`
    - Render skeleton placeholders while `isPending` is true
    - Handle not-found case: if customer is null, render "Customer not found" message with back link to `/admin/customers`
    - Handle empty orders case: if customer.orders is empty, render "No orders yet" empty state message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Design Consistency & Polish
  - [x] 6.1 Verify all pages follow Fraviont design system
    - Confirm all pages use `#0A0A0A` background, `#F5F0E8` ivory text, `#C9A84C` gold accent
    - Confirm all headings use Cormorant Garamond font (`font-display`)
    - Confirm all body text uses Jost font (`font-sans`)
    - Confirm all interactive elements use `rounded-none` or `rounded-sm` (never pill-shaped)
    - Confirm all buttons and inputs follow the dark luxury theme with proper hover states
    - _Requirements: 6.1_

  - [x] 6.2 Verify all loading states use dark shimmer skeletons
    - Confirm all table loading states use `<TableSkeleton />` with correct row/col counts
    - Confirm all skeletons use the dark shimmer style (`#1a1a1a → #222222`)
    - Confirm all skeletons use `rounded-none`
    - Confirm multi-row skeletons have staggered `animation-delay`
    - _Requirements: 6.2_

  - [x] 6.3 Verify all mutations show toast feedback
    - Confirm all successful mutations show success toast via `react-hot-toast`
    - Confirm all failed mutations show error toast with failure reason
    - Confirm all toasts follow the dark theme styling
    - _Requirements: 6.4, 6.5_

  - [x] 6.4 Verify Server Component vs Client Component usage
    - Confirm only components with event handlers, hooks, or browser APIs use `"use client"`
    - Confirm all data-fetching-only components are Server Components where possible
    - _Requirements: 6.6_

- [ ] 7. Final Testing & Validation
  - [x] 7.1 Run TypeScript compilation check
    - Run `pnpm tsc --noEmit` and confirm zero errors
    - Fix any type errors that appear

  - [x] 7.2 Test all CRUD operations
    - Test product search, filtering, pagination, edit navigation, deactivate action
    - Test order search, filtering, pagination, view navigation
    - Test order detail status update, notes save
    - Test customer search, pagination, view navigation
    - Test customer detail order history navigation

  - [x] 7.3 Test all error states
    - Test network error handling on all pages
    - Test not-found states on detail pages
    - Test empty states where applicable

  - [x] 7.4 Test all loading states
    - Verify skeletons appear correctly on all pages during loading
    - Verify skeleton dimensions match loaded content (no layout shift)
