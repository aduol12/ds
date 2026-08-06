import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as showdown from 'showdown';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'DroughtSmart Nest API',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('docs')
  getDocs(): string {
    const markdown = fs.readFileSync('API_DOCUMENTATION.md', 'utf8');
    const converter = new showdown.Converter();
    const html = converter.makeHtml(markdown);
    return `
      <html>
        <head>
          <title>API Documentation</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
            h1, h2, h3 { color: #333; }
            code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
            pre { background-color: #f4f4f4; padding: 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  @Get('docs/advisory')
  getAdvisoryDocs(): string {
    const markdown = fs.readFileSync('ADVISORY_DOCS.md', 'utf8');
    const converter = new showdown.Converter();
    const html = converter.makeHtml(markdown);
    return `
      <html>
        <head>
          <title>Advisory API Documentation</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; color: #333; }
            h1, h2, h3 { color: #2c3e50; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
            code { background-color: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
            pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
            pre code { background-color: transparent; padding: 0; }
            .mermaid { background: white; text-align: center; }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        </head>
        <body>
          ${html}
          <script>
            // Initialize mermaid
            mermaid.initialize({ startOnLoad: true, theme: 'default' });
            
            // Convert showdown code blocks to mermaid divs
            document.querySelectorAll('pre code.language-mermaid, pre code.mermaid').forEach(block => {
              const pre = block.parentElement;
              const div = document.createElement('div');
              div.className = 'mermaid';
              div.textContent = block.textContent;
              pre.replaceWith(div);
            });
            // Re-run init after replacement
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
          </script>
        </body>
      </html>
    `;
  }
}
