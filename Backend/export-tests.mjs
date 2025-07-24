// export-tests.js
import fs from 'fs';
import { parse } from 'json2csv';
import path from 'path';

const raw = JSON.parse(fs.readFileSync('jest-results.json', 'utf8'));

const rows = [];
raw.testResults.forEach(suite => {
  // e.g. "/Users/yasmeen/.../tests/integration/users.controller.int.test.mjs"
  const rel = suite.name.split('/tests/')[1]  || suite.name;
  const [type, file] = rel.split('/');              // ["integration","users.controller.int.test.mjs"]
  const name = path.basename(file);                 // "users.controller.int.test.mjs"

  suite.assertionResults.forEach(a => {
    rows.push({
      suiteType: type,                               // integration | unit
      suiteFile: name,                               // users.controller.int.test.mjs
      testName: [...a.ancestorTitles, a.title].join(' › '),
      status: a.status,
      durationMs: a.duration ?? '',
    });
  });
});

const csv = parse(rows, {
  fields: ['suiteType','suiteFile','testName','status','durationMs']
});
fs.writeFileSync('test-results.csv', csv);
console.log('Wrote test-results.csv');
