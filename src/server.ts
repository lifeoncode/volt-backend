import { app } from "./index";

const PORT = process.env.PORT || 4000 || 8000;
app.listen(PORT, () => console.log(`....Server started on ${PORT}....`));
