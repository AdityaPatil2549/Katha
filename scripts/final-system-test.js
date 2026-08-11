#!/usr/bin/env node

/**
 * Smriti Atlas Final System Testing Suite
 * Comprehensive testing before production deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Test configuration
const TEST_CONFIG = {
    timeout: 30000, // 30 seconds per test
    retries: 3,
    parallel: false,
    coverage: true,
    reporting: true
};

class FinalSystemTester {
    constructor() {
        this.startTime = Date.now();
        this.testResults = [];
        this.currentTest = null;
        this.errors = [];
        this.warnings = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
        console.log(`${prefix} ${message}`);
    }

    logError(message) {
        this.errors.push(message);
        this.log(message, 'error');
    }

    logWarning(message) {
        this.warnings.push(message);
        this.log(message, 'warning');
    }

    async runTest(testName, testFn, timeout = TEST_CONFIG.timeout) {
        const testResult = {
            name: testName,
            status: 'running',
            startTime: Date.now(),
            endTime: null,
            duration: null,
            error: null,
            details: null
        };

        this.currentTest = testName;
        this.log(`🧪 Running test: ${testName}`);
        this.testResults.push(testResult);

        try {
            const result = await Promise.race([
                testFn(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Test timeout')), timeout)
                )
            ]);

            testResult.status = 'passed';
            testResult.details = result;
            this.log(`✅ ${testName} passed`);

        } catch (error) {
            testResult.status = 'failed';
            testResult.error = error.message;
            this.logError(`❌ ${testName} failed: ${error.message}`);
        } finally {
            testResult.endTime = Date.now();
            testResult.duration = testResult.endTime - testResult.startTime;
            this.currentTest = null;
        }

        return testResult;
    }

    // Test Categories

    async testEnvironmentSetup() {
        return this.runTest('Environment Setup', async() => {
            // Check Node.js version
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

            if (majorVersion < 18) {
                throw new Error(`Node.js version ${nodeVersion} is not supported`);
            }

            // Check package.json
            if (!fs.existsSync('package.json')) {
                throw new Error('package.json not found');
            }

            // Check dependencies
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredDeps = ['react', 'react-dom', 'typescript', 'vite'];

            for (const dep of requiredDeps) {
                if (!packageJson.dependencies ? .[dep] && !packageJson.devDependencies ? .[dep]) {
                    throw new Error(`Required dependency missing: ${dep}`);
                }
            }

            return {
                nodeVersion,
                platform: process.platform,
                arch: process.arch,
                dependencies: Object.keys(packageJson.dependencies || {}),
                devDependencies: Object.keys(packageJson.devDependencies || {})
            };
        });
    }

    async testTypeScriptCompilation() {
        return this.runTest('TypeScript Compilation', async() => {
            try {
                execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
                return { success: true };
            } catch (error) {
                throw new Error(`TypeScript compilation failed: ${error.stdout?.toString() || error.message}`);
            }
        });
    }

    async testCodeQuality() {
        return this.runTest('Code Quality', async() => {
            const results = {};

            // ESLint check
            try {
                execSync('npx eslint src --ext .ts,.tsx --max-warnings 10', { stdio: 'pipe' });
                results.eslint = 'passed';
            } catch (error) {
                results.eslint = `failed: ${error.stdout?.toString() || error.message}`;
            }

            // Check for console.log statements (should be removed in production)
            const srcFiles = this.getAllFiles('src', ['.ts', '.tsx']);
            let consoleLogCount = 0;

            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                consoleLogCount += (content.match(/console\.log/g) || []).length;
            }

            results.consoleLogs = consoleLogCount;
            if (consoleLogCount > 5) {
                this.logWarning(`Found ${consoleLogCount} console.log statements`);
            }

            // Check for TODO comments
            let todoCount = 0;
            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                todoCount += (content.match(/\/\/ TODO|\/\*.*TODO/gi) || []).length;
            }

            results.todos = todoCount;
            if (todoCount > 0) {
                this.logWarning(`Found ${todoCount} TODO comments`);
            }

            return results;
        });
    }

    async testDataIntegrity() {
        return this.runTest('Data Integrity', async() => {
            const dataDir = 'public/data';
            const results = {};

            if (!fs.existsSync(dataDir)) {
                throw new Error('Data directory not found');
            }

            const dataFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

            for (const file of dataFiles) {
                const filePath = path.join(dataDir, file);

                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const parsed = JSON.parse(content);

                    results[file] = {
                        size: fs.statSync(filePath).size,
                        valid: true,
                        keys: Object.keys(parsed).length
                    };

                    // Validate specific data structures
                    if (file === 'atlas-core-v1.json') {
                        if (!Array.isArray(parsed)) {
                            throw new Error('atlas-core-v1.json should be an array');
                        }
                        results[file].entryCount = parsed.length;
                    }

                } catch (error) {
                    results[file] = {
                        size: fs.statSync(filePath).size,
                        valid: false,
                        error: error.message
                    };
                }
            }

            return results;
        });
    }

    async testBuildProcess() {
        return this.runTest('Build Process', async() => {
            // Clean previous build
            if (fs.existsSync('dist')) {
                fs.rmSync('dist', { recursive: true });
            }

            // Set production environment
            process.env.NODE_ENV = 'production';

            // Run build
            try {
                execSync('npm run build', { stdio: 'pipe' });
            } catch (error) {
                throw new Error(`Build failed: ${error.stdout?.toString() || error.message}`);
            }

            // Check build output
            if (!fs.existsSync('dist')) {
                throw new Error('Build directory not created');
            }

            const buildFiles = this.getAllFiles('dist');
            const indexHtml = fs.existsSync('dist/index.html');

            if (!indexHtml) {
                throw new Error('index.html not found in build output');
            }

            // Check for essential files
            const essentialFiles = ['index.html'];
            const jsFiles = buildFiles.filter(file => file.endsWith('.js'));
            const cssFiles = buildFiles.filter(file => file.endsWith('.css'));

            return {
                buildFiles: buildFiles.length,
                jsFiles: jsFiles.length,
                cssFiles: cssFiles.length,
                essentialFiles: essentialFiles.filter(file => fs.existsSync(`dist/${file}`)),
                totalSize: buildFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0)
            };
        });
    }

    async testBundleAnalysis() {
        return this.runTest('Bundle Analysis', async() => {
            if (!fs.existsSync('dist')) {
                throw new Error('Build directory not found - run build test first');
            }

            const results = {
                bundles: {},
                totalSize: 0,
                warnings: []
            };

            const buildFiles = this.getAllFiles('dist');

            for (const file of buildFiles) {
                const stats = fs.statSync(file);
                const sizeKB = stats.size / 1024;
                const ext = path.extname(file);

                results.totalSize += stats.size;

                if (ext === '.js') {
                    results.bundles[path.basename(file)] = {
                        type: 'javascript',
                        size: sizeKB,
                        path: file
                    };

                    if (sizeKB > 500) {
                        results.warnings.push(`Large JavaScript bundle: ${path.basename(file)} (${sizeKB.toFixed(1)}KB)`);
                    }
                } else if (ext === '.css') {
                    results.bundles[path.basename(file)] = {
                        type: 'css',
                        size: sizeKB,
                        path: file
                    };

                    if (sizeKB > 200) {
                        results.warnings.push(`Large CSS bundle: ${path.basename(file)} (${sizeKB.toFixed(1)}KB)`);
                    }
                }
            }

            return results;
        });
    }

    async testRuntimeDependencies() {
        return this.runTest('Runtime Dependencies', async() => {
            const results = {
                browserFeatures: {},
                apis: {},
                polyfills: []
            };

            // Check for browser API usage
            const srcFiles = this.getAllFiles('src', ['.ts', '.tsx']);
            const apiUsage = {
                'localStorage': /localStorage/g,
                'sessionStorage': /sessionStorage/g,
                'indexedDB': /indexedDB/g,
                'fetch': /fetch\(/g,
                'Web Workers': /Worker\(/g,
                'Service Worker': /navigator\.serviceWorker/g
            };

            for (const [api, pattern] of Object.entries(apiUsage)) {
                let count = 0;
                for (const file of srcFiles) {
                    const content = fs.readFileSync(file, 'utf8');
                    count += (content.match(pattern) || []).length;
                }
                results.apis[api] = count;
            }

            // Check for polyfills
            const polyfillPatterns = [
                /polyfill/gi,
                /core-js/gi,
                /babel-polyfill/gi
            ];

            for (const pattern of polyfillPatterns) {
                for (const file of srcFiles) {
                    const content = fs.readFileSync(file, 'utf8');
                    if (pattern.test(content)) {
                        results.polyfills.push(path.basename(file));
                    }
                }
            }

            return results;
        });
    }

    async testSecurity() {
        return this.runTest('Security Analysis', async() => {
            const results = {
                vulnerabilities: [],
                sensitiveData: [],
                dependencies: {}
            };

            // Check for sensitive data exposure
            const sensitivePatterns = [
                /password/gi,
                /secret/gi,
                /token/gi,
                /api[_-]?key/gi,
                /private[_-]?key/gi
            ];

            const srcFiles = this.getAllFiles('src', ['.ts', '.tsx']);

            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');

                for (const pattern of sensitivePatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        results.sensitiveData.push({
                            file: path.basename(file),
                            pattern: pattern.source,
                            count: matches.length
                        });
                    }
                }
            }

            // Check for eval() usage
            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('eval(')) {
                    results.vulnerabilities.push({
                        file: path.basename(file),
                        issue: 'eval() usage detected',
                        severity: 'high'
                    });
                }
            }

            // Check for inline event handlers
            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('onClick=') || content.includes('onSubmit=')) {
                    results.vulnerabilities.push({
                        file: path.basename(file),
                        issue: 'Inline event handlers detected',
                        severity: 'medium'
                    });
                }
            }

            return results;
        });
    }

    async testPerformance() {
        return this.runTest('Performance Analysis', async() => {
            const results = {
                bundleSize: 0,
                assetCount: 0,
                optimizations: [],
                warnings: []
            };

            if (!fs.existsSync('dist')) {
                throw new Error('Build directory not found');
            }

            const buildFiles = this.getAllFiles('dist');
            results.assetCount = buildFiles.length;

            // Calculate total bundle size
            for (const file of buildFiles) {
                const stats = fs.statSync(file);
                results.bundleSize += stats.size;
            }

            const sizeMB = results.bundleSize / (1024 * 1024);

            if (sizeMB > 5) {
                results.warnings.push(`Total bundle size is large: ${sizeMB.toFixed(2)}MB`);
            }

            // Check for optimization opportunities
            const srcFiles = this.getAllFiles('src', ['.ts', '.tsx']);

            // Check for unused imports
            for (const file of srcFiles) {
                const content = fs.readFileSync(file, 'utf8');
                const imports = content.match(/import.*from/g) || [];

                if (imports.length > 10) {
                    results.optimizations.push({
                        file: path.basename(file),
                        suggestion: 'Consider reducing number of imports',
                        imports: imports.length
                    });
                }
            }

            return results;
        });
    }

    async testAccessibility() {
        return this.runTest('Accessibility Compliance', async() => {
            const results = {
                issues: [],
                checks: {
                    altText: true,
                    ariaLabels: true,
                    semanticHTML: true,
                    keyboardNavigation: true
                }
            };

            const tsxFiles = this.getAllFiles('src', ['.tsx']);

            for (const file of tsxFiles) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for images without alt text
                const imgTags = content.match(/<img[^>]*>/g) || [];
                for (const tag of imgTags) {
                    if (!tag.includes('alt=')) {
                        results.issues.push({
                            file: path.basename(file),
                            issue: 'Image without alt text',
                            tag: tag.substring(0, 50) + '...'
                        });
                    }
                }

                // Check for buttons without aria-label or text
                const buttonTags = content.match(/<button[^>]*>/g) || [];
                for (const tag of buttonTags) {
                    if (!tag.includes('aria-label=') && !tag.includes('title=')) {
                        results.issues.push({
                            file: path.basename(file),
                            issue: 'Button without accessible text',
                            tag: tag.substring(0, 50) + '...'
                        });
                    }
                }
            }

            return results;
        });
    }

    getAllFiles(dir, extensions = null) {
        const files = [];

        function traverse(currentDir) {
            try {
                const items = fs.readdirSync(currentDir);

                for (const item of items) {
                    const fullPath = path.join(currentDir, item);
                    const stats = fs.statSync(fullPath);

                    if (stats.isDirectory()) {
                        traverse(fullPath);
                    } else {
                        if (!extensions || extensions.includes(path.extname(fullPath))) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }

        traverse(dir);
        return files;
    }

    async generateTestReport() {
        this.log('Generating test report...');

        const passedTests = this.testResults.filter(test => test.status === 'passed');
        const failedTests = this.testResults.filter(test => test.status === 'failed');
        const totalDuration = Date.now() - this.startTime;

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.length,
                passed: passedTests.length,
                failed: failedTests.length,
                duration: totalDuration,
                success: failedTests.length === 0
            },
            tests: this.testResults,
            errors: this.errors,
            warnings: this.warnings,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };

        const reportPath = 'test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        this.log(`Test report saved to ${reportPath}`);
        return report;
    }

    async runAllTests() {
        this.log('🚀 Starting Smriti Atlas Final System Testing');
        this.log('==============================================');

        const testSuites = [
            this.testEnvironmentSetup,
            this.testTypeScriptCompilation,
            this.testCodeQuality,
            this.testDataIntegrity,
            this.testBuildProcess,
            this.testBundleAnalysis,
            this.testRuntimeDependencies,
            this.testSecurity,
            this.testPerformance,
            this.testAccessibility
        ];

        for (const testSuite of testSuites) {
            await testSuite.call(this);
            this.log(''); // Empty line for readability
        }

        const report = await this.generateTestReport();

        this.log('==============================================');
        if (report.summary.success) {
            this.log('✅ All tests passed successfully!');
            this.log(`📊 ${report.summary.passed}/${report.summary.total} tests passed`);
            this.log(`⏱️  Total duration: ${report.summary.duration}ms`);
        } else {
            this.log('❌ Some tests failed!');
            this.log(`📊 ${report.summary.passed}/${report.summary.total} tests passed`);
            this.log(`🚨 ${report.summary.failed} tests failed`);
            this.log(`⚠️  ${this.warnings.length} warnings`);
        }
        this.log('==============================================');

        return report;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new FinalSystemTester();
    tester.runAllTests()
        .then(report => {
            process.exit(report.summary.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test suite error:', error);
            process.exit(1);
        });
}

module.exports = FinalSystemTester;