import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import mongoose from 'mongoose';

// Run from backend/. Persist only allowlisted evidence; raw HTTP output contains secrets.
const root = path.resolve('..');
const cache = path.resolve('.cache/demo');
fs.mkdirSync(cache, { recursive: true, mode: 0o700 });
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const snapshot = async collection => new Map((await mongoose.connection.db.collection(collection).find().toArray()).map(x => [String(x._id), digest(x)]));
const counts = async () => Object.fromEntries(await Promise.all(['users', 'campgrounds', 'bookings'].map(async n => [n, await mongoose.connection.db.collection(n).countDocuments()])));
const write = (file, data) => { fs.writeFileSync(file + '.tmp', JSON.stringify(data, null, 2) + '\n', { mode: 0o600 }); fs.renameSync(file + '.tmp', file); };
let server;
let journal;
let adminToken;
let base;
let failed = false;
let interrupted = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  interrupted = true; failed = true; report.interrupted = signal;
  console.error('Interruption requested; finishing the current collection before cleanup.');
});
const report = { startedAt: new Date().toISOString(), runtime: process.version, machine: { platform: os.platform(), release: os.release(), arch: os.arch(), cpu: os.cpus()[0]?.model, memoryGiB: Math.round(os.totalmem() / 2 ** 30) }, network: 'Local loopback HTTP; database uses the host network to configured Atlas. Connection type/location not independently verified.', runner: { name: 'Postman CLI', version: spawnSync('postman', ['--version'], {encoding:'utf8'}).stdout?.trim() || 'unavailable' }, atlas: { region: process.env.VERIFY_ATLAS_REGION || 'unverified', tier: process.env.VERIFY_ATLAS_TIER || 'unverified' }, runs: [] };
const reportFile = path.join(root, 'docs/evidence', `demo-${Date.now()}.json`);
fs.mkdirSync(path.dirname(reportFile), { recursive: true });
const persist = () => { if (journal) write(journal.file, journal); write(reportFile, report); };
const request = async (method, route, body) => {
  const response = await fetch(base + '/api/v1/' + route, { method, headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: 'Bearer ' + adminToken } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
  return { status: response.status, body: await response.json() };
};
async function startServer() {
  const probe = net.createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
  base = `http://127.0.0.1:${port}`;
  const began = performance.now();
  server = spawn(process.execPath, ['dist/server.js'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Backend readiness timeout')), 20000);
    server.stdout.on('data', chunk => { if (chunk.toString().includes('API listening')) { clearTimeout(timer); resolve(); } });
    server.once('exit', () => { clearTimeout(timer); reject(new Error('Backend exited before readiness')); });
  });
  report.applicationStartupMs = Math.round(performance.now() - began);
}
async function cleanup() {
  if (!journal || !adminToken) return;
  for (const id of journal.bookingIds) {
    const result = await request('DELETE', 'bookings/' + id);
    if (![200, 404].includes(result.status)) throw new Error('Run-owned booking cleanup failed');
  }
  journal.cleaned = true; persist();
}
try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  report.databaseTarget = /mongodb\.net|^mongodb\+srv:/.test(process.env.MONGO_URI || '') ? 'Configured Atlas database' : 'Configured non-Atlas database';
  const before = await snapshot('bookings');
  const campsBefore = await snapshot('campgrounds');
  report.initialCounts = await counts();
  const admin = await mongoose.connection.db.collection('users').findOne({ email: process.env.ADMIN_EMAIL?.trim().toLowerCase() });
  if (!admin) {
    const setup = spawnSync('npm', ['run', 'setup:admin'], { stdio: 'ignore' });
    if (setup.status !== 0) throw new Error('Administrator setup failed');
  }
  await startServer();
  const login = await request('POST', 'auth/login', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  if (login.status !== 200 || login.body.data?.role !== 'admin') throw new Error('Configured administrator login failed');
  adminToken = login.body.token;
  // Recovery never discovers candidates from a broad administrator booking list.
  const recover = process.argv.indexOf('--recover');
  if (recover !== -1) {
    const file = path.resolve(process.argv[recover + 1]);
    if (path.dirname(file) !== cache) throw new Error('Recovery journal must be inside backend/.cache/demo');
    journal = JSON.parse(fs.readFileSync(file, 'utf8')); journal.file = file;
    if (journal.targetDigest !== digest(process.env.MONGO_URI)) throw new Error('Recovery database differs from journal');
    await cleanup(); report.recovery = 'Run-owned IDs cleaned';
  } else {
    if (report.initialCounts.campgrounds < 3) {
      const seed = spawnSync('npm', ['run', 'seed:campgrounds'], { stdio: 'ignore' });
      if (seed.status !== 0) throw new Error('Campground seeding failed');
    }
    for (let iteration = 0; iteration < 3; iteration++) {
      if (interrupted) throw new Error('Verification interrupted');
      const runId = crypto.randomUUID();
      journal = { file: path.join(cache, runId + '.json'), targetDigest: digest(process.env.MONGO_URI), runId, bookingIds: [], cleaned: false };
      const run = { runId, condition: iteration === 0 ? 'First collection after application restart and administrator preflight; Atlas already connected, not Atlas cold start' : 'Repeated collection on same backend', before: await counts(), requests: [], assertions: 0, failures: [] };
      report.runs.push(run); persist();
      const collection = JSON.parse(fs.readFileSync(path.join(root, 'postman/demo.postman_collection.json')));
      // Instrument a local copy. The installed Postman CLI runs without cloud login.
      const globalTests = collection.event.filter(e => e.listen === 'test').flatMap(e => e.script.exec);
      collection.event = [];
      for (const item of collection.item) {
        const tests = item.event.filter(e => e.listen === 'test').flatMap(e => e.script.exec);
        item.event = item.event.filter(e => e.listen !== 'test');
        item.event.push({ listen: 'test', script: { type: 'text/javascript', exec: [
          "let checks = 0; const failures = [];",
          "function verifyTest(name, fn) { checks++; return pm.test(name, function() { try { fn(); } catch (error) { failures.push(name); throw error; } }); }",
          'try {', ...[...globalTests, ...tests].map(line => line.replaceAll('pm.test(', 'verifyTest(')),
          "} catch (error) { failures.push('Script: '+error.name); throw error; } finally {",
          "let bookingId; try { if (pm.request.method === 'POST' && pm.request.url.toString().endsWith('/bookings') && pm.response.code === 201) bookingId = pm.response.json().data.id; } catch {}",
          "console.log('VERIFY_METRIC '+JSON.stringify({name:pm.info.requestName,method:pm.request.method,status:pm.response.code,ms:pm.response.responseTime,assertions:checks,failures,bookingId}));",
          '}'
        ] } });
      }
      const collectionFile = path.join(cache, runId + '-collection.json');
      const environmentFile = path.join(cache, runId + '-environment.json');
      write(collectionFile, collection);
      write(environmentFile, { values: [{ key: 'BASE_URL', value: base }, { key: 'ADMIN_EMAIL', value: process.env.ADMIN_EMAIL }, { key: 'ADMIN_PASSWORD', value: process.env.ADMIN_PASSWORD }, { key: 'VERIFY_RUN_ID', value: runId }] });
      let cli;
      try {
        const exitCode = await new Promise((resolve, reject) => {
          cli = spawn('postman', ['collection', 'run', collectionFile, '-e', environmentFile, '--no-report-events', '--timeout-request', '15000', '--timeout-script', '10000'], { stdio: ['ignore', 'pipe', 'pipe'] });
          let pending = '';
          let metricText = '';
          cli.stdout.on('data', chunk => {
            pending += chunk.toString();
            const lines = pending.split('\n'); pending = lines.pop();
            for (const line of lines) {
              const logLine = line.match(/^\s*\| (.*)$/);
              if (!logLine) continue;
              const segment = logLine[1];
              if (segment.includes('VERIFY_METRIC ')) metricText = segment.slice(segment.indexOf('VERIFY_METRIC ') + 14);
              else if (metricText) metricText += segment;
              if (!metricText.endsWith("}'")) continue;
              const metric = JSON.parse(metricText.slice(0, -1));
              metricText = '';
              if (/^[a-f0-9]{24}$/.test(metric.bookingId || '')) journal.bookingIds.push(metric.bookingId);
              run.assertions += metric.assertions;
              run.failures.push(...metric.failures.map(assertion => ({ request: metric.name, assertion })));
              run.requests.push({ name: metric.name, method: metric.method, status: metric.status, ms: metric.ms });
              persist();
            }
          });
          cli.stderr.on('data', () => {}); // Never persist arbitrary CLI output.
          cli.once('error', reject);
          cli.once('close', resolve);
        });
        run.exitCode = exitCode;
        if (exitCode !== 0 || run.requests.length !== collection.item.length || run.failures.length || run.requests.some(x => !Number.isFinite(x.ms) || x.ms > 3000)) { failed = true; run.failed = true; }
        if (run.requests.length !== collection.item.length) run.failures.push({ type: 'runner', name: 'Incomplete request metrics' });
      } finally {
        fs.rmSync(environmentFile, { force: true }); fs.rmSync(collectionFile, { force: true });
      }
      await cleanup();
      run.after = await counts();
      run.maxMs = Math.max(...run.requests.map(x => x.ms || 0));
      run.requestCount = run.requests.length;
      persist();
      console.log(JSON.stringify({ run: iteration + 1, requests: run.requestCount, assertions: run.assertions, failures: run.failures.length, maxMs: run.maxMs }));
      if (run.failed || interrupted) break;
    }
  }
  const after = await snapshot('bookings');
  const campsAfter = await snapshot('campgrounds');
  report.preservation = { originalBookingsUnchanged: [...before].filter(([id]) => !(process.argv.includes('--recover') && journal.bookingIds.includes(id))).every(([id, hash]) => after.get(id) === hash), originalCampgroundsUnchanged: [...campsBefore].every(([id, hash]) => campsAfter.get(id) === hash), noRunBookingsRemain: (await mongoose.connection.db.collection('bookings').countDocuments({ _id: { $in: (process.argv.includes('--recover') ? journal.bookingIds : report.runs.flatMap(r => JSON.parse(fs.readFileSync(path.join(cache, r.runId + '.json'))).bookingIds)).map(id => new mongoose.Types.ObjectId(id)) } })) === 0 };
  if (Object.values(report.preservation).some(x => !x)) failed = true;
  report.finalCounts = await counts();
} catch (error) {
  failed = true;
  // Error messages from drivers and requests may include credentials/URIs.
  report.blocker = { type: error.name, code: error.code || null, step: error.message?.startsWith('Configured administrator') ? 'administrator login' : 'verification setup or execution' };
  console.error('Verification failed; inspect sanitized evidence and local configuration.');
} finally {
  try { if (journal && !journal.cleaned) await cleanup(); } catch { report.cleanupIncomplete = true; failed = true; }
  if (server && server.exitCode === null) { server.kill('SIGTERM'); await Promise.race([once(server, 'exit'), new Promise(resolve => setTimeout(() => { if (server.exitCode === null) server.kill('SIGKILL'); resolve(); }, 5000).unref())]); }
  await mongoose.disconnect();
  report.passed = !failed; report.finishedAt = new Date().toISOString(); persist();
}
console.log('Sanitized evidence: ' + reportFile);
process.exitCode = failed ? 1 : 0;
