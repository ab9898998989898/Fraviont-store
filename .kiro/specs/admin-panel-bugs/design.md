# Admin Panel Bugs Bugfix Design

## Overview

This design addresses eight critical bugs in the admin panel affecting real-time data updates, product management operations, UI styling consistency, and currency display. The bugs manifest across multiple admin pages (dashboard, customers, analytics, products, settings) and impact the admin user experience by showing stale data, preventing product CRUD operations from working correctly, and causing visual inconsistencies.

The fix approach involves:
1. **Real-time updates**: Implementing automatic data refresh using tRPC's `refetch` with `setInterval` for dashboard, customers, and analytics pages
2. **Product mutations**: Fixing the product create/update mutations to properly handle variants and fixing the delete mutation to use soft delete
3. **UI styling**: Correcting the category dropdown options to include proper background classes
4. **Currency formatting**: Creating a dynamic `formatPrice` utility that reads currency from settings and applies it globally

## Glossary

- **Bug_Condition (C)**: The conditions that trigger each of the 8 bugs - when admins view pages without auto-refresh, when product operations fail, when UI elements have incorrect styling, when currency changes don't propagate
- **Property (P)**: The desired behavior - pages auto-refresh data, product operations succeed, UI elements display correctly, currency changes apply immediately
- **Preservation**: Existing functionality that must remain unchanged - authentication, caching strategy, pagination, search/filter logic, data integrity
- **tRPC refetch**: The method to manually trigger a query re-execution to fetch fresh data from the server
- **Soft delete**: Setting `isActive: false` instead of removing database records, preserving referential integrity
- **formatPrice**: Utility function in `src/lib/utils.ts` that converts integer cents to formatted currency string
- **storeSettings**: Database table containing store configuration including currency preference

## Bug Details

### Bug Condition

The bugs manifest in multiple distinct scenarios across the admin panel:

**Real-Time Update Bugs (Bugs 1.1, 1.2, 1.3):**
The bug manifests when an admin views the dashboard, customers, or analytics Finance tab and underlying data changes (new orders, customer registrations, payment updates). The pages are client components using tRPC queries but do not implement automatic refetching, causing stale data to persist until manual page refresh.

**Formal Specification:**
```
FUNCTION isBugCondition_RealTime(input)
  INPUT: input of type { page: string, timeElapsed: number, dataChanged: boolean }
  OUTPUT: boolean
  
  RETURN input.page IN ['dashboard', 'customers', 'analytics-finance']
         AND input.timeElapsed > 0
         AND input.dataChanged
         AND NOT autoRefreshEnabled(input.page)
END FUNCTION
```

**Product Management Bugs (Bugs 1.4, 1.5, 1.6):**
The bug manifests when an admin attempts to create a new product, update an existing product, or deactivate a product. The create/update mutations in `src/server/api/routers/products.ts` fail to properly handle variant updates, and the delete mutation removes records instead of soft-deleting.

**Formal Specification:**
```
FUNCTION isBugCondition_ProductOps(input)
  INPUT: input of type { operation: string, hasVariants: boolean, productExists: boolean }
  OUTPUT: boolean
  
  RETURN (input.operation == 'create' AND input.hasVariants)
         OR (input.operation == 'update' AND input.hasVariants AND input.productExists)
         OR (input.operation == 'delete' AND input.productExists)
END FUNCTION
```

**UI Styling Bug (Bug 1.7):**
The bug manifests when an admin views the category dropdown in the ProductForm component. The `<option>` elements have malformed class attributes where "bg-black" is included in the value attribute instead of the className attribute.

**Formal Specification:**
```
FUNCTION isBugCondition_UIStyle(input)
  INPUT: input of type { component: string, element: string }
  OUTPUT: boolean
  
  RETURN input.component == 'ProductForm'
         AND input.element == 'category-dropdown-option'
         AND optionValueContainsClassName(input.element)
END FUNCTION
```

**Currency Display Bugs (Bugs 1.8, 1.9):**
The bug manifests when an admin updates the currency setting in the Settings page. The `formatPrice` utility is hardcoded to use "R" (ZAR) and does not read from the settings table, causing currency changes to not propagate to dashboard KPIs or analytics displays.

**Formal Specification:**
```
FUNCTION isBugCondition_Currency(input)
  INPUT: input of type { settingsCurrency: string, displayedCurrency: string }
  OUTPUT: boolean
  
  RETURN input.settingsCurrency != 'ZAR'
         AND input.displayedCurrency == 'ZAR'
         AND formatPriceIsHardcoded()
END FUNCTION
```

### Examples

**Real-Time Update Examples:**
- Admin views dashboard at 9:00 AM showing R10,000 revenue. New order for R500 placed at 9:05 AM. Dashboard still shows R10,000 at 9:10 AM (expected: R10,500)
- Admin views customers page showing 50 customers. New customer registers. Customers page still shows 50 customers (expected: 51 customers)
- Admin views analytics Finance tab showing R50,000 profit. Payment status changes. Finance tab still shows R50,000 (expected: updated profit)

**Product Management Examples:**
- Admin creates new product "Midnight Rose" with 3 variants (50ml, 100ml, 200ml). Product created but variants not saved (expected: product + 3 variants in database)
- Admin updates product "Ocean Breeze" changing price and adding variant. Update fails with error (expected: product updated with new variant)
- Admin clicks "Deactivate" on product "Sunset Gold". Product completely removed from database (expected: product.isActive set to false, product remains in database)

**UI Styling Example:**
- Admin opens product form and clicks category dropdown. Options display with white background making text unreadable (expected: dark background with proper contrast)

**Currency Display Examples:**
- Admin changes currency from ZAR to USD in Settings. Dashboard KPIs still show "R285.00" format (expected: "$2.85" format)
- Admin changes currency to EUR. Analytics revenue chart still shows "R" prefix (expected: "€" prefix)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Authentication and authorization checks must continue to work for all admin routes
- Redis caching strategy for analytics queries must remain unchanged to maintain performance
- Pagination logic must continue to work correctly for products, customers, and orders tables
- Search and filter functionality must continue to return accurate results
- Database referential integrity between products, variants, and orders must be maintained
- All non-admin pages (store frontend) must be completely unaffected by admin panel changes
- Existing tRPC query cache invalidation on mutations must continue to work
- Product image upload and preview functionality must remain unchanged
- AI-generated descriptions and SEO must continue to work
- Form validation rules must remain unchanged

**Scope:**
All inputs and operations that do NOT involve the specific bug conditions should be completely unaffected by this fix. This includes:
- Manual page refreshes (browser refresh button)
- Initial page loads and data fetching
- Non-product mutations (orders, customers, settings)
- Static UI elements that don't depend on currency
- Server-side rendered pages
- API routes outside the admin panel

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

### Real-Time Update Bugs (1.1, 1.2, 1.3)

1. **Missing Auto-Refresh Logic**: The dashboard, customers, and analytics pages are client components using tRPC queries but do not implement `useEffect` with `setInterval` to call `refetch()` periodically
   - `src/app/admin/(dashboard)/dashboard/page.tsx` is server-rendered but child components don't auto-refresh
   - `src/app/admin/(dashboard)/customers/page.tsx` uses `api.customers.getAll.useQuery` but never calls `refetch()`
   - `src/app/admin/(dashboard)/analytics/page.tsx` uses `api.analytics.getPnL.useQuery` but never calls `refetch()`

2. **No Polling Mechanism**: React Query (used by tRPC) supports `refetchInterval` option but it's not configured in any of the affected queries

### Product Management Bugs (1.4, 1.5, 1.6)

1. **Variant Update Logic Missing**: The `update` mutation in `src/server/api/routers/products.ts` only updates the product table but doesn't handle variant updates
   - When updating a product with variants, the mutation needs to delete existing variants and insert new ones
   - Currently only updates the product row, ignoring the variants array

2. **Create Mutation Incomplete**: The `create` mutation inserts variants but may not be handling all edge cases correctly
   - Need to verify transaction handling to ensure product and variants are created atomically

3. **Hard Delete Instead of Soft Delete**: The `delete` mutation uses `db.update().set({ isActive: false })` which is correct, but the issue description says it's removing records
   - Possible issue: The mutation might be calling the wrong method or there's a different delete endpoint being used
   - Need to verify the actual mutation being called from the frontend

### UI Styling Bug (1.7)

1. **Malformed Option Attributes**: In `src/components/admin/ProductForm.tsx` line 289-292, the category dropdown options have the class name included in the value attribute:
   ```tsx
   <option value="perfumes bg-black">Perfumes</option>
   ```
   Should be:
   ```tsx
   <option value="perfumes" className="bg-black">Perfumes</option>
   ```

### Currency Display Bugs (1.8, 1.9)

1. **Hardcoded Currency Symbol**: The `formatPrice` function in `src/lib/utils.ts` line 13 hardcodes the "R" symbol:
   ```typescript
   return `R${rands.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
   ```
   - Does not read from `storeSettings.currency`
   - Does not support multiple currency formats

2. **No Currency Context**: There's no React context or global state to provide currency settings to components
   - Each component calling `formatPrice` has no way to pass currency preference
   - Need to either make `formatPrice` async to fetch settings or create a currency context provider

## Correctness Properties

Property 1: Bug Condition - Real-Time Data Updates

_For any_ admin page view where the page is one of [dashboard, customers, analytics-finance] and underlying data changes after initial load, the fixed page SHALL automatically refetch and display updated data within the configured refresh interval (30-60 seconds), without requiring manual page refresh.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Product Create Operations

_For any_ product creation request where the admin provides valid product data including variants, the fixed create mutation SHALL successfully insert both the product record and all associated variant records into the database, returning the created product with variants.

**Validates: Requirements 2.5**

Property 3: Bug Condition - Product Update Operations

_For any_ product update request where the admin modifies product data or variants, the fixed update mutation SHALL successfully update the product record and synchronize all variant records (adding new, updating existing, removing deleted), persisting all changes to the database.

**Validates: Requirements 2.4**

Property 4: Bug Condition - Product Deactivate Operations

_For any_ product deactivation request where the admin clicks "Deactivate" on an active product, the fixed delete mutation SHALL set the product's isActive field to false without removing the product or its variants from the database, preserving all historical data and relationships.

**Validates: Requirements 2.6**

Property 5: Bug Condition - UI Styling Correctness

_For any_ rendering of the category dropdown in the product form, the fixed component SHALL display all option elements with proper className attributes (bg-black) applied to the option tags, not included in the value attribute, ensuring proper dark background and text contrast.

**Validates: Requirements 2.7**

Property 6: Bug Condition - Currency Display Updates

_For any_ currency setting change where the admin updates the currency in Settings, the fixed formatPrice utility SHALL immediately read the new currency from settings and apply the correct currency symbol and format to all monetary displays across dashboard KPIs and analytics pages.

**Validates: Requirements 2.8, 2.9**

Property 7: Preservation - Non-Buggy Operations

_For any_ admin operation that does NOT involve the specific bug conditions (real-time updates, product mutations, category dropdown, currency changes), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality for authentication, caching, pagination, search, filtering, and other admin features.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

#### Real-Time Update Fixes (Bugs 1.1, 1.2, 1.3)

**File**: `src/app/admin/(dashboard)/dashboard/page.tsx`

**Function**: `DashboardData` component

**Specific Changes**:
1. **Convert to Client Component**: Change from server component to client component to enable `useEffect` and `setInterval`
   - Add `"use client"` directive at top of file
   - Move data fetching from server-side `await` to client-side `useQuery`

2. **Implement Auto-Refresh**: Add `useEffect` hook with `setInterval` to call `refetch()` every 30 seconds
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       refetch();
     }, 30000);
     return () => clearInterval(interval);
   }, [refetch]);
   ```

**File**: `src/app/admin/(dashboard)/customers/page.tsx`

**Function**: `CustomersPage` component

**Specific Changes**:
1. **Add Auto-Refresh**: Implement `useEffect` with `setInterval` to call `refetch()` every 60 seconds
   - Use existing `refetch` from `api.customers.getAll.useQuery`
   - Set interval to 60000ms (60 seconds)

**File**: `src/app/admin/(dashboard)/analytics/page.tsx`

**Function**: `AdminAnalyticsPage` component

**Specific Changes**:
1. **Add Finance Tab Auto-Refresh**: Implement `useEffect` that only runs when `activeTab === "Finance"` to call `refetch()` on `pnl` query every 30 seconds
   - Use existing `refetch` from `api.analytics.getPnL.useQuery`
   - Conditional interval based on active tab

#### Product Management Fixes (Bugs 1.4, 1.5, 1.6)

**File**: `src/server/api/routers/products.ts`

**Function**: `update` mutation

**Specific Changes**:
1. **Add Variant Synchronization**: After updating product, synchronize variants
   ```typescript
   // Delete existing variants
   await db.delete(productVariants).where(eq(productVariants.productId, id));
   
   // Insert new variants if provided
   if (variants && variants.length > 0) {
     await db.insert(productVariants).values(
       variants.map((v) => ({ ...v, productId: id }))
     );
   }
   ```

2. **Wrap in Transaction**: Use database transaction to ensure atomicity
   ```typescript
   await db.transaction(async (tx) => {
     // Update product
     // Delete old variants
     // Insert new variants
   });
   ```

**Function**: `create` mutation

**Specific Changes**:
1. **Verify Transaction Handling**: Ensure product and variants are created atomically
   - Add error handling for variant insertion failures
   - Rollback product creation if variant insertion fails

**Function**: `delete` mutation

**Specific Changes**:
1. **Verify Soft Delete**: The current implementation already uses soft delete (`set({ isActive: false })`), but verify this is the mutation being called from frontend
   - Check if there's a different delete endpoint being used
   - Ensure frontend is calling the correct mutation

#### UI Styling Fix (Bug 1.7)

**File**: `src/components/admin/ProductForm.tsx`

**Lines**: 289-292 (category dropdown options)

**Specific Changes**:
1. **Fix Option Attributes**: Move `bg-black` from value to className
   ```typescript
   // Before:
   <option value="perfumes bg-black">Perfumes</option>
   
   // After:
   <option value="perfumes" className="bg-black">Perfumes</option>
   ```

2. **Apply to All Options**: Fix all four category options (perfumes, cosmetics, jewelry, gift_sets)

#### Currency Display Fixes (Bugs 1.8, 1.9)

**File**: `src/lib/utils.ts`

**Function**: `formatPrice`

**Specific Changes**:
1. **Make Currency Dynamic**: Accept optional currency parameter with default
   ```typescript
   export function formatPrice(cents: number, currency: string = 'ZAR'): string {
     const amount = cents / 100;
     const symbols: Record<string, string> = {
       'ZAR': 'R',
       'USD': '$',
       'EUR': '€',
       'GBP': '£',
       'PKR': '₨'
     };
     const symbol = symbols[currency] || currency;
     return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
   }
   ```

2. **Create Currency Context**: Add React context to provide currency globally
   ```typescript
   // src/lib/contexts/CurrencyContext.tsx
   const CurrencyContext = createContext<{ currency: string }>({ currency: 'ZAR' });
   ```

3. **Update All Call Sites**: Modify all components calling `formatPrice` to pass currency from context or settings query
   - Dashboard KPI cards
   - Analytics revenue displays
   - Product tables
   - Order displays

**Alternative Approach**: Instead of context, fetch settings in each page component and pass currency down as prop to child components using `formatPrice`.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate the bug conditions and observe failures on unfixed code to understand the root causes.

**Test Cases**:

1. **Real-Time Update Test**: 
   - Load dashboard page, wait 60 seconds, verify data is stale (will fail on unfixed code - no auto-refresh)
   - Simulate new order creation, verify dashboard doesn't update (will fail on unfixed code)

2. **Product Create Test**: 
   - Submit product form with variants, query database for variants (will fail on unfixed code - variants not saved)
   - Expected counterexample: Product exists but variants table is empty

3. **Product Update Test**: 
   - Update existing product with new variant, query database (will fail on unfixed code - variants not updated)
   - Expected counterexample: Product updated but variants unchanged

4. **Product Deactivate Test**: 
   - Click deactivate button, query database for product (will fail on unfixed code if hard delete is happening)
   - Expected counterexample: Product record not found instead of isActive=false

5. **UI Styling Test**: 
   - Render ProductForm, inspect category dropdown option elements (will fail on unfixed code)
   - Expected counterexample: className not applied, value contains "bg-black"

6. **Currency Display Test**: 
   - Change currency to USD, check formatPrice output (will fail on unfixed code - still shows "R")
   - Expected counterexample: formatPrice returns "R2.85" instead of "$2.85"

**Expected Counterexamples**:
- Dashboard data remains stale after 60+ seconds
- Product variants not persisted on create/update
- Product records deleted instead of soft-deleted (if hard delete is occurring)
- Dropdown options have incorrect styling
- Currency changes don't propagate to displays

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition_RealTime(input) DO
  result := fixedPage_autoRefresh(input)
  ASSERT result.dataIsFresh == true
  ASSERT result.lastRefreshTime <= 60 seconds ago
END FOR

FOR ALL input WHERE isBugCondition_ProductOps(input) DO
  result := fixedMutation(input)
  ASSERT result.success == true
  ASSERT result.variantsPersisted == true (for create/update)
  ASSERT result.softDeleted == true (for delete)
END FOR

FOR ALL input WHERE isBugCondition_UIStyle(input) DO
  result := fixedComponent_render(input)
  ASSERT result.optionHasClassName == true
  ASSERT result.valueIsClean == true
END FOR

FOR ALL input WHERE isBugCondition_Currency(input) DO
  result := fixedFormatPrice(input)
  ASSERT result.currencySymbol == input.settingsCurrency
  ASSERT result.format matches input.settingsCurrency
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition_RealTime(input) DO
  ASSERT fixedPage(input) = originalPage(input)
END FOR

FOR ALL input WHERE NOT isBugCondition_ProductOps(input) DO
  ASSERT fixedMutation(input) = originalMutation(input)
END FOR

FOR ALL input WHERE NOT isBugCondition_UIStyle(input) DO
  ASSERT fixedComponent(input) = originalComponent(input)
END FOR

FOR ALL input WHERE NOT isBugCondition_Currency(input) DO
  ASSERT fixedFormatPrice(input) = originalFormatPrice(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-affected operations, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Authentication Preservation**: Verify admin route protection continues to work after fixes
2. **Caching Preservation**: Verify Redis caching for analytics queries continues to work
3. **Pagination Preservation**: Verify pagination logic works correctly after auto-refresh implementation
4. **Search/Filter Preservation**: Verify search and filter functionality continues to work
5. **Non-Product Mutations Preservation**: Verify order, customer, settings mutations continue to work
6. **Manual Refresh Preservation**: Verify manual page refresh continues to work correctly
7. **Initial Load Preservation**: Verify initial page loads fetch data correctly
8. **Currency Format Preservation**: For ZAR currency (default), verify formatPrice output is identical to original

### Unit Tests

- Test auto-refresh intervals are set correctly (30s for dashboard/analytics, 60s for customers)
- Test auto-refresh cleanup on component unmount (clearInterval called)
- Test product create mutation with variants (verify both product and variants inserted)
- Test product update mutation with variant changes (verify variants synchronized)
- Test product delete mutation (verify soft delete, isActive=false)
- Test category dropdown rendering (verify className applied correctly)
- Test formatPrice with different currencies (ZAR, USD, EUR, GBP, PKR)
- Test formatPrice with edge cases (0 cents, very large amounts, negative amounts)

### Property-Based Tests

- Generate random time intervals and verify auto-refresh triggers correctly
- Generate random product data with varying numbers of variants and verify create/update operations
- Generate random currency codes and verify formatPrice handles them correctly
- Generate random admin operations and verify preservation of non-buggy functionality
- Test that all monetary displays across the admin panel use consistent currency formatting

### Integration Tests

- Test full product lifecycle: create with variants → update variants → deactivate → verify data integrity
- Test dashboard auto-refresh with simulated order creation → verify KPIs update within 30 seconds
- Test currency change flow: update settings → verify all admin pages reflect new currency
- Test concurrent admin operations: multiple admins viewing same page with auto-refresh enabled
- Test page navigation with auto-refresh: verify intervals are cleaned up when navigating away
- Test error handling: verify auto-refresh continues after failed refetch attempts
