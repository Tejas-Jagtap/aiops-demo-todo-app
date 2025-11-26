pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        APP_NAME = 'aiops-demo-todo-app'
        BUILD_ID = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        
        // Toggle this to simulate build failures for log collection testing
        SIMULATE_FAILURE = 'false'
    }
    
    options {
        // Keep last 30 builds for log collection
        buildDiscarder(logRotator(numToKeepStr: '30', daysToKeepStr: '30'))
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Add timestamps to console output
        timestamps()
    }
    
    stages {
        stage('Environment Info') {
            steps {
                echo '========================================='
                echo 'AIOps Demo Todo App - Jenkins Pipeline'
                echo '========================================='
                echo "Build Number: ${env.BUILD_NUMBER}"
                echo "Build ID: ${env.BUILD_ID}"
                echo "Git Commit: ${GIT_COMMIT_SHORT}"
                echo "Node Version: ${NODE_VERSION}"
                echo "Jenkins URL: ${env.JENKINS_URL}"
                echo "Workspace: ${env.WORKSPACE}"
                echo '========================================='
                
                sh 'node --version || echo "Node not found"'
                sh 'npm --version || echo "NPM not found"'
                sh 'git --version || echo "Git not found"'
            }
        }
        
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
                
                // Display git information
                sh 'git log -1 --pretty=format:"%h - %an, %ar : %s"'
                sh 'git branch'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                dir('demo-todo-app') {
                    script {
                        // Simulate occasional dependency installation failures
                        if (env.SIMULATE_FAILURE == 'true' && env.BUILD_NUMBER.toInteger() % 5 == 0) {
                            echo 'WARNING: Simulating dependency installation failure'
                            sh 'npm install --legacy-peer-deps || exit 1'
                        } else {
                            sh 'npm install --legacy-peer-deps'
                            echo 'Dependencies installed successfully'
                        }
                    }
                }
            }
        }
        
        stage('Lint') {
            steps {
                echo 'Running ESLint...'
                dir('demo-todo-app') {
                    script {
                        try {
                            sh 'npm run lint'
                            echo 'Linting passed successfully'
                        } catch (Exception e) {
                            echo "WARNING: Linting issues detected: ${e.message}"
                            // Continue build even if linting fails
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running Jest test suite...'
                dir('demo-todo-app') {
                    script {
                        // Simulate test failures for specific builds
                        if (env.SIMULATE_FAILURE == 'true' && env.BUILD_NUMBER.toInteger() % 3 == 0) {
                            echo 'WARNING: Simulating test failure'
                            sh 'npm run test:ci || exit 1'
                        } else {
                            sh 'npm run test:ci'
                            echo 'All tests passed successfully'
                        }
                    }
                }
            }
            post {
                always {
                    // Publish test results
                    junit allowEmptyResults: true, testResults: 'demo-todo-app/coverage/junit.xml'
                    
                    // Publish coverage report
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'demo-todo-app/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Test Coverage Report'
                    ])
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo 'Building Next.js application...'
                dir('demo-todo-app') {
                    script {
                        // Simulate build failures occasionally
                        if (env.SIMULATE_FAILURE == 'true' && env.BUILD_NUMBER.toInteger() % 7 == 0) {
                            echo 'ERROR: Simulating build failure'
                            error('Build failed due to simulated error')
                        } else {
                            sh 'npm run build'
                            echo 'Application built successfully'
                            
                            // Check build output
                            sh 'ls -lah .next'
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            when {
                branch 'main'
            }
            steps {
                echo 'Building Docker image...'
                dir('demo-todo-app') {
                    script {
                        try {
                            sh "docker build -t ${APP_NAME}:${BUILD_ID} -t ${APP_NAME}:latest ."
                            echo "Docker image built: ${APP_NAME}:${BUILD_ID}"
                        } catch (Exception e) {
                            echo "WARNING: Docker build failed: ${e.message}"
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo 'Running npm audit...'
                dir('demo-todo-app') {
                    script {
                        try {
                            sh 'npm audit --audit-level=moderate'
                            echo 'No critical vulnerabilities found'
                        } catch (Exception e) {
                            echo "WARNING: Security vulnerabilities detected: ${e.message}"
                            // Mark build as unstable but don't fail
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }
        
        stage('Performance Check') {
            steps {
                echo 'Analyzing build size...'
                dir('demo-todo-app') {
                    sh '''
                        echo "Build Statistics:"
                        du -sh .next
                        echo "Static Files:"
                        du -sh .next/static 2>/dev/null || echo "No static files"
                    '''
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deployment stage (placeholder)...'
                script {
                    echo 'In production, this would deploy to:'
                    echo '- Kubernetes cluster'
                    echo '- Docker registry'
                    echo '- Cloud platform (Azure/AWS/GCP)'
                    echo "Image: ${APP_NAME}:${BUILD_ID}"
                }
            }
        }
    }
    
    post {
        always {
            echo '========================================='
            echo 'Pipeline Execution Complete'
            echo '========================================='
            echo "Build Result: ${currentBuild.result ?: 'SUCCESS'}"
            echo "Duration: ${currentBuild.durationString}"
            echo "Build Number: ${env.BUILD_NUMBER}"
            echo '========================================='
            
            // Clean up workspace (optional)
            // cleanWs()
        }
        
        success {
            echo '✓ Build completed successfully!'
            echo 'Logs collected for AIOps analysis'
        }
        
        failure {
            echo '✗ Build failed!'
            echo 'Failure logs will be analyzed by AIOps system'
            
            // In production, send notification
            // emailext subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //          body: "Check Jenkins for details: ${env.BUILD_URL}",
            //          to: "team@example.com"
        }
        
        unstable {
            echo '⚠ Build is unstable'
            echo 'Some tests or checks failed but build continued'
        }
        
        aborted {
            echo '⊗ Build was aborted'
        }
    }
}
