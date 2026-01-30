try {
    require("./dist/index.cjs");
} catch (err) {
    console.error("🔥 APP CRASHED:", err);

    const express = require("express");
    const app = express();

    app.get("*", (req, res) => {
        res.status(500).send(`
      <h1>App crashed</h1>
      <pre>${err.stack}</pre>
    `);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT);
}
