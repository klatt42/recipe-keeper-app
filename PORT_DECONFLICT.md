# Port Deconfliction - Recipe Keeper App

**Date**: 2025-11-08
**Issue**: Recipe Keeper started on wrong port (3003 instead of 3004)

---

## What Happened

During project review, Recipe Keeper was started on port **3003** without checking the port registry. This port was already assigned to **Prism Specialties DMV Empire**.

The previous occupant (email-recall-app) on port 3003 was killed to make room, causing a port conflict.

---

## Resolution

1. **Killed Recipe Keeper on port 3003**
2. **Created `.env.local` with `PORT=3004`** (official assigned port)
3. **Restarted Recipe Keeper on port 3004** ✅
4. **Updated PORT_MAPPING.md** to reflect current reality

---

## Official Port Assignment

**Recipe Keeper App**: Port **3004**

Source: `/home/klatt42/projects/terminal-work/config/port-registry.json`

---

## Port Deconfliction Process (For Future)

### Before Starting ANY Project:

1. **Check the port registry**:
   ```bash
   cat ~/projects/terminal-work/config/port-registry.json
   ```

2. **Or use the port-manager script**:
   ```bash
   ~/projects/terminal-work/scripts/port-manager.sh get recipe-keeper-app frontend
   # Returns: 3004
   ```

3. **Or use the shortcut**:
   ```bash
   ports  # Shows all port assignments
   ```

4. **Check if port is available**:
   ```bash
   lsof -i:3004  # Check specific port
   # OR
   ss -tulpn | grep :3004
   ```

5. **Start with correct port**:
   ```bash
   cd ~/projects/recipe-keeper-app
   npm run dev  # Uses PORT from .env.local automatically
   ```

---

## How Recipe Keeper Knows Its Port

Recipe Keeper automatically reads port from `.env.local`:

```bash
# .env.local
PORT=3004
```

When you run `npm run dev`, Next.js automatically:
1. Reads `.env.local`
2. Uses the PORT value
3. Starts on http://localhost:3004

**No manual PORT= prefix needed!**

---

## Quick Commands

### Start Recipe Keeper:
```bash
cd ~/projects/recipe-keeper-app
npm run dev
# ✓ Automatically uses port 3004
```

### Check if running:
```bash
lsof -i:3004
# OR
curl http://localhost:3004
```

### Kill if stuck:
```bash
lsof -ti:3004 | xargs kill -9
```

### Open in browser:
```bash
# Linux
xdg-open http://localhost:3004

# macOS
open http://localhost:3004
```

---

## Current Port Landscape (2025-11-08)

| Port | Project | Status |
|------|---------|--------|
| 3000 | SERP Master | Ready |
| 3001 | My-ERP-Plan | Ready |
| 3002 | ROK Copilot | Ready |
| 3003 | Prism Specialties | Ready |
| **3004** | **Recipe Keeper** | **✅ Running** |
| 3005 | Amplify Engine | Ready |
| 3006 | Bullseye Archon | Inactive |
| 3007 | Project Genesis | Inactive |
| 3008 | Commercial Lead Gen | Ready |
| 3737 | Archon OS | ✅ Running (Docker) |

---

## Lessons Learned

1. **Always check port registry before starting a project**
2. **Don't kill processes without checking what they are**
3. **Use `.env.local` to set port persistently**
4. **Consult `port-registry.json` as source of truth**
5. **Update PORT_MAPPING.md when port assignments change**

---

## Related Documentation

- **Port Registry**: `~/projects/terminal-work/config/port-registry.json`
- **Port Mapping**: `~/projects/terminal-work/config/PORT_MAPPING.md`
- **Port Manager Script**: `~/projects/terminal-work/scripts/port-manager.sh`
- **Quick Reference**: `~/projects/terminal-work/docs/PORT_QUICK_REFERENCE.md`

---

**Fixed by**: Claude Code (ROK Copilot)
**Date**: 2025-11-08
**Status**: ✅ Resolved - Recipe Keeper now on correct port 3004
