// =====================================================================
//  OMNIQA Playwright Framework — Jenkins Pipeline (Phase 21)
//  Declarative pipeline that runs the suite INSIDE the official Playwright
//  Docker image, with a disposable PostgreSQL sidecar for the db/e2e tests.
//  Every stage is commented.
//
//  Requires Jenkins plugins: Docker Pipeline, Allure, HTML Publisher,
//  Email Extension (emailext), AnsiColor, Timestamper.
// =====================================================================

/** Map the SUITE build parameter to Playwright CLI arguments. */
def suiteToArgs(String suite) {
  switch (suite) {
    case 'api':           return '--project=api'
    case 'db':            return '--project=db'
    case 'e2e':           return '--project=e2e'
    case 'ui':            return '--project=ui-chromium --project=ui-firefox --project=ui-webkit'
    case 'accessibility': return '--project=accessibility'
    case 'visual':        return '--project=visual'
    case 'performance':   return '--project=performance'
    case 'smoke':         return '--grep @smoke'
    default:              return '' // 'all' → every project
  }
}

pipeline {
  // No global agent: the heavy work runs on a Docker-capable node in the
  // "Build & Test" stage; lightweight stages need no executor of their own.
  agent any

  // ---- Build PARAMETERS (shown in "Build with Parameters") ----
  parameters {
    choice(name: 'TEST_ENV', choices: ['qa', 'dev', 'uat', 'staging'], description: 'Target environment')
    choice(name: 'SUITE', choices: ['all', 'smoke', 'api', 'db', 'e2e', 'ui', 'accessibility', 'visual', 'performance'], description: 'Which suite to run')
    string(name: 'WORKERS', defaultValue: '4', description: 'Playwright parallel workers')
    string(name: 'EMAIL_RECIPIENTS', defaultValue: 'qa-team@example.com', description: 'Comma-separated notification recipients')
    booleanParam(name: 'UPDATE_VISUAL', defaultValue: false, description: 'Regenerate visual baselines (use with care)')
  }

  // ---- OPTIONS: logging, timeout, history retention, no overlap ----
  options {
    timestamps()                                   // prefix every log line with a time
    ansiColor('xterm')                             // render coloured Playwright output
    timeout(time: 45, unit: 'MINUTES')             // hard cap on a stuck build
    buildDiscarder(logRotator(numToKeepStr: '20')) // keep only the last 20 builds
    disableConcurrentBuilds()                      // one run per branch at a time
  }

  // ---- Nightly run in addition to SCM triggers ----
  triggers {
    cron('H 2 * * *')
  }

  // ---- ENVIRONMENT shared by every stage ----
  environment {
    PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.49.1-jammy'
    CI = 'true'
    HEADLESS = 'true'
    TEST_ENV = "${params.TEST_ENV}"
    // Public demo targets (NOT secrets).
    SAUCEDEMO_URL = 'https://www.saucedemo.com'
    SAUCEDEMO_USERNAME = 'standard_user'
    SAUCEDEMO_PASSWORD = 'secret_sauce'
    ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com'
    ORANGEHRM_USERNAME = 'Admin'
    ORANGEHRM_PASSWORD = 'admin123'
    RESTFUL_BOOKER_URL = 'https://restful-booker.herokuapp.com'
    BOOKER_USERNAME = 'admin'
    BOOKER_PASSWORD = 'password123'
    REQRES_URL = 'https://reqres.in/api'
    REQRES_API_KEY = 'reqres-free-v1'
    DUMMYJSON_URL = 'https://dummyjson.com'
    JSONPLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com'
    PETSTORE_URL = 'https://petstore.swagger.io/v2'
    // DB points at the sidecar container (linked as hostname `postgres`).
    DB_HOST = 'postgres'
    DB_PORT = '5432'
    DB_NAME = 'automation_db'
    DB_USER = 'automation_user'
    DB_PASSWORD = 'automation_pass'
    DB_SSL = 'false'
    // Demo default; in production bind a secret:
    //   ENCRYPTION_SECRET = credentials('omniqa-encryption-secret')
    ENCRYPTION_SECRET = 'ci-test-secret'
  }

  stages {
    // ----------------------------------------------------------------
    //  Stage 1 — Checkout: pull the revision Jenkins was triggered for.
    // ----------------------------------------------------------------
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    // ----------------------------------------------------------------
    //  Stage 2 — Build & Test: spin a Postgres sidecar, then run the
    //  whole pipeline INSIDE the Playwright image (Docker execution).
    // ----------------------------------------------------------------
    stage('Build & Test') {
      steps {
        script {
          // Start a throwaway Postgres; `withRun` stops + removes it when the
          // closure exits (even on failure). Bootstrap user/db == our config.
          docker.image('postgres:16-alpine').withRun(
            '-e POSTGRES_USER=automation_user -e POSTGRES_PASSWORD=automation_pass -e POSTGRES_DB=automation_db'
          ) { db ->
            // Run our steps in the Playwright container; `--link` makes the DB
            // reachable as host `postgres`; `--ipc=host` prevents Chromium OOM;
            // `-u root` so npm/Playwright can write the mounted workspace.
            docker.image(env.PLAYWRIGHT_IMAGE).inside("--ipc=host -u root --link ${db.id}:postgres") {

              // ---- Nested stage: install locked dependencies ----
              stage('Install') {
                sh 'npm ci'
              }

              // ---- Nested stage: static analysis IN PARALLEL ----
              stage('Static Analysis') {
                parallel(
                  'Type-check': {
                    sh 'npm run typecheck' // strict gate
                  },
                  'Lint': {
                    // ESLint config is finalised in Phase 23 — don't fail the
                    // build yet, just mark the stage UNSTABLE if it errors.
                    catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                      sh 'npm run lint'
                    }
                  }
                )
              }

              // ---- Nested stage: seed the DB (retry until ready) ----
              stage('Seed Database') {
                sh '''
                  for i in $(seq 1 15); do
                    if npm run db:schema; then exit 0; fi
                    echo "Postgres not ready yet (attempt $i) — retrying in 3s..."
                    sleep 3
                  done
                  echo "Database never became ready"; exit 1
                '''
              }

              // ---- Nested stage: run the selected suite ----
              stage('Tests') {
                script {
                  def args = suiteToArgs(params.SUITE)
                  def update = params.UPDATE_VISUAL ? '--update-snapshots' : ''
                  // Playwright parallelises across WORKERS internally; for
                  // cross-AGENT scale-out use `--shard=i/n` over parallel nodes.
                  sh "npx playwright test ${args} --workers=${params.WORKERS} ${update}"
                }
              }
            }
          }
        }
      }
    }
  }

  // ==================================================================
  //  POST — reports, artifacts, and email notifications (always run).
  // ==================================================================
  post {
    always {
      // JUnit → trend graphs + test result UI.
      junit testResults: 'reports/junit/*.xml', allowEmptyResults: true

      // Allure interactive report (Allure Jenkins plugin).
      allure includeProperties: false, results: [[path: 'reports/allure-results']]

      // Playwright's own HTML report (HTML Publisher plugin).
      publishHTML(target: [
        reportDir: 'reports/html-report',
        reportFiles: 'index.html',
        reportName: 'Playwright HTML Report',
        keepAll: true,
        alwaysLinkToLastBuild: true,
        allowMissing: true
      ])

      // Raw artifacts (traces/screenshots/videos/logs) for deep debugging.
      archiveArtifacts artifacts: 'reports/**, test-results/**, logs/**', allowEmptyArchive: true
    }

    // ---- Email on failure / recovery ----
    failure {
      emailext(
        to: "${params.EMAIL_RECIPIENTS}",
        subject: "❌ FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (${params.TEST_ENV})",
        body: """The OMNIQA pipeline FAILED.

Job:     ${env.JOB_NAME} #${env.BUILD_NUMBER}
Suite:   ${params.SUITE}   Env: ${params.TEST_ENV}
Console: ${env.BUILD_URL}console
Report:  ${env.BUILD_URL}allure
""",
        attachLog: true
      )
    }
    unstable {
      emailext(
        to: "${params.EMAIL_RECIPIENTS}",
        subject: "⚠️ UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: "Some checks were unstable. See ${env.BUILD_URL}"
      )
    }
    fixed {
      emailext(
        to: "${params.EMAIL_RECIPIENTS}",
        subject: "✅ RECOVERED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: "The pipeline is green again. ${env.BUILD_URL}"
      )
    }

    // Always wipe the workspace so the next build starts clean.
    cleanup {
      cleanWs()
    }
  }
}
