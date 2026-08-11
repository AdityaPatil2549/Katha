# Smriti Atlas Deployment Guide

## Overview

Smriti Atlas is a progressive web application designed to run entirely offline in the user's browser. This guide covers deployment strategies, requirements, and best practices for production deployment.

## Architecture

### Frontend-Only Architecture
- **Technology Stack**: React 18/19, TypeScript, Vite, TailwindCSS
- **Storage**: IndexedDB (local browser storage)
- **Data**: Pre-loaded JSON datasets
- **Deployment**: Static files (HTML, CSS, JS, JSON)
- **Runtime**: Modern web browser with ES2020+ support

### Key Features
- **Offline-First**: No server dependencies
- **Privacy-First**: All data stored locally
- **Progressive**: Works on desktop and mobile
- **Secure**: No external API calls or data transmission

## Deployment Requirements

### Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Safari**: 14+
- **Chrome Mobile**: 90+

### Server Requirements
- **Static File Hosting**: Any web server capable of serving static files
- **HTTPS**: Required for service workers and IndexedDB
- **Storage**: Minimum 50MB for application files
- **Bandwidth**: Initial load ~5MB, subsequent loads cached

### Optional Enhancements
- **CDN**: For faster global distribution
- **Service Worker**: For offline caching (built-in)
- **Compression**: Gzip/Brotli compression
- **Caching**: Long-term caching headers

## Deployment Methods

### 1. Static Hosting Services

#### Netlify
```bash
# Build the application
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Configuration** (`netlify.toml`):
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.json"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### GitHub Pages
```bash
# Build and deploy to gh-pages
npm run build
npm install -gh-pages -g
gh-pages -d dist
```

### 2. Traditional Web Servers

#### Apache
```apache
# .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/ico "access plus 1 year"
  ExpiresByType image/icon "access plus 1 year"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

#### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache data files
    location ~* \.(json)$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Cloud Storage Services

#### AWS S3 + CloudFront
```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

**S3 Bucket Policy**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**firebase.json**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Build Process

### Production Build
```bash
# Install dependencies
npm install

# Run production build
npm run build

# Run tests (recommended)
npm run test

# Run final system tests
node scripts/final-system-test.js
```

### Build Optimization
The production build includes:
- **Minification**: JavaScript and CSS minification
- **Tree Shaking**: Dead code elimination
- **Bundle Splitting**: Optimized chunk loading
- **Asset Optimization**: Image and font optimization
- **Source Maps**: For debugging (optional)

### Environment Variables
```bash
# Production environment
NODE_ENV=production

# Build configuration
VITE_APP_VERSION=1.0.0
VITE_BUILD_DATE=$(date +%Y-%m-%d)
VITE_COMMIT_HASH=$(git rev-parse --short HEAD)
```

## Security Considerations

### HTTPS Required
- IndexedDB requires HTTPS in production
- Service workers require HTTPS
- Mixed content policies block HTTP resources

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               font-src 'self'; 
               connect-src 'self';">
```

### Security Headers
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin

### Data Privacy
- All data stored locally in IndexedDB
- No external API calls or data transmission
- User data never leaves the browser
- Optional data export/import for backup

## Performance Optimization

### Caching Strategy
- **Static Assets**: 1 year cache with immutable headers
- **Data Files**: 1 day cache for JSON datasets
- **HTML**: No cache for index.html
- **Service Worker**: Offline-first caching

### Bundle Optimization
- **Code Splitting**: Lazy load components
- **Tree Shaking**: Remove unused code
- **Compression**: Gzip/Brotli compression
- **Minification**: Remove whitespace and comments

### Loading Performance
- **Critical CSS**: Inline critical styles
- **Font Loading**: Optimize font loading
- **Image Optimization**: WebP format with fallbacks
- **Preloading**: Preload critical resources

## Monitoring and Analytics

### Performance Monitoring
```javascript
// Built-in performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
```

### Error Tracking
```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service (optional)
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to error tracking service (optional)
});
```

### User Analytics (Optional)
If you want to implement analytics:
- Use privacy-focused analytics (Plausible, Fathom)
- Implement cookie-less tracking
- Respect user privacy preferences
- Provide opt-out options

## Maintenance and Updates

### Version Management
- **Semantic Versioning**: Follow semver for releases
- **Changelog**: Document all changes
- **Migration Scripts**: Handle data format changes
- **Backward Compatibility**: Maintain compatibility when possible

### Update Process
1. **Test**: Run full test suite
2. **Build**: Create production build
3. **Deploy**: Upload to hosting platform
4. **Verify**: Test deployment in staging
5. **Release**: Deploy to production
6. **Monitor**: Check for issues

### Rollback Strategy
- **Previous Version**: Keep previous build available
- **Quick Rollback**: Ability to revert quickly
- **Database Compatibility**: Ensure data compatibility
- **User Communication**: Notify users of changes

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit

# Check ESLint errors
npx eslint src --ext .ts,.tsx
```

#### Deployment Issues
- **404 Errors**: Check routing configuration
- **CORS Issues**: Verify server headers
- **SSL Issues**: Ensure HTTPS is properly configured
- **Performance**: Check bundle size and caching

#### Runtime Issues
- **IndexedDB Errors**: Check browser compatibility
- **Service Worker**: Clear browser cache
- **Memory Issues**: Monitor memory usage
- **Data Corruption**: Implement data validation

### Debugging Tools
- **Browser DevTools**: Console, Network, Application tabs
- **Lighthouse**: Performance and accessibility audit
- **Bundle Analyzer**: Analyze bundle size
- **Network Tab**: Check resource loading

## Support and Documentation

### User Documentation
- **Getting Started Guide**: Step-by-step setup
- **Feature Documentation**: Detailed feature explanations
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions

### Developer Documentation
- **API Documentation**: Component and utility documentation
- **Architecture Overview**: System design and patterns
- **Contributing Guide**: How to contribute to the project
- **Code Style**: Coding standards and best practices

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community discussions and Q&A
- **Wiki**: Community-maintained documentation
- **Examples**: Code examples and use cases

## Conclusion

Smriti Atlas is designed to be simple, secure, and privacy-focused. The deployment process is straightforward due to its frontend-only architecture. Follow this guide to ensure a smooth and secure deployment.

For additional support, refer to the project documentation or create an issue on the GitHub repository.
