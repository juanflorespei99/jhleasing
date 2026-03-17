

## Plan: Corregir dominios permitidos

### Cambios

1. **Base de datos** — Dos operaciones con insert tool:
   - `UPDATE allowed_domains SET domain = 'creditoexpress.com' WHERE domain = 'creditoexpresss.com';`
   - `DELETE FROM allowed_domains WHERE domain = 'payefy.me';`

2. **Frontend** — `src/pages/Register.tsx` línea 16:
   - Cambiar `creditoexpresss.com` → `creditoexpress.com`
   - Eliminar `payefy.me` del array

### Resultado final de dominios permitidos

| # | Dominio |
|---|---------|
| 1 | `jhl.mx` |
| 2 | `creditoexpress.com` |
| 3 | `scaletechconsulting.mx` |

