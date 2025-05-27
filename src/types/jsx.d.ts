// This file extends JSX intrinsic elements for custom components
// React's built-in JSX types should handle standard HTML elements

import * as React from 'react'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            // Only define custom elements here, let React handle standard HTML elements
            [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
        }
    }
}

export { }