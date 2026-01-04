# Builder Engine Implementation Plan
## Complete Upgrade from Variable-Based to Form Builder System

**Project Duration:** 5-7 days (40-60 hours)  
**Risk Level:** HIGH - Major system upgrade  
**Rollback Strategy:** Feature flagged with fallback to V1 templates

---

## 🎯 Implementation Overview

### What We're Building
Transform the current variable-based template system into a drag-and-drop form builder with:
- Visual form designer
- 8+ element types (Text, Number, Paragraph, Dropdown, Radio, Date, Calculated, Header/Divider)
- Prefill engine (Patient, Doctor, Appointment, System data)
- Calculation engine (BMI, Age, Custom formulas)
- Read-only field enforcement
- Complete CRUD operations

### Success Criteria
- ✅ Existing templates continue to work (V1 compatibility)
- ✅ New templates can be created using builder
- ✅ Prefilled fields are read-only and secure
- ✅ Calculated fields update in real-time
- ✅ Documents generate correctly from builder templates
- ✅ Zero data loss during migration

---

## 🔄 Rollback Plan (CRITICAL)

### Feature Flag Strategy
```typescript
// In environment or config
ENABLE_BUILDER_V2=false // Set to false to rollback

// In code
if (process.env.ENABLE_BUILDER_V2 === 'true') {
  // Use new builder
} else {
  // Use legacy variable system
}
```

### Database Rollback
```sql
-- Rollback migration if issues found
BEGIN;
  -- Remove new column
  ALTER TABLE templates DROP COLUMN IF EXISTS builder_version;
  
  -- Drop new constraints
  ALTER TABLE templates DROP CONSTRAINT IF EXISTS check_builder_schema;
  
  -- Drop validation function
  DROP FUNCTION IF EXISTS validate_builder_schema;
  
  -- Drop view
  DROP VIEW IF EXISTS builder_templates;
COMMIT;
```

### Emergency Rollback Steps
1. Set `ENABLE_BUILDER_V2=false` in `.env.local`
2. Restart application
3. Run rollback SQL script
4. Verify existing templates still work
5. Investigate issues in isolated environment

### Backup Strategy (BEFORE STARTING)
```bash
# Backup database
pg_dump -h <supabase-host> -U postgres -d postgres --table=templates > templates_backup_$(date +%Y%m%d).sql

# Backup code (Git tag)
git tag -a builder-v2-start -m "Snapshot before Builder Engine implementation"
git push origin builder-v2-start
```

---

## 📋 Micro Tasks Breakdown

### Phase 1: Foundation & Setup (Day 1 - 6 hours)

#### Task 1.1: Database Migration
- [ ] Run migration `20260104000006_upgrade_templates_to_builder.sql`
- [ ] Verify migration in Supabase dashboard
- [ ] Test constraint validation function
- [ ] Create test template with builder_version=2
- [ ] **Testing:** Insert invalid schema, should fail
- [ ] **Checkpoint:** Can query `builder_templates` view

#### Task 1.2: Feature Flag Setup
- [ ] Add `NEXT_PUBLIC_ENABLE_BUILDER_V2` to `.env.local`
- [ ] Create `lib/feature-flags.ts` utility
- [ ] Add builder version check in templates list
- [ ] **Testing:** Toggle flag, verify UI switches
- [ ] **Checkpoint:** Feature flag working

#### Task 1.3: Type Definitions & Utils
- [ ] Already created: `types/builder.ts` ✅
- [ ] Create `lib/builder-utils.ts` (validation, helpers)
- [ ] Create `lib/calculation-engine.ts` (BMI, Age calculators)
- [ ] Create `lib/prefill-engine.ts` (data fetching)
- [ ] **Testing:** Unit test calculation functions
- [ ] **Checkpoint:** All utilities export correctly

---

### Phase 2: Builder UI Core (Day 2 - 8 hours)

#### Task 2.1: Builder Layout Structure
- [ ] Create `components/builder/BuilderLayout.tsx`
- [ ] Left Panel: `components/builder/ElementPalette.tsx`
- [ ] Center Panel: `components/builder/Canvas.tsx`
- [ ] Right Panel: `components/builder/PropertiesPanel.tsx`
- [ ] Add state management (React Context or Zustand)
- [ ] **Testing:** All panels render without errors
- [ ] **Checkpoint:** 3-panel layout displays

#### Task 2.2: Element Palette
- [ ] Create element type definitions
- [ ] Display all 8 element types as draggable cards
- [ ] Add icons for each element type
- [ ] Implement drag start handler
- [ ] **Testing:** Can select elements from palette
- [ ] **Checkpoint:** Elements have hover states

#### Task 2.3: Canvas - Basic Drop
- [ ] Create drop zone in canvas
- [ ] Handle drop event to add element
- [ ] Display dropped elements in order
- [ ] Generate unique IDs for elements
- [ ] **Testing:** Drag & drop adds element to canvas
- [ ] **Checkpoint:** Elements appear on canvas

#### Task 2.4: Element Rendering (Basic)
- [ ] Create `components/builder/elements/TextElement.tsx`
- [ ] Create `components/builder/elements/NumberElement.tsx`
- [ ] Create `components/builder/elements/DateElement.tsx`
- [ ] Display element labels and input preview
- [ ] **Testing:** Elements render correctly on canvas
- [ ] **Checkpoint:** 3 basic elements working

---

### Phase 3: Element Configuration (Day 3 - 8 hours)

#### Task 3.1: Properties Panel - Text Fields
- [ ] Click element to select it
- [ ] Show properties panel for selected element
- [ ] Edit label, name, placeholder
- [ ] Toggle required checkbox
- [ ] Add min/max length
- [ ] **Testing:** Properties update element in real-time
- [ ] **Checkpoint:** Text element fully configurable

#### Task 3.2: Properties Panel - Number Fields
- [ ] Min/max value settings
- [ ] Step increment
- [ ] Default value
- [ ] **Testing:** Number constraints enforced
- [ ] **Checkpoint:** Number element configurable

#### Task 3.3: Properties Panel - Advanced Elements
- [ ] Create `DropdownElement.tsx` with options editor
- [ ] Create `RadioElement.tsx` with options editor
- [ ] Create `ParagraphElement.tsx` with rows config
- [ ] Create `HeaderElement.tsx` with size selector
- [ ] Create `DividerElement.tsx` (no config needed)
- [ ] **Testing:** All element types render
- [ ] **Checkpoint:** 8 element types complete

#### Task 3.4: Prefill Configuration UI
- [ ] Add "Prefill" section to properties panel
- [ ] Dropdown to select prefill source (Patient, Doctor, etc.)
- [ ] Dropdown to select field (name, phone, etc.)
- [ ] Checkbox for "Read-only"
- [ ] Visual indicator on canvas for prefilled fields
- [ ] **Testing:** Prefill config saves to element
- [ ] **Checkpoint:** Prefill UI complete

---

### Phase 4: Prefill Engine (Day 4 - 6 hours)

#### Task 4.1: Prefill Data Service
- [ ] Create `lib/prefill-service.ts`
- [ ] Function to fetch patient data by ID
- [ ] Function to fetch doctor data (from auth user)
- [ ] Function to fetch appointment data
- [ ] Function to get system data (current date/time)
- [ ] **Testing:** Mock data returns correctly
- [ ] **Checkpoint:** Can fetch all prefill sources

#### Task 4.2: Prefill Engine Integration
- [ ] When document is created, fetch prefill data
- [ ] Map prefill config to actual data
- [ ] Apply prefilled values to form fields
- [ ] Enforce read-only on prefilled fields
- [ ] **Testing:** Prefilled fields auto-populate
- [ ] **Checkpoint:** Prefill works end-to-end

#### Task 4.3: Read-Only Enforcement
- [ ] Add `readOnly` prop to input elements
- [ ] Gray out read-only fields visually
- [ ] Add lock icon to read-only fields
- [ ] Backend validation: reject changes to read-only fields
- [ ] **Testing:** Cannot edit prefilled read-only fields
- [ ] **Checkpoint:** Read-only security enforced

---

### Phase 5: Calculation Engine (Day 4 - 6 hours)

#### Task 5.1: Calculated Field Element
- [ ] Create `CalculatedElement.tsx`
- [ ] Display as read-only output field
- [ ] Show formula in properties panel
- [ ] **Testing:** Calculated element renders
- [ ] **Checkpoint:** Calculated element exists

#### Task 5.2: BMI Calculator
- [ ] Implement `calculateBMI(weight, height)` function
- [ ] Auto-detect weight and height fields
- [ ] Real-time calculation on value change
- [ ] Display BMI result
- [ ] **Testing:** BMI calculates correctly
- [ ] **Checkpoint:** BMI calculator works

#### Task 5.3: Age Calculator
- [ ] Implement `calculateAge(dateOfBirth)` function
- [ ] Auto-detect DOB field
- [ ] Calculate age in years
- [ ] Handle edge cases (future dates)
- [ ] **Testing:** Age calculates correctly
- [ ] **Checkpoint:** Age calculator works

#### Task 5.4: Custom Formula Support (Optional)
- [ ] Create safe formula parser
- [ ] Support basic math operations (+, -, *, /)
- [ ] Reference other fields by name
- [ ] **Testing:** Custom formulas work
- [ ] **Checkpoint:** Formula engine functional

---

### Phase 6: Template CRUD Operations (Day 5 - 6 hours)

#### Task 6.1: Create Template with Builder
- [ ] Update `app/templates/new/page.tsx`
- [ ] Toggle between V1 and V2 builder (feature flag)
- [ ] Save builder schema to `schema_json`
- [ ] Set `builder_version = 2`
- [ ] **Testing:** Can create builder template
- [ ] **Checkpoint:** Template saves to database

#### Task 6.2: Edit Existing Builder Template
- [ ] Load existing builder template
- [ ] Populate canvas with elements
- [ ] Allow editing and saving
- [ ] **Testing:** Can edit and save changes
- [ ] **Checkpoint:** Edit functionality works

#### Task 6.3: Template List UI Updates
- [ ] Show builder version badge (V1 / V2)
- [ ] Filter templates by version
- [ ] **Testing:** Can distinguish template versions
- [ ] **Checkpoint:** Template list enhanced

#### Task 6.4: View Builder Template
- [ ] Display template in preview mode
- [ ] Show all elements as read-only
- [ ] **Testing:** Preview displays correctly
- [ ] **Checkpoint:** Template view updated

---

### Phase 7: Document Generation (Day 6 - 8 hours)

#### Task 7.1: Form Renderer for Documents
- [ ] Create `components/builder/FormRenderer.tsx`
- [ ] Render all elements from builder schema
- [ ] Apply prefill data
- [ ] Handle user input for non-prefilled fields
- [ ] **Testing:** Form renders from schema
- [ ] **Checkpoint:** Dynamic form works

#### Task 7.2: Form Validation
- [ ] Validate required fields
- [ ] Validate min/max constraints
- [ ] Validate regex patterns
- [ ] Show validation errors
- [ ] **Testing:** Cannot submit invalid form
- [ ] **Checkpoint:** Validation enforced

#### Task 7.3: Document Submission
- [ ] Update `app/actions/documents.ts`
- [ ] Handle builder V2 template submissions
- [ ] Store form data in documents table
- [ ] **Testing:** Document creates successfully
- [ ] **Checkpoint:** Submission works

#### Task 7.4: PDF Generation for Builder Templates
- [ ] Update PDF renderer to support builder schema
- [ ] Layout elements in PDF
- [ ] Show prefilled values
- [ ] Show calculated values
- [ ] **Testing:** PDF generates correctly
- [ ] **Checkpoint:** PDF export works

---

### Phase 8: Advanced Features (Day 7 - 6 hours)

#### Task 8.1: Canvas Enhancements
- [ ] Drag to reorder elements
- [ ] Delete element button
- [ ] Duplicate element
- [ ] Undo/Redo (optional)
- [ ] **Testing:** Can manage elements on canvas
- [ ] **Checkpoint:** Canvas fully interactive

#### Task 8.2: Grid Layout System
- [ ] Implement 12-column grid
- [ ] Allow elements to span multiple columns
- [ ] Responsive layout preview
- [ ] **Testing:** Elements layout correctly
- [ ] **Checkpoint:** Grid system works

#### Task 8.3: Validation & Error Handling
- [ ] Validate template before save
- [ ] Prevent duplicate field names
- [ ] Check required properties
- [ ] Show helpful error messages
- [ ] **Testing:** Invalid templates rejected
- [ ] **Checkpoint:** Validation complete

#### Task 8.4: Migration Tool (Optional)
- [ ] Create script to convert V1 to V2
- [ ] Map variables to text elements
- [ ] Preserve all data
- [ ] **Testing:** V1 templates converted correctly
- [ ] **Checkpoint:** Migration tool ready

---

### Phase 9: Testing & Documentation (Day 7 - 4 hours)

#### Task 9.1: Integration Testing
- [ ] Create builder template end-to-end
- [ ] Generate document from builder template
- [ ] Export PDF from builder document
- [ ] Test all element types
- [ ] Test all prefill sources
- [ ] Test all calculations
- [ ] **Testing:** Complete workflow works
- [ ] **Checkpoint:** E2E tests pass

#### Task 9.2: Edge Case Testing
- [ ] Empty template
- [ ] Template with only calculated fields
- [ ] Template with all prefilled fields
- [ ] Very long forms (50+ elements)
- [ ] Special characters in labels
- [ ] **Testing:** Edge cases handled
- [ ] **Checkpoint:** No crashes

#### Task 9.3: Performance Testing
- [ ] Load template with 100 elements
- [ ] Measure render time
- [ ] Test on slow devices
- [ ] **Testing:** Acceptable performance
- [ ] **Checkpoint:** Performance optimized

#### Task 9.4: Documentation
- [ ] Update USER_GUIDE.md with builder instructions
- [ ] Add screenshots of builder UI
- [ ] Document prefill field mappings
- [ ] Document calculation formulas
- [ ] **Testing:** Documentation is clear
- [ ] **Checkpoint:** Docs complete

---

## 🧪 Testing Checkpoints

### After Each Phase
1. **Verify** all tasks complete
2. **Test** in browser manually
3. **Check** console for errors
4. **Commit** to Git with descriptive message
5. **Tag** if major milestone

### Critical Test Cases
```typescript
// Test 1: Create builder template
✅ Can add text element
✅ Can configure properties
✅ Can save template

// Test 2: Prefill data
✅ Patient name auto-fills
✅ Prefilled field is read-only
✅ Cannot edit prefilled value

// Test 3: Calculations
✅ BMI calculates when weight & height entered
✅ Age calculates from date of birth
✅ Calculated fields update in real-time

// Test 4: Document generation
✅ Form renders from builder template
✅ Can submit form
✅ Document saves with correct data
✅ PDF exports correctly

// Test 5: Backward compatibility
✅ V1 templates still work
✅ Can switch between V1 and V2
✅ No data loss
```

---

## 📊 Progress Tracking

### Daily Standup Questions
1. What did I complete yesterday?
2. What am I working on today?
3. What blockers do I have?

### Task Status Legend
- [ ] Not Started
- [~] In Progress
- [✓] Complete
- [X] Blocked
- [⚠] Needs Review

---

## 🚨 Risk Mitigation

### High-Risk Areas
1. **Database schema changes** → Test migration on staging first
2. **Prefill security** → Backend validation + read-only enforcement
3. **Calculation errors** → Comprehensive unit tests
4. **PDF generation** → Fallback to V1 renderer if fails
5. **Performance** → Virtualize large forms if needed

### Contingency Plans
- If Phase 3 blocked: Continue with basic elements only
- If PDF generation complex: Ship without PDF initially
- If performance poor: Limit max elements per template
- If too complex: Release as beta feature with opt-in

---

## 📦 Deliverables Checklist

### Code
- [ ] Database migration script
- [ ] Type definitions
- [ ] Builder UI components (18+ files)
- [ ] Prefill engine
- [ ] Calculation engine
- [ ] Updated template CRUD
- [ ] Document renderer
- [ ] PDF generator updates

### Documentation
- [ ] Implementation plan (this doc) ✅
- [ ] User guide updates
- [ ] API documentation
- [ ] Deployment guide

### Testing
- [ ] Unit tests for calculations
- [ ] Integration tests for workflows
- [ ] Manual test checklist
- [ ] Performance benchmarks

### Deployment
- [ ] Feature flag configuration
- [ ] Database migration executed
- [ ] Environment variables set
- [ ] Rollback plan tested

---

## 🎉 Launch Criteria

### Before Enabling in Production
1. ✅ All Phase 1-8 tasks complete
2. ✅ Integration tests passing
3. ✅ No critical bugs
4. ✅ Documentation updated
5. ✅ Rollback plan tested
6. ✅ Performance acceptable
7. ✅ Team training complete

### Gradual Rollout Plan
1. **Week 1:** Enable for internal testing only
2. **Week 2:** Enable for 10% of users (beta testers)
3. **Week 3:** Enable for 50% of users
4. **Week 4:** Enable for 100% of users

---

## 📞 Support & Escalation

### If You Get Stuck
1. Check this implementation plan
2. Review existing code patterns
3. Test with simpler examples
4. Check console/network errors
5. Review Supabase logs

### When to Pause
- Critical bug found affecting existing features
- Data corruption detected
- Performance degradation > 2x slower
- Security vulnerability discovered

### Emergency Contacts
- Database rollback: Use SQL script above
- Code rollback: `git checkout <tag>`
- Feature disable: Set flag to `false`

---

**READY TO START?**

Begin with Phase 1, Task 1.1 - Run the database migration.

Good luck! 🚀
