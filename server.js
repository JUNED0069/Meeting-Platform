console.log("Server.js file is executing");
const { createServer } = require("http");
const next = require("next");

const app = next({
    dev: process.env.NODE_ENV !== "production",
});

const routes = require("./routes");
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
    console.log("Next.js app prepared successfully");
    createServer(handler).listen(5000, (err) => {
        console.log("Creating server...");
        if (err) {
            console.error("Error starting server:", err);
            return;
        }
        console.log("Server started on port 5000");
    });

});

