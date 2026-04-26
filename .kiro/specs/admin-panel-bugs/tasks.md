# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Admin Panel Real-Time Updates, Product Operations, UI Styling, and Currency Display
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope properties to concrete failing cases to ensure reproducibility
  
  - [x] 1.1 Real-time update exploration test
    - Test that dashboard page does NOT auto-refresh KPI data after 60 seconds on unfixed code
    - Test that customers page does NOT auto-refresh customer list after 60 seconds on unfixed code
    - Test that analytics Finance tab does NOT auto-refresh financial data after 60 seconds on unfixed code
    - Simulate data changes (new orders, customer registrations) and verify pages show stale data
    - Run test on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms no auto-refresh mechanism exists)
    - Document counterexamples: specific pages and data that remain stale
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 1.2 Product create operation exploration test
    - Test that creating a product with variants fails to persist variants on unfixed code
    - Create product "Test Product" with 3 variants (50ml, 100ml, 200ml)
    - Query database for product and variants
    - Run test on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (product exists but variants table is empty)
    - Document counterexamples: products created without variants
    - _Requirements: 1.5_
  
  - [x] 1.3 Product update operation exploration test
    - Test that updating a product with new variants fails to synchronize variants on unfixed code
    - Update existing product with modified variant data
    - Query database for updated variants
    - Run test on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (product updated but variants unchanged)
    - Document counterexamples: variant updates that don't persist
    - _Requirements: 1.4_
  
  - [x] 1.4 Product deactivate operation exploration test
    - Test that clicking "Deactivate" removes product from database instead of soft delete on unfixed code
    - Deactivate an active product
    - Query database for product record and isActive status
    - Run test on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS if hard delete occurs (product not found) or PASSES if soft delete already works
    - Document counterexamples: products that are hard-deleted vs soft-deleted
    - _Requirements: 1.6_
  
  - [x] 1.5 UI styling exploration test
    - Test that category dropdown options have malformed attributes on unfixed code
    - Render ProductForm component
    - Inspect category dropdown option elements
    - Verify className attribute presence and value attribute content
    - Run test on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (className not applied, value contains "bg-black")
    - Document counterexamples: option elements with incorrect attribute structure
    - _Requirements: 1.7_
  
  - [x] 1.6 Currency display exploration test
    - Test that changing currency setting does not propagate to formatPrice output on unfixed code
    - Change currency setting from ZAR to USD in settings
    - Call formatPrice(285, 'USD') and verify output
    - Check dashboard KPI cards and analytics displays
    - Run test on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (formatPrice returns "R2.85" instead of "$2.85")
    - Document counterexamples: currency changes that don't affect displays
    - _Requirements: 1.8, 1.9_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Admin Operations
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  
  - [x] 2.1 Authentication preservation test
    - Observe: Admin routes require authentication on unfixed code
    - Write property-based test: for all admin routes, unauthenticated requests are redirected to login
    - Verify test passes on UNFIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms baseline authentication behavior)
    - _Requirements: 3.4_
  
  - [x] 2.2 Caching preservation test
    - Observe: Analytics queries use Redis caching on unfixed code
    - Write property-based test: for all analytics queries, cache keys are used and cache hits return correct data
    - Verify test passes on UNFIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms baseline caching behavior)
    - _Requirements: 3.7, 3.8_
  
  - [x] 2.3 Pagination preservation test
    - Observe: Product, customer, and order tables paginate correctly on unfixed code
    - Write property-based test: for all paginated tables, page numbers calculate correctly and navigation works
    - Verify test passes on UNFIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms baseline pagination behavior)
    - _Requirements: 3.6_
  
  - [x] 2.4 Search and filter preservation test
    - Observe: Search and filter functionality returns accurate results on unfixed code
    - Write property-based test: for all search/filter operations, results match query criteria
    - Verify test passes on UNFIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms baseline search/filter behavior)
    - _Requirements: 3.5_
  
  - [x] 2.5 Data integrity preservation test
    - Observe: Product-variant relationships maintain referential integrity on unfixed code
    - Write property-based test: for all product operations, foreign key constraints are enforced
    - Verify test passes on UNFIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms baseline data integrity)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 2.6 Manual refresh preservation test
    - Observe: Manual page refresh (browser refresh button) loads fresh data on unfixed code
    - Write property-based test: for all admin pages, manual refresh fetches current data
    - Verify test passes on UNFIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms baseline manual refresh behavior)
    - _Requirements: 3.1-3.8_
  
  - [x] 2.7 Non-product mutations preservation test
    - Observe: Order, customer, and settings mutations work correctly on unfixed code
    - Write property-based test: for all non-product mutations, operations succeed and data persists
    - Verify test passes on UNFIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms baseline mutation behavior)
    - _Requirements: 3.1-3.8_

- [x] 3. Implement fixes for admin panel bugs

  - [x] 3.1 Fix real-time updates for dashboard page
    - Convert `src/app/admin/(dashboard)/dashboard/page.tsx` to client component
    - Add `"use client"` directive at top of file
    - Move data fetching from server-side `await` to client-side `useQuery`
    - Implement `useEffect` hook with `setInterval` to call `refetch()` every 30 seconds
    - Add cleanup function to clear interval on component unmount
    - _Bug_Condition: isBugCondition_RealTime(input) where input.page = 'dashboard' AND input.timeElapsed > 0 AND input.dataChanged AND NOT autoRefreshEnabled_
    - _Expected_Behavior: Dashboard KPI data auto-refreshes every 30 seconds showing current revenue, orders, and stock alerts_
    - _Preservation: Authentication checks, caching strategy, manual refresh, initial load behavior_
    - _Requirements: 1.1, 2.1, 3.4, 3.7, 3.8_
  
  - [x] 3.2 Fix real-time updates for customers page
    - Add `useEffect` hook to `src/app/admin/(dashboard)/customers/page.tsx`
    - Implement `setInterval` to call `refetch()` from `api.customers.getAll.useQuery` every 60 seconds
    - Add cleanup function to clear interval on component unmount
    - _Bug_Condition: isBugCondition_RealTime(input) where input.page = 'customers' AND input.timeElapsed > 0 AND input.dataChanged AND NOT autoRefreshEnabled_
    - _Expected_Behavior: Customer list auto-refreshes every 60 seconds showing new registrations and updated data_
    - _Preservation: Authentication checks, pagination, search/filter functionality_
    - _Requirements: 1.2, 2.2, 3.4, 3.5, 3.6_
  
  - [x] 3.3 Fix real-time updates for analytics Finance tab
    - Add `useEffect` hook to `src/app/admin/(dashboard)/analytics/page.tsx`
    - Implement conditional `setInterval` that only runs when `activeTab === "Finance"`
    - Call `refetch()` on `api.analytics.getPnL.useQuery` every 30 seconds
    - Add cleanup function to clear interval on component unmount or tab change
    - _Bug_Condition: isBugCondition_RealTime(input) where input.page = 'analytics-finance' AND input.timeElapsed > 0 AND input.dataChanged AND NOT autoRefreshEnabled_
    - _Expected_Behavior: Financial data auto-refreshes every 30 seconds showing current revenue, expenses, and profit_
    - _Preservation: Redis caching for analytics queries, tab navigation, manual refresh_
    - _Requirements: 1.3, 2.3, 3.7, 3.8_
  
  - [x] 3.4 Fix product create mutation to persist variants
    - Update `create` mutation in `src/server/api/routers/products.ts`
    - Wrap product and variant insertion in database transaction
    - Ensure variants are inserted with correct productId reference
    - Add error handling to rollback product creation if variant insertion fails
    - Verify transaction atomicity (all or nothing)
    - _Bug_Condition: isBugCondition_ProductOps(input) where input.operation = 'create' AND input.hasVariants_
    - _Expected_Behavior: Product and all variants successfully inserted into database atomically_
    - _Preservation: Data integrity, referential integrity between products and variants_
    - _Requirements: 1.5, 2.5, 3.1_
  
  - [x] 3.5 Fix product update mutation to synchronize variants
    - Update `update` mutation in `src/server/api/routers/products.ts`
    - Wrap update logic in database transaction
    - After updating product, delete existing variants: `await db.delete(productVariants).where(eq(productVariants.productId, id))`
    - Insert new variants if provided: `await db.insert(productVariants).values(variants.map(v => ({ ...v, productId: id })))`
    - Add error handling to rollback on failure
    - _Bug_Condition: isBugCondition_ProductOps(input) where input.operation = 'update' AND input.hasVariants AND input.productExists_
    - _Expected_Behavior: Product updated and variants synchronized (old removed, new inserted) atomically_
    - _Preservation: Data integrity, cache invalidation on mutations_
    - _Requirements: 1.4, 2.4, 3.1, 3.8_
  
  - [x] 3.6 Verify product delete mutation uses soft delete
    - Review `delete` mutation in `src/server/api/routers/products.ts`
    - Confirm mutation uses `db.update().set({ isActive: false })` not `db.delete()`
    - If hard delete is found, replace with soft delete
    - Verify frontend calls correct mutation endpoint
    - Test that deactivated products remain in database with isActive=false
    - _Bug_Condition: isBugCondition_ProductOps(input) where input.operation = 'delete' AND input.productExists_
    - _Expected_Behavior: Product isActive set to false, record remains in database with all relationships intact_
    - _Preservation: Historical order data referencing product, referential integrity_
    - _Requirements: 1.6, 2.6, 3.3_
  
  - [x] 3.7 Fix category dropdown styling in ProductForm
    - Update `src/components/admin/ProductForm.tsx` lines 289-292
    - Move `bg-black` from value attribute to className attribute
    - Change `<option value="perfumes bg-black">Perfumes</option>` to `<option value="perfumes" className="bg-black">Perfumes</option>`
    - Apply fix to all four category options: perfumes, cosmetics, jewelry, gift_sets
    - Verify dropdown renders with proper dark background and text contrast
    - _Bug_Condition: isBugCondition_UIStyle(input) where input.component = 'ProductForm' AND input.element = 'category-dropdown-option' AND optionValueContainsClassName_
    - _Expected_Behavior: Dropdown options display with dark background (bg-black class) for proper contrast and readability_
    - _Preservation: Form validation, product creation/update functionality, other form fields_
    - _Requirements: 1.7, 2.7, 3.1_
  
  - [x] 3.8 Make formatPrice utility support dynamic currency
    - Update `formatPrice` function in `src/lib/utils.ts`
    - Add optional `currency` parameter with default value 'ZAR'
    - Create currency symbol mapping: `{ 'ZAR': 'R', 'USD': '$', 'EUR': '€', 'GBP': '£', 'PKR': '₨' }`
    - Update return statement to use dynamic symbol: `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
    - _Bug_Condition: isBugCondition_Currency(input) where input.settingsCurrency != 'ZAR' AND input.displayedCurrency = 'ZAR' AND formatPriceIsHardcoded_
    - _Expected_Behavior: formatPrice accepts currency parameter and returns correctly formatted string with appropriate symbol_
    - _Preservation: For ZAR currency (default), output must be identical to original function_
    - _Requirements: 1.8, 1.9, 2.8, 2.9, 3.2_
  
  - [x] 3.9 Update dashboard KPI cards to use dynamic currency
    - Identify all KPI card components in dashboard that display monetary values
    - Add tRPC query to fetch currency from settings: `api.settings.get.useQuery()`
    - Pass currency value to `formatPrice` calls: `formatPrice(cents, settings.currency)`
    - Verify KPI cards update when currency setting changes
    - _Bug_Condition: isBugCondition_Currency(input) where currency setting changed but dashboard displays old currency_
    - _Expected_Behavior: Dashboard KPI cards immediately reflect new currency format after settings update_
    - _Preservation: KPI calculation logic, data fetching, caching behavior_
    - _Requirements: 1.8, 2.8, 3.7, 3.8_
  
  - [x] 3.10 Update analytics displays to use dynamic currency
    - Identify all analytics components that display monetary values (revenue charts, profit displays)
    - Add tRPC query to fetch currency from settings: `api.settings.get.useQuery()`
    - Pass currency value to `formatPrice` calls in analytics components
    - Update chart labels and tooltips to use dynamic currency
    - Verify analytics displays update when currency setting changes
    - _Bug_Condition: isBugCondition_Currency(input) where currency setting changed but analytics displays old currency_
    - _Expected_Behavior: Analytics revenue displays and charts immediately reflect new currency format after settings update_
    - _Preservation: Analytics calculations, Redis caching, chart rendering logic_
    - _Requirements: 1.9, 2.9, 3.7, 3.8_

  - [x] 3.11 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Admin Panel Fixes Validated
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    
    - [x] 3.11.1 Re-run real-time update test
      - Run test from task 1.1 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (dashboard, customers, analytics auto-refresh within configured intervals)
      - _Requirements: 2.1, 2.2, 2.3_
    
    - [x] 3.11.2 Re-run product create test
      - Run test from task 1.2 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (product and variants both persisted)
      - _Requirements: 2.5_
    
    - [x] 3.11.3 Re-run product update test
      - Run test from task 1.3 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (product and variants synchronized)
      - _Requirements: 2.4_
    
    - [x] 3.11.4 Re-run product deactivate test
      - Run test from task 1.4 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (product soft-deleted with isActive=false)
      - _Requirements: 2.6_
    
    - [x] 3.11.5 Re-run UI styling test
      - Run test from task 1.5 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (dropdown options have correct className)
      - _Requirements: 2.7_
    
    - [x] 3.11.6 Re-run currency display test
      - Run test from task 1.6 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (formatPrice returns correct currency format)
      - _Requirements: 2.8, 2.9_

  - [x] 3.12 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Operations Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    
    - [x] 3.12.1 Re-run authentication preservation test
      - Run test from task 2.1 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (authentication still works)
      - _Requirements: 3.4_
    
    - [x] 3.12.2 Re-run caching preservation test
      - Run test from task 2.2 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (Redis caching still works)
      - _Requirements: 3.7, 3.8_
    
    - [x] 3.12.3 Re-run pagination preservation test
      - Run test from task 2.3 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (pagination still works)
      - _Requirements: 3.6_
    
    - [x] 3.12.4 Re-run search and filter preservation test
      - Run test from task 2.4 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (search/filter still works)
      - _Requirements: 3.5_
    
    - [x] 3.12.5 Re-run data integrity preservation test
      - Run test from task 2.5 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (referential integrity maintained)
      - _Requirements: 3.1, 3.2, 3.3_
    
    - [x] 3.12.6 Re-run manual refresh preservation test
      - Run test from task 2.6 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (manual refresh still works)
      - _Requirements: 3.1-3.8_
    
    - [x] 3.12.7 Re-run non-product mutations preservation test
      - Run test from task 2.7 on FIXED code
      - **EXPECTED OUTCOME**: Test PASSES (other mutations still work)
      - _Requirements: 3.1-3.8_

- [x] 4. Checkpoint - Ensure all tests pass
  - Verify all bug condition exploration tests pass (task 3.11)
  - Verify all preservation tests pass (task 3.12)
  - Run full test suite to catch any regressions
  - Test manually in browser: dashboard auto-refresh, product CRUD with variants, category dropdown styling, currency changes
  - Ask the user if questions arise or if additional testing is needed
