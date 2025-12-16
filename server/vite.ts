import { type Express } from "express";
import { createServer as createViteServer, createLogger, type UserConfigExport, type ConfigEnv } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config.ts";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const viteConfigExport = viteConfig as unknown as UserConfigExport | ((env: ConfigEnv) => Promise<UserConfigExport>);
  const resolvedViteConfig =
    typeof viteConfigExport === "function"
      ? await viteConfigExport({
          command: "serve",
          mode: process.env.NODE_ENV || "development",
        })
      : viteConfigExport;

  const vite = await createViteServer({
    ...resolvedViteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Only use Vite middleware for non-API routes
  // Wrap vite.middlewares to skip API routes
  const originalMiddlewares = vite.middlewares;
  const wrappedMiddlewares = (req: any, res: any, next: any) => {
    // Skip API routes completely - let Express handle them
    const path = req.path || req.url || '';
    const originalUrl = req.originalUrl || '';
    
    if (path.startsWith("/api") || originalUrl.startsWith("/api")) {
      console.log(`[Vite] Skipping API route: ${path}`);
      return next();
    }
    
    return originalMiddlewares(req, res, next);
  };
  
  app.use(wrappedMiddlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes - let them be handled by Express routes
    if (url?.startsWith("/api") || req.path?.startsWith("/api")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
