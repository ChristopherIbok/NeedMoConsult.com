import { lazy } from "react";

export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem("page-has-been-force-refreshed") || "false"
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem("page-has-been-force-refreshed", "false");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assume that the error was caused by an outdated chunk cache or network change
        // Force refresh the page
        window.sessionStorage.setItem("page-has-been-force-refreshed", "true");
        const url = new URL(window.location.href);
        url.searchParams.set("refresh", Date.now().toString());
        window.location.href = url.toString();
        // Return a promise that never resolves to avoid rendering while reloading
        return new Promise(() => {});
      }

      // The page has already been reloaded, throw to let the nearest Error Boundary handle it
      throw error;
    }
  });
