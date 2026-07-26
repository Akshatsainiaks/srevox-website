export interface IncidentData {
  id: string;
  incidentTitle: string;
  namespace: string;
  severity: "critical" | "high" | "warning" | "info";
  cluster: string;
  restartCount: number;
  container: string;
  exitCode: number;
  firstSeen: string;
  lastSeen: string;
  defaultAckBy: string;
  defaultResBy: string;
  labels: string[];
  containerLogs: string;
  solutionYaml: string;
  rootCause: string;
  fixSteps: string[];
}

export const defaultIncidentData: IncidentData = {
  id: "simulated-payment-auth-api-914",
  incidentTitle: "simulated-payment-auth-api-914",
  namespace: "production",
  severity: "critical",
  cluster: "asca",
  restartCount: 8,
  container: "auth-api",
  exitCode: 1,
  firstSeen: "7m ago",
  lastSeen: "7m ago",
  defaultAckBy: "admin",
  defaultResBy: "admin",
  labels: ["app=auth-api", "env=production", "tier=backend"],
  containerLogs: `2026-07-26T16:40:01.102Z [server] Starting Srevox Payment Authentication Service v2.4.1...
2026-07-26T16:40:01.345Z [server] Loading configuration from /etc/config/auth.json...
2026-07-26T16:40:02.012Z [database] Connecting to Primary PostgreSQL Database at postgres.prod.svc.cluster.local:5432...
2026-07-26T16:40:02.450Z [database] Database connection established successfully (pool_size=20).
2026-07-26T16:40:03.118Z [redis] Initializing Redis Cache Connection at redis-cluster.prod.svc.cluster.local:6379...
2026-07-26T16:40:08.125Z [redis] [ERROR] Redis Connection Timeout after 5000ms: ECONNREFUSED redis-cluster.prod.svc.cluster.local:6379
2026-07-26T16:40:08.126Z [server] [FATAL] ConnectionRefusedError: Failed to connect to cache cluster
    at RedisClient.connect (/app/node_modules/ioredis/built/redis/index.js:284:14)
    at async initializeCache (/app/dist/services/redis.js:42:5)
    at async bootstrap (/app/dist/index.js:18:3)
2026-07-26T16:40:08.127Z [server] [CRASH] Process exited with status code 1. State: CrashLoopBackOff (Restart count: 8)`,
  solutionYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-api
  namespace: production
spec:
  template:
    spec:
      containers:
      - name: auth-api
        env:
        - name: REDIS_HOST
          value: "redis-cluster.production.svc.cluster.local"
        - name: REDIS_TIMEOUT_MS
          value: "10000"`,
  rootCause: `Redis Cache Connection timeout on redis-cluster.prod.svc.cluster.local:6379. The application worker process encountered ECONNREFUSED when initializing cache pool.`,
  fixSteps: [
    "Verify Redis Cluster service endpoint DNS resolution in production namespace.",
    "Ensure Redis pod limits are not hit (kubectl get pods -n production).",
    "Update environment variable REDIS_HOST to matching service selector."
  ]
};
