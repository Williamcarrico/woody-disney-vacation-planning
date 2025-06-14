<!-- Generated by SpecStory -->

# Fixing TypeScript Unexpected Any Error (2025-05-26 14:02:36)

_**User**_

For the code present, we get this error:
```
Unexpected any. Specify a different type.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

Looking at the code, the issue is that `updateData` is typed as `any`, which TypeScript's linter flags as unsafe. I need to examine the geofences schema to create a proper type for the update data.

---

<details>
            <summary>Searched codebase "geofences schema table definition" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/db/schema/locations.ts` | L34-79 |
| `src/db/schema/locations.ts` | L79-103 |
| `src/db/schema/locations.ts` | L103-127 |
| `src/db/schema/locations.ts` | L6-7 |
| `src/db/schema/locations.ts` | L127-153 |
| `src/lib/services/map-service.ts` | L62-106 |
| `src/db/schema/locations.ts` | L157-158 |
| `src/db/schema/locations.ts` | L158-159 |
| `src/db/schema/locations.ts` | L159-160 |
| `src/db/schema/locations.ts` | L160-161 |
| `src/db/schema/locations.ts` | L8-34 |
| `src/lib/services/map-service.ts` | L33-44 |
| `src/lib/services/geofencing.ts` | L1-9 |
| `src/app/api/geofences/route.ts` | L88-137 |
| `src/app/api/geofences/route.ts` | L1-50 |
| `src/lib/services/geofencing.ts` | L29-41 |
| `src/app/api/geofences/[geofenceId]/route.ts` | L1-10 |
| `src/lib/services/map-service.ts` | L208-250 |
| `src/lib/services/map-service.ts` | L250-288 |
| `src/lib/services/map-service.ts` | L106-142 |
| `src/lib/services/geofencing.ts` | L500-534 |
| `src/lib/services/map-service.ts` | L142-188 |
| `src/app/api/geofences/[geofenceId]/route.ts` | L36-95 |
| `src/lib/services/geofencing.ts` | L312-348 |
| `src/components/maps/interactive-map.tsx` | L46-55 |

</details>

---

Now I can see the geofences schema. Let me create a proper type for the update data based on the schema fields that can be updated:

---



---

Perfect! I've fixed the TypeScript error by replacing the `any` type with a proper type. Here's what I did:

**Solution**: Changed `const updateData: any = {` to `const updateData: Partial<typeof geofences.$inferInsert> = {`

**Explanation**: 
- `typeof geofences.$inferInsert` gives us the exact type for inserting/updating geofence records based on the Drizzle schema
- `Partial<>` makes all properties optional, which is perfect for update operations where you only want to update specific fields
- This provides full type safety while allowing the flexible update pattern used in the code

The fix is concise and leverages Drizzle's built-in type inference to ensure type safety without having to manually define all the possible update fields.

---

