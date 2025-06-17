import { app } from "./index";

const PORT = process.env.PORT || 4000 || 8000;

const initServer = async () => {
  app.listen(PORT, () => console.log(`....Server's running🚀 -> http://127.0.0.1:${PORT}....`));
};

initServer();
