#!/usr/bin/env node

/**
 * Smriti Atlas Production Build Script
 * Optimizes and prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  buildDir: 'dist',
  sourceDir: 'src',
  publicDir: 'public',
  dataDir: 'public/data',
  optimization: {
    minify: true,
    bundle: true,
    treeshake: true,
    compress: true
  },
  performance: {
    budgets: {
      js: 500, // KB
      css: 200, // KB
      images: 1000 // KB
    }
  }
};

class ProductionBuilder {
  constructor() {
    this.startTime = Date.now();
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

  async checkPrerequisites() {
    this.log('Checking prerequisites...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      this.logError(`Node.js version ${nodeVersion} is not supported. Requires Node.js 18+`);
      return false;
    }
    
    this.log(`Node.js version: ${nodeVersion} ✓`);

    // Check required files
    const requiredFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'src/App.tsx',
      'src/main.tsx'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        this.logError(`Required file missing: ${file}`);
        return false;
      }
    }

    this.log('All required files present ✓');
    return true;
  }

  async cleanBuildDirectory() {
    this.log('Cleaning build directory...');
    
    if (fs.existsSync(CONFIG.buildDir)) {
      fs.rmSync(CONFIG.buildDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(CONFIG.buildDir, { recursive: true });
    this.log('Build directory cleaned ✓');
  }

  async validateDataFiles() {
    this.log('Validating data files...');
    
    const dataFiles = [
      'atlas-core-v1.json',
      'editorial-collections.json',
      'life-phases.json',
      'mood-mappings.json'
    ];

    for (const file of dataFiles) {
      const filePath = path.join(CONFIG.dataDir, file);
      
      if (!fs.existsSync(filePath)) {
        this.logError(`Data file missing: ${file}`);
        return false;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        
        // Validate JSON structure
        if (!parsed || typeof parsed !== 'object') {
          this.logError(`Invalid JSON structure in ${file}`);
          return false;
        }

        // Check file size
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;
        
        if (sizeKB > CONFIG.performance.budgets.images) {
          this.logWarning(`Data file ${file} is large: ${sizeKB.toFixed(1)}KB`);
        }

        this.log(`Data file ${file} validated ✓ (${sizeKB.toFixed(1)}KB)`);
        
      } catch (error) {
        this.logError(`Failed to validate ${file}: ${error.message}`);
        return false;
      }
    }

    return true;
  }

  async optimizeImages() {
    this.log('Optimizing images...');
    
    const imageDir = path.join(CONFIG.publicDir, 'images');
    
    if (!fs.existsSync(imageDir)) {
      this.log('No images directory found, skipping optimization');
      return true;
    }

    const imageFiles = fs.readdirSync(imageDir).filter(file => 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    );

    for (const file of imageFiles) {
      const filePath = path.join(imageDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      
      if (sizeKB > CONFIG.performance.budgets.images) {
        this.logWarning(`Image ${file} exceeds budget: ${sizeKB.toFixed(1)}KB`);
      }
    }

    this.log(`Checked ${imageFiles.length} images ✓`);
    return true;
  }

  async runTypeCheck() {
    this.log('Running TypeScript type check...');
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('TypeScript type check passed ✓');
      return true;
    } catch (error) {
      this.logError('TypeScript type check failed');
      this.logError(error.stdout?.toString() || error.message);
      return false;
    }
  }

  async runLinting() {
    this.log('Running ESLint...');
    
    try {
      execSync('npx eslint src --ext .ts,.tsx --max-warnings 0', { stdio: 'pipe' });
      this.log('ESLint check passed ✓');
      return true;
    } catch (error) {
      this.logError('ESLint check failed');
      this.logError(error.stdout?.toString() || error.message);
      return false;
    }
  }

  async buildApplication() {
    this.log('Building application...');
    
    try {
      // Set production environment
      process.env.NODE_ENV = 'production';
      
      // Run Vite build
      execSync('npm run build', { stdio: 'pipe' });
      
      this.log('Application build completed ✓');
      return true;
    } catch (error) {
      this.logError('Application build failed');
      this.logError(error.stdout?.toString() || error.message);
      return false;
    }
  }

  async analyzeBuildOutput() {
    this.log('Analyzing build output...');
    
    const buildDir = CONFIG.buildDir;
    
    if (!fs.existsSync(buildDir)) {
      this.logError('Build directory not found');
      return false;
    }

    const files = this.getAllFiles(buildDir);
    const analysis = {
      totalSize: 0,
      fileCount: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      otherSize: 0
    };

    for (const file of files) {
      const stats = fs.statSync(file);
      const size = stats.size;
      const ext = path.extname(file).toLowerCase();
      
      analysis.totalSize += size;
      analysis.fileCount++;

      if (ext === '.js') {
        analysis.jsSize += size;
      } else if (ext === '.css') {
        analysis.cssSize += size;
      } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(ext)) {
        analysis.imageSize += size;
      } else {
        analysis.otherSize += size;
      }
    }

    // Convert to KB
    const totalKB = analysis.totalSize / 1024;
    const jsKB = analysis.jsSize / 1024;
    const cssKB = analysis.cssSize / 1024;
    const imgKB = analysis.imageSize / 1024;

    this.log(`Build Analysis:`);
    this.log(`  Total size: ${totalKB.toFixed(1)}KB (${analysis.fileCount} files)`);
    this.log(`  JavaScript: ${jsKB.toFixed(1)}KB`);
    this.log(`  CSS: ${cssKB.toFixed(1)}KB`);
    this.log(`  Images: ${imgKB.toFixed(1)}KB`);
    this.log(`  Other: ${(analysis.otherSize / 1024).toFixed(1)}KB`);

    // Check against budgets
    if (jsKB > CONFIG.performance.budgets.js) {
      this.logWarning(`JavaScript bundle exceeds budget: ${jsKB.toFixed(1)}KB > ${CONFIG.performance.budgets.js}KB`);
    }

    if (cssKB > CONFIG.performance.budgets.css) {
      this.logWarning(`CSS bundle exceeds budget: ${cssKB.toFixed(1)}KB > ${CONFIG.performance.budgets.css}KB`);
    }

    return true;
  }

  getAllFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          traverse(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  async generateBuildReport() {
    this.log('Generating build report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: Date.now() - this.startTime,
      version: this.getPackageVersion(),
      nodeVersion: process.version,
      platform: process.platform,
      errors: this.errors,
      warnings: this.warnings,
      success: this.errors.length === 0
    };

    const reportPath = path.join(CONFIG.buildDir, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Build report saved to ${reportPath} ✓`);
    return report;
  }

  getPackageVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async run() {
    this.log('🚀 Starting Smriti Atlas Production Build');
    this.log('==========================================');

    // Run build steps
    const steps = [
      { name: 'Prerequisites', fn: this.checkPrerequisites },
      { name: 'Clean Directory', fn: this.cleanBuildDirectory },
      { name: 'Validate Data Files', fn: this.validateDataFiles },
      { name: 'Optimize Images', fn: this.optimizeImages },
      { name: 'Type Check', fn: this.runTypeCheck },
      { name: 'Linting', fn: this.runLinting },
      { name: 'Build Application', fn: this.buildApplication },
      { name: 'Analyze Output', fn: this.analyzeBuildOutput }
    ];

    for (const step of steps) {
      this.log(`\n📋 ${step.name}`);
      this.log('-'.repeat(50));
      
      const success = await step.fn.call(this);
      
      if (!success) {
        this.logError(`❌ ${step.name} failed`);
        break;
      }
    }

    // Generate final report
    const report = await this.generateBuildReport();
    
    this.log('\n==========================================');
    if (report.success) {
      this.log('✅ Production build completed successfully!');
      this.log(`⏱️  Build time: ${report.buildTime}ms`);
      this.log(`📦 Version: ${report.version}`);
    } else {
      this.log('❌ Production build failed!');
      this.log(`🚨 Errors: ${report.errors.length}`);
      this.log(`⚠️  Warnings: ${report.warnings.length}`);
    }
    this.log('==========================================');

    return report.success;
  }
}

// Run the build if called directly
if (require.main === module) {
  const builder = new ProductionBuilder();
  builder.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Build script error:', error);
      process.exit(1);
    });
}

module.exports = ProductionBuilder;
