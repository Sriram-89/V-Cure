#!/usr/bin/env python3
"""
Hand-rolled Prisma-schema -> PostgreSQL DDL generator.

Context: this sandbox has no network access, so the Prisma CLI cannot be
installed and `prisma migrate dev` cannot be run against a live database to
auto-generate migration.sql. This script parses prisma/schema.prisma (whose
style is fully controlled/known, since we authored it) and deterministically
emits equivalent DDL, so the migration can be reviewed and applied now, and
regenerated/reconciled with the real Prisma migration engine later once the
project has DB connectivity (see README "Regenerating with real Prisma").
"""
import re

SCHEMA_PATH = "prisma/schema.prisma"


def read_schema():
    with open(SCHEMA_PATH) as f:
        return f.read()


def strip_comments(body):
    return "\n".join(l for l in body.split("\n") if not l.strip().startswith("//"))


def parse_enums(text):
    enums = []
    for name, body in re.findall(r'enum (\w+) \{(.*?)\n\}', text, re.S):
        values = [v.strip() for v in strip_comments(body).split("\n") if v.strip()]
        enums.append((name, values))
    return enums


def parse_models(text):
    models = []
    for name, body in re.findall(r'model (\w+) \{(.*?)\n\}', text, re.S):
        models.append((name, body))
    return models


FIELD_RE = re.compile(r'^(\w+)\s+([A-Za-z_]+)(\?|\[\])?\s*(.*)$')


def map_type(t, mult, attrs_str):
    if mult == "[]":
        base = map_type(t, "", attrs_str)
        return base + "[]"
    if "@db.Uuid" in attrs_str:
        return "UUID"
    if "@db.Text" in attrs_str:
        return "TEXT"
    if "@db.Date" in attrs_str:
        return "DATE"
    mapping = {
        "String": "TEXT",
        "Int": "INTEGER",
        "Float": "DOUBLE PRECISION",
        "Boolean": "BOOLEAN",
        "DateTime": "TIMESTAMP(3)",
        "Json": "JSONB",
        "Bytes": "BYTEA",
    }
    return mapping.get(t)  # None -> enum type, handled by caller


def sql_quote_default(val, col_type):
    val = val.strip()
    if val == "now()":
        return "CURRENT_TIMESTAMP"
    if val == "uuid()":
        return "gen_random_uuid()"
    if val in ("true", "false"):
        return val
    if re.match(r'^-?\d+(\.\d+)?$', val):
        return val
    if val.startswith('"') and val.endswith('"'):
        return "'" + val[1:-1].replace("'", "''") + "'"
    return "'" + val + "'"


def parse_model_fields(body, enum_names, model_names):
    columns = []
    table_uniques = []
    indexes = []
    pk_col = None

    for raw_line in strip_comments(body).split("\n"):
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("@@map"):
            continue
        if line.startswith("@@unique"):
            cols = re.findall(r'\[([^\]]+)\]', line)
            if cols:
                table_uniques.append([c.strip() for c in cols[0].split(",")])
            continue
        if line.startswith("@@index"):
            cols = re.findall(r'\[([^\]]+)\]', line)
            if cols:
                indexes.append([c.strip() for c in cols[0].split(",")])
            continue
        if line.startswith("@@id"):
            continue

        m = FIELD_RE.match(line)
        if not m:
            continue
        fname, ftype, mult, attrs = m.groups()
        attrs = attrs or ""

        if ftype in model_names:
            continue  # relation object field (virtual) — not its own column

        col_type = map_type(ftype, mult or "", attrs)
        if col_type is None:
            col_type = '"' + ftype + '"'  # enum type

        not_null = (mult != "?")
        is_pk = "@id" in attrs
        is_unique = "@unique" in attrs and "@relation" not in attrs
        default_sql = None
        dm = re.search(r'@default\((now\(\)|uuid\(\)|true|false|-?\d+\.?\d*|"[^"]*"|\w+)\)', attrs)
        if dm:
            default_sql = sql_quote_default(dm.group(1), col_type)
        if "@updatedAt" in attrs:
            default_sql = "CURRENT_TIMESTAMP"

        columns.append({
            "name": fname,
            "type": col_type,
            "not_null": not_null,
            "pk": is_pk,
            "unique": is_unique,
            "default": default_sql,
        })
        if is_pk:
            pk_col = fname

    return columns, table_uniques, indexes, pk_col


def parse_relations(body, model_names):
    rels = []
    for raw_line in strip_comments(body).split("\n"):
        line = raw_line.strip()
        if not line or line.startswith("@@"):
            continue
        m = FIELD_RE.match(line)
        if not m:
            continue
        fname, ftype, mult, attrs = m.groups()
        attrs = attrs or ""
        if ftype not in model_names:
            continue
        relm = re.search(
            r'@relation\((?:"[^"]*",\s*)?fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\](?:,\s*onDelete:\s*(\w+))?',
            line,
        )
        if relm:
            fk_cols = [c.strip() for c in relm.group(1).split(",")]
            ref_cols = [c.strip() for c in relm.group(2).split(",")]
            on_delete = relm.group(3) or "NoAction"
            rels.append((fk_cols, ftype, ref_cols, on_delete))
    return rels


ON_DELETE_MAP = {
    "Cascade": "CASCADE",
    "Restrict": "RESTRICT",
    "SetNull": "SET NULL",
    "NoAction": "NO ACTION",
}


def main():
    text = read_schema()
    enums = parse_enums(text)
    models = parse_models(text)
    model_names = set(n for n, _ in models)
    enum_names = set(n for n, _ in enums)

    model_table = {}
    for name, body in models:
        mm = re.search(r'@@map\("(\w+)"\)', body)
        model_table[name] = mm.group(1) if mm else name.lower()

    out = []
    out.append("-- ============================================================")
    out.append("-- V-CURE — INITIAL DATABASE MIGRATION")
    out.append("-- Generated from prisma/schema.prisma (hand-rolled generator —")
    out.append("-- see scripts/generate_migration.py; regenerate with the real")
    out.append("-- Prisma migration engine once DB connectivity is available).")
    out.append("-- ============================================================")
    out.append("")
    out.append('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    out.append("")

    out.append("-- ---------- ENUM TYPES ----------")
    for name, values in enums:
        vals = ", ".join(f"'{v}'" for v in values)
        out.append(f'CREATE TYPE "{name}" AS ENUM ({vals});')
    out.append("")

    all_fk_stmts = []
    all_index_stmts = []

    for name, body in models:
        table = model_table[name]
        columns, table_uniques, indexes, pk_col = parse_model_fields(body, enum_names, model_names)
        relations = parse_relations(body, model_names)

        out.append(f"-- ---------- {name} ----------")
        out.append(f'CREATE TABLE "{table}" (')
        col_lines = []
        for col in columns:
            parts = [f'"{col["name"]}"', col["type"]]
            if col["default"] is not None:
                parts.append(f"DEFAULT {col['default']}")
            if col["not_null"]:
                parts.append("NOT NULL")
            if col["unique"]:
                parts.append("UNIQUE")
            col_lines.append("  " + " ".join(parts))
        if pk_col:
            col_lines.append(f'  PRIMARY KEY ("{pk_col}")')
        out.append(",\n".join(col_lines))
        out.append(");")
        out.append("")

        for cols in table_uniques:
            cname = f"uq_{table}_" + "_".join(cols)
            colslist = ", ".join(f'"{c}"' for c in cols)
            all_index_stmts.append(f'CREATE UNIQUE INDEX "{cname}" ON "{table}" ({colslist});')
        for cols in indexes:
            cname = f"idx_{table}_" + "_".join(cols)
            colslist = ", ".join(f'"{c}"' for c in cols)
            all_index_stmts.append(f'CREATE INDEX "{cname}" ON "{table}" ({colslist});')

        for fk_cols, target_model, ref_cols, on_delete in relations:
            target_table = model_table[target_model]
            fkcols = ", ".join(f'"{c}"' for c in fk_cols)
            refcols = ", ".join(f'"{c}"' for c in ref_cols)
            cname = f"fk_{table}_" + "_".join(fk_cols)
            od = ON_DELETE_MAP.get(on_delete, "NO ACTION")
            all_fk_stmts.append(
                f'ALTER TABLE "{table}" ADD CONSTRAINT "{cname}" '
                f'FOREIGN KEY ({fkcols}) REFERENCES "{target_table}"({refcols}) '
                f'ON DELETE {od} ON UPDATE CASCADE;'
            )

    out.append("-- ---------- INDEXES ----------")
    out.extend(all_index_stmts)
    out.append("")
    out.append("-- ---------- FOREIGN KEYS ----------")
    out.extend(all_fk_stmts)
    out.append("")

    print("\n".join(out))


if __name__ == "__main__":
    main()
