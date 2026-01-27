# Fonts Directory

## Alibaba PuHuiTi 3.0

This directory contains the Alibaba PuHuiTi font family, used for Chinese (Simplified) text rendering.

### Current Setup
- **Format**: TrueType (TTF)
- **Source**: [@fontpkg/alibaba-puhuiti-3-0](https://www.npmjs.com/package/@fontpkg/alibaba-puhuiti-3-0) npm package
- **Weights included**:
  - Regular (400) - AlibabaPuHuiTi-3-55-Regular.ttf (8.2MB)
  - Medium (500) - AlibabaPuHuiTi-3-65-Medium.ttf (8.1MB)
  - SemiBold (600) - AlibabaPuHuiTi-3-75-SemiBold.ttf (8.0MB)
  - Bold (700) - AlibabaPuHuiTi-3-85-Bold.ttf (8.0MB)

### License
Alibaba PuHuiTi is licensed under the Alibaba Inc. Open Font License.
See: https://github.com/Alibaba-inc/Alibaba-PuHuiTi

### Performance Optimization (Future)
Consider converting these TTF files to WOFF2 format for better web performance:
- WOFF2 provides ~30-40% better compression than TTF
- Reduces font file sizes from 8MB to approximately 3MB each
- Tools: `woff2_compress` or online converters

### Updating Fonts
To update to a newer version:
```bash
pnpm add @fontpkg/alibaba-puhuiti-3-0@latest
cp node_modules/.pnpm/@fontpkg+alibaba-puhuiti-3-0@*/node_modules/@fontpkg/alibaba-puhuiti-3-0/AlibabaPuHuiTi-3-*.ttf public/fonts/
```
