// CorAM load test (non-production only)
// Usage (only after deploying a local/Preview/staging target):
//   TARGET_ENV=preview ALLOW_NON_PROD_LOAD_TEST=true BASE_URL=https://preview.example.com k6 run load-tests/k6/read-libraries.js
//
// This script refuses production and has automatic abort thresholds. Do not run it
// against the production domain or against a target without written approval.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const baseUrl = (__ENV.BASE_URL || '').replace(/\/$/, '');
const targetEnv = __ENV.TARGET_ENV || '';
const approved = __ENV.ALLOW_NON_PROD_LOAD_TEST === 'true';

if (!approved || !['local', 'preview', 'staging', 'qa'].includes(targetEnv) || !baseUrl) {
  throw new Error('Refusing to run: set BASE_URL, TARGET_ENV=(local|preview|staging|qa), and ALLOW_NON_PROD_LOAD_TEST=true.');
}
if (/localhost|127\.0\.0\.1/.test(baseUrl) ? targetEnv !== 'local' : targetEnv === 'local') {
  throw new Error('TARGET_ENV must match the target URL class.');
}
if (/production|prod\.coram|www\.coram/i.test(baseUrl)) {
  throw new Error('Refusing a production-looking URL.');
}

const errorRate = new Rate('application_errors');
const responseDuration = new Trend('response_duration', true);

export const options = {
  scenarios: {
    progressive_navigation: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '60s', target: 10 },
        { duration: '45s', target: 50 },
        { duration: '90s', target: 50 },
        { duration: '60s', target: 100 },
        { duration: '120s', target: 100 },
        { duration: '90s', target: 250 },
        { duration: '180s', target: 250 },
        { duration: '60s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true, delayAbortEval: '30s' }],
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    application_errors: [{ threshold: 'rate<0.02', abortOnFail: true, delayAbortEval: '30s' }],
  },
};

const routes = ['/app/inicio', '/app/himnario', '/app/corarios', '/app/academia', '/app/recursos'];

export default function () {
  const route = routes[(__VU + __ITER) % routes.length];
  const response = http.get(`${baseUrl}${route}`, {
    redirects: 0,
    tags: { route },
    timeout: '10s',
  });

  responseDuration.add(response.timings.duration);
  const ok = check(response, {
    'response is an app shell or an expected auth redirect': (r) => r.status === 200 || (r.status >= 300 && r.status < 400),
    'response is not rate-limited or server-failed': (r) => r.status !== 429 && r.status < 500,
  });
  errorRate.add(!ok);
  sleep(1);
}
