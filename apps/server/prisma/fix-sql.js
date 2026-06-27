const fs = require('fs');
let sql = fs.readFileSync('schema.sql', 'utf8');

// Replace ADD CONSTRAINT with DROP IF EXISTS + ADD CONSTRAINT
sql = sql.replace(
  /(ALTER TABLE\s+"\w+"\s+)ADD CONSTRAINT\s+"(\w+)"\s+/g,
  '$1DROP CONSTRAINT IF EXISTS "$2";\n$1ADD CONSTRAINT "$2" '
);

fs.writeFileSync('schema.sql', sql);
console.log('Done - all ADD CONSTRAINT now have DROP IF EXISTS preceding them');
