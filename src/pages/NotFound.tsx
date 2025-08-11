import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();

  useSEO({
    title: "SmartRice – 404 Not Found",
    description: "The page you are looking for does not exist.",
    canonicalPath: location.pathname,
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <main className="min-h-[calc(100vh-64px)] grid place-items-center">
      <section className="container max-w-xl text-center">
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Return to Home
        </a>
      </section>
    </main>
  );
};

export default NotFound;
