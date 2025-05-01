#!/usr/bin/env bash
# guardá esto como migrate-to-esm.sh y dale chmod +x

# 1) Reemplaza: const X = require('mod');
#    por       import X from 'mod';
find src/routes -type f -name "*.js" -print0 | xargs -0 sed -E -i '' \
  -e "s#const ([a-zA-Z0-9_]+) = require\('([^']+)'\);#import \1 from '\2';#g"

# 2) Reemplaza: const { A, B } = require('mod');
#    por       import { A, B } from 'mod';
find src/routes -type f -name "*.js" -print0 | xargs -0 sed -E -i '' \
  -e "s#const \{ ([^}]+) \} = require\('([^']+)'\);#import { \1 } from '\2';#g"

# 3) Reemplaza module.exports = fooRoutes;
#    por           export default fooRoutes;
find src/routes -type f -name "*.js" -print0 | xargs -0 sed -E -i '' \
  -e "s#module\.exports = ([a-zA-Z0-9_]+);#export default \1;#g"

echo "🎉 Conversión CommonJS → ESM completada en src/routes/*.js"
