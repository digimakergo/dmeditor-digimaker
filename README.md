# Digimaker CMF Widgets for dmeditor 

**Change on basic widgets**

- Support link to digimaker content
- Support image browse to digimaker's image

**New content widgets**
- Content grid
- Embed content
- Carousel
- Gallery


**How to use**

Install
```
npm install dmeditor-digimaker
```

Register widgets
```typescript
//App.tsx
import { toolCarousel, toolEmbedContent, toolContentGallery, toolContentGrid } from "dmeditor-digimaker";


registerTool(toolContentGrid);
registerTool(toolEmbedContent);
registerTool(toolCarousel);
registerTool(toolContentGallery);
```
