# Phase 1: Critical Duplicates - Implementation Checklist

## Pre-Implementation Setup
- [ ] Create feature branch: `feature/codebase-optimization-phase-1`
- [ ] Run full test suite and document baseline metrics
- [ ] Create rollback plan documentation
- [ ] Backup current state

## 1. Delete Unused Files (Low Risk - Do First)
- [ ] Delete `src/lib/data/comprehensive-restaurants.ts` (425 lines)
- [ ] Remove all `.DS_Store` files:
  - [ ] `src/.DS_Store`
  - [ ] `src/components/.DS_Store`
  - [ ] `src/lib/.DS_Store`
  - [ ] Root `.DS_Store`
- [ ] Verify `.gitignore` includes `.DS_Store`
- [ ] Run build to ensure no broken imports

## 2. Consolidate Cache Services
### Analysis Phase
- [ ] Map all imports of `src/lib/api/cache-service.ts`
- [ ] Map all imports of `src/lib/cache/cache-service.ts`
- [ ] Document any unique methods in each service

### Implementation Phase
- [ ] Create unified cache service at `src/lib/cache/cache-service.ts`
- [ ] Migrate unique features from api version
- [ ] Update all imports to use new unified service
- [ ] Add deprecation notice to old service (temporary)
- [ ] Run tests for all components using cache

### Cleanup Phase
- [ ] Remove `src/lib/api/cache-service.ts`
- [ ] Update any documentation

## 3. Consolidate Vacation Services
### Analysis Phase
- [ ] Map all imports of `src/lib/services/vacation.service.ts`
- [ ] Map all imports of `src/lib/firebase/vacation-service.ts`
- [ ] List enhanced features in generic service (caching, retry logic)

### Implementation Phase
- [ ] Enhance Firebase service with features from generic service:
  - [ ] Advanced error handling
  - [ ] Retry logic
  - [ ] Caching integration
- [ ] Create migration wrapper (if needed for gradual rollout)
- [ ] Update all imports to use Firebase service
- [ ] Add comprehensive tests for migrated features

### Cleanup Phase
- [ ] Remove `src/lib/services/vacation.service.ts`
- [ ] Update service documentation

## 4. Fix Analytics Service Naming Conflict
- [ ] Rename export in `src/lib/services/wait-time-analytics.ts` to `waitTimeAnalyticsService`
- [ ] Update all imports of wait-time analytics service
- [ ] Verify no naming conflicts remain

## Post-Implementation Verification
- [ ] Run full test suite
- [ ] Build project and check bundle size
- [ ] Document metrics:
  - [ ] Lines of code removed: ______
  - [ ] Bundle size change: ______%
  - [ ] Build time change: ______
- [ ] Update main documentation

## Rollback Triggers
- [ ] Test failures > 5%
- [ ] Build errors
- [ ] Runtime errors in staging
- [ ] Bundle size increases

## Sign-offs Required
- [ ] Developer implementation complete
- [ ] Code review passed
- [ ] QA testing passed
- [ ] Performance metrics acceptable 