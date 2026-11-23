#!/usr/bin/env bash
set -euo pipefail

oversized=$(find . \( -name .git -o -name node_modules \) -prune -o -type f -size +500000c -print)
if [[ -n "$oversized" ]]; then
  printf 'Arquivos acima de 500 KB:\n%s\n' "$oversized" >&2
  exit 1
fi

# Divide os padrões para que esta rotina também possa ser inspecionada.
markers='\b(to''do|fix''me|sen''ha|pass''word)\b'
matches=$(find . \( -name .git -o -name node_modules -o -name package-lock.json \) -prune \
  -o -type f -exec grep -IilE "$markers" {} \;)
if [[ -n "$matches" ]]; then
  printf 'Termos bloqueados encontrados em:\n%s\n' "$matches" >&2
  exit 1
fi
