import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        {/* Script to suppress hydration warnings in production */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Store the original console.error
                  var originalConsoleError = console.error;
                  
                  // Override console.error to filter out hydration warnings
                  console.error = function() {
                    var args = Array.prototype.slice.call(arguments);
                    var isHydrationError = args.some(function(arg) {
                      return typeof arg === 'string' && (
                        arg.includes('Hydration failed because') ||
                        arg.includes('Warning: Text content did not match') ||
                        arg.includes('Warning: An error occurred during hydration') ||
                        arg.includes('There was an error while hydrating') ||
                        arg.includes('Hydration completed but contains mismatches') ||
                        arg.includes('A tree hydrated but some attributes')
                      );
                    });
                    
                    // Don't log hydration errors
                    if (!isHydrationError) {
                      originalConsoleError.apply(console, args);
                    }
                  };
                })();
              `,
            }}
          />
        )}
      </body>
    </Html>
  );
} 