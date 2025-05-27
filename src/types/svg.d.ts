declare module "*.svg" {
    import React from "react";
    const content: React.FC<React.SVGProps<SVGSVGElement>>;
    export default content;
}

declare module "*.svg?url" {
    const content: string;
    export default content;
}

// Extend JSX intrinsic elements to include SVG elements
declare namespace JSX {
    interface IntrinsicElements {
        svg: React.SVGProps<SVGSVGElement>;
        g: React.SVGProps<SVGGElement>;
        path: React.SVGProps<SVGPathElement>;
        defs: React.SVGProps<SVGDefsElement>;
        filter: React.SVGProps<SVGFilterElement>;
        feFlood: React.SVGProps<SVGFEFloodElement>;
        feColorMatrix: React.SVGProps<SVGFEColorMatrixElement>;
        feOffset: React.SVGProps<SVGFEOffsetElement>;
        feGaussianBlur: React.SVGProps<SVGFEGaussianBlurElement>;
        feComposite: React.SVGProps<SVGFECompositeElement>;
        feBlend: React.SVGProps<SVGFEBlendElement>;
        circle: React.SVGProps<SVGCircleElement>;
        rect: React.SVGProps<SVGRectElement>;
        line: React.SVGProps<SVGLineElement>;
        polyline: React.SVGProps<SVGPolylineElement>;
        polygon: React.SVGProps<SVGPolygonElement>;
        text: React.SVGProps<SVGTextElement>;
        tspan: React.SVGProps<SVGTSpanElement>;
        ellipse: React.SVGProps<SVGEllipseElement>;
        image: React.SVGProps<SVGImageElement>;
        use: React.SVGProps<SVGUseElement>;
        mask: React.SVGProps<SVGMaskElement>;
        clipPath: React.SVGProps<SVGClipPathElement>;
        linearGradient: React.SVGProps<SVGLinearGradientElement>;
        radialGradient: React.SVGProps<SVGRadialGradientElement>;
        stop: React.SVGProps<SVGStopElement>;
        pattern: React.SVGProps<SVGPatternElement>;
        marker: React.SVGProps<SVGMarkerElement>;
        symbol: React.SVGProps<SVGSymbolElement>;
        foreignObject: React.SVGProps<SVGForeignObjectElement>;
        switch: React.SVGProps<SVGSwitchElement>;
        animate: React.SVGProps<SVGAnimateElement>;
        animateMotion: React.SVGProps<SVGAnimateMotionElement>;
        animateTransform: React.SVGProps<SVGAnimateTransformElement>;
        mpath: React.SVGProps<SVGElement>;
        set: React.SVGProps<SVGSetElement>;
    }
}