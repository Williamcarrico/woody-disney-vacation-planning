type StaticImageData = {
    src: string;
    height: number;
    width: number;
    placeholder?: string;
};

declare module '*.png' {
    const content: StaticImageData;
    export default content;
}

declare module '*.jpg' {
    const content: StaticImageData;
    export default content;
}

declare module '*.jpeg' {
    const content: StaticImageData;
    export default content;
}

declare module '*.gif' {
    const content: StaticImageData;
    export default content;
}

declare module '*.webp' {
    const content: StaticImageData;
    export default content;
}

declare module '*.ico' {
    const content: StaticImageData;
    export default content;
}

declare module '*.bmp' {
    const content: StaticImageData;
    export default content;
}

// SVG as React component (for inline SVG usage)
declare module '*.svg' {
    import React from 'react';
    const content: React.FC<React.SVGProps<SVGSVGElement>>;
    export default content;
}

// SVG as URL string (for src attribute usage)
declare module '*.svg?url' {
    const content: string;
    export default content;
}