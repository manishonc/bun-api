const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/" || url.pathname === "/hello") {
      return new Response("hello world", {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server is running on http://localhost:${server.port}`);

