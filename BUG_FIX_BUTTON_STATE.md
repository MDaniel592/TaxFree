# Bug Fix: Button State Not Persisting After Refresh

## Issue
The enable/disable toggle buttons in the popup were not maintaining their state after the page was refreshed. When a user toggled a button, the state would change but after a page reload or popup close/reopen, the button would revert to its previous state.

## Root Cause
The problem had multiple contributing factors:

1. **Async Load Timing Issue**: The original code used `eval()` to set global variables asynchronously, but there was no guarantee the data would be loaded before `initializePopup()` was called.

2. **Missing Fresh Load on Popup Open**: The popup initialization didn't directly load from storage every time it opened. Instead, it relied on global variables that might be stale.

3. **Global Variables Not Updated**: When a button was toggled, the global variables weren't updated immediately, only after the storage operation completed.

4. **Duplicate Initialization**: There were duplicate DOMContentLoaded listeners which could cause race conditions.

## Solution
The fix involves three key changes:

### 1. Direct Storage Loading in `initializePopup()`
Instead of relying on the async `loadData()` function, `initializePopup()` now directly calls `chrome.storage.local.get()` to load all settings:

```javascript
function initializePopup() {
  try {
    chrome.storage.local.get(
      ["TaxFreeStatus", "sendHerePlzStatus", "ShortLinkStatus", "TaxFreePercent"],
      (items) => {
        // Update global variables with stored values
        TaxFreeStatus = items.TaxFreeStatus !== undefined ? items.TaxFreeStatus : true;
        sendHerePlzStatus = items.sendHerePlzStatus !== undefined ? items.sendHerePlzStatus : true;
        ShortLinkStatus = items.ShortLinkStatus !== undefined ? items.ShortLinkStatus : true;
        TaxFreePercent = items.TaxFreePercent !== undefined ? items.TaxFreePercent : 0;

        // Set UI elements based on loaded values
        setSwitchButtonDirect("TaxFreeButton", TaxFreeStatus);
        setSwitchButtonDirect("sendHerePlzButton", sendHerePlzStatus);
        setSwitchButtonDirect("ShortLinkButton", ShortLinkStatus);
        setInputValueDirect("TaxFreePercent", TaxFreePercent);
        setText();
      }
    );
  } catch (error) {
    console.error("[TaxFree Popup ERROR] initializePopup:", error);
  }
}
```

**Benefits:**
- Fresh load every time the popup opens
- No reliance on stale global variables
- Direct access to storage data
- Proper error handling

### 2. New Helper Functions for Direct Value Setting
Added two new helper functions that set values directly without relying on `eval()`:

```javascript
function setInputValueDirect(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value !== undefined ? value : "";
  }
}

function setSwitchButtonDirect(elementId, checked) {
  const element = document.getElementById(elementId);
  if (element) {
    element.checked = checked === true;
  }
}
```

**Benefits:**
- No `eval()` overhead
- Clearer intent
- Direct value assignment

### 3. Immediate Global Variable Updates
When a button is toggled, the global variable is now updated immediately using a new helper:

```javascript
function updateGlobalVariable(storageKey, value) {
  switch (storageKey) {
    case "TaxFreeStatus":
      TaxFreeStatus = value;
      break;
    case "sendHerePlzStatus":
      sendHerePlzStatus = value;
      break;
    case "ShortLinkStatus":
      ShortLinkStatus = value;
      break;
    case "TaxFreePercent":
      TaxFreePercent = value;
      break;
  }
}
```

This is called immediately in both `handleSwitchChange()` and `handleInputChange()`:

```javascript
function handleSwitchChange(element, storageKey) {
  try {
    const newValue = element.checked;
    
    // Update global variable immediately
    updateGlobalVariable(storageKey, newValue);
    
    // Then save to storage
    chrome.runtime.sendMessage({
      function: "setData",
      params: [storageKey, newValue],
    })
    // ... rest of function
  }
}
```

**Benefits:**
- Global variables stay in sync with storage
- Next popup open gets correct values
- Consistent state throughout

### 4. Consolidated DOMContentLoaded Listener
Merged duplicate DOMContentLoaded listeners into one:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  try {
    initializeEventListeners();
    initializePopup();
  } catch (error) {
    console.error("[TaxFree Popup ERROR] DOMContentLoaded:", error);
  }
});
```

**Benefits:**
- No race conditions
- Clear initialization order
- Single entry point

## Flow Diagram

### Before Fix (Broken)
```
Popup Opens
  ↓
DOMContentLoaded fires
  ↓
loadData() starts async calls with eval()
  ↓
initializePopup() called (maybe before data loads!)
  ↓
UI set with stale/default values
  ↓
User toggles button
  ↓
Storage saved, page reloads
  ↓
Popup opens again, same problem!
```

### After Fix (Working)
```
Popup Opens
  ↓
DOMContentLoaded fires
  ↓
initializeEventListeners() - Setup click handlers
  ↓
initializePopup() called
  ↓
chrome.storage.local.get() loads fresh data
  ↓
Global variables updated with stored values
  ↓
UI set with correct values
  ↓
User toggles button
  ↓
Global variable updated immediately
  ↓
Storage saved with new value
  ↓
Page reloads
  ↓
Popup opens with correct state!
```

## Testing
To verify the fix works:

1. Click the popup icon
2. Toggle any enable/disable button (TaxFree, SendHerePlz, or ShortLinks)
3. The page should reload and popup should close
4. Click the popup icon again
5. **The button should be in the new state**
6. Refresh the page manually
7. Click the popup icon again
8. **The button should still be in the saved state**

## Files Modified
- `MV3/core_js/popup.js`

## Changes Summary
- Consolidated DOMContentLoaded listeners
- Rewrote `initializePopup()` to load directly from storage
- Added `setInputValueDirect()` helper
- Added `setSwitchButtonDirect()` helper
- Added `updateGlobalVariable()` helper
- Updated `handleSwitchChange()` to update globals immediately
- Updated `handleInputChange()` to update globals immediately
- Removed old async startup sequence with eval()

## Error Handling
All changes include proper error handling:
- Try-catch blocks around all operations
- Null/undefined checks
- Fallback to default values if data missing
- Console logging for debugging

## Performance Impact
- **Positive**: Eliminated eval() calls
- **Neutral**: Additional storage.get() call, but only on popup open (minimal)
- **Overall**: No negative performance impact