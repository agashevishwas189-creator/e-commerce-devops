pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=e-commerce-project \
                          -Dsonar.projectName=E-Commerce-Project \
                          -Dsonar.sources=frontend,backend \
                          -Dsonar.exclusions=**/node_modules/**,**/*.min.js
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    sleep 10
                    curl -f http://localhost:8080/api/health
                '''
            }
        }
    }
}