const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/data/domains/*.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace `return mock[A-Za-z]+;` that are inside `if (error || !data` or similar error branches.
  content = content.replace(/if\s*\([^)]+(error|!data)[^)]*\)\s*\{\s*return\s+(mock[a-zA-Z0-9_]+);\s*\}/g, (match, p1, mockVar) => {
    return `if (${match.substring(3, match.indexOf(')'))})) {
    if (process.env.NODE_ENV === 'development') {
      return ${mockVar};
    }
    return [];
  }`;
  });

  // What about if it's `return mockProducts.find`?
  content = content.replace(/if\s*\([^)]+(error|!data)[^)]*\)\s*\{\s*return\s+(mock[a-zA-Z0-9_]+\.(?:find|filter)[^;]+);\s*\}/g, (match, p1, mockCode) => {
    return `if (${match.substring(3, match.indexOf(')'))})) {
    if (process.env.NODE_ENV === 'development') {
      return ${mockCode};
    }
    return null; // Fallback for single item or array based on return type; TS might complain if it expects array but gets null. Actually let's not touch complex ones unless we know the return type.
  }`;
  });

  fs.writeFileSync(file, content);
});
